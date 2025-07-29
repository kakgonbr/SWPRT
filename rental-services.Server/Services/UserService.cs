using Azure.Core;
using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Repositories;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace rental_services.Server.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IDriverLicenseRepository _licenseRepository;
    private readonly AutoMapper.IMapper _mapper;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository userRepository, AutoMapper.IMapper mapper, ILogger<UserService> logger, IDriverLicenseRepository licenseRepository)
    {
        _userRepository = userRepository;
        _mapper = mapper;
        _logger = logger;
        _licenseRepository = licenseRepository;
    }

    public async Task<UserDto> GetUser(int id)
    {
        return _mapper.Map<UserDto>(await _userRepository.GetById(id));
    }

    public async Task<UserDto> GetUser(string email)
    {
        return _mapper.Map<UserDto>(await _userRepository.GetByEmail(email));
    }

    public async Task<User?> GetUserBySubAsync(string sub)
    {
        return await _userRepository.GetBySub(sub);
    }

    public void CreateUser(User user)
    {
        // Possible business validation goes here
        _userRepository.Add(user);
    }

    public async Task<bool> UpdateUser(UserDto user)
    {
        User? dbUser = await _userRepository.GetById(user.UserId);

        if (dbUser is null)
        {
            return false;
        }

        if (!string.IsNullOrEmpty(user.PhoneNumber) && !Utils.Validator.PhoneNumber(user.PhoneNumber))
        {
            return false;
        }

        if (!Utils.Validator.Email(user.Email))
        {
            return false;
        }

        _mapper.Map(user, dbUser);
        //dbUser.Sub = user.Sub;
        //dbUser.PasswordHash = user.PasswordHash;

        // Possible business logic/validation
        //return await _userRepository.Update(_mapper.Map<User>(user)) != 0;

        return await _userRepository.SaveAsync() != 0;
    }

    public void DeleteUser(int id)
    {
        _userRepository.Delete(id);
    }

    public async Task<ChangePasswordResponse> ChangePasswordAsync(string sub, string currentPassword, string newPassword)
    {
        try
        {
            // Get user from database
            var user = await _userRepository.GetBySub(sub);
            PasswordVerificationResult verificationResult;
            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
            
            if (user == null)
            {
                return new ChangePasswordResponse(false, "User not found");
            }
            if (currentPassword.IsNullOrEmpty() || currentPassword.Equals("") || currentPassword.Equals("NULL", StringComparison.OrdinalIgnoreCase))
            {
                verificationResult = Microsoft.AspNetCore.Identity.PasswordVerificationResult.Success;
            }
            else
            {
                // Verify current password
                verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, currentPassword);
                if (verificationResult == Microsoft.AspNetCore.Identity.PasswordVerificationResult.Failed)
                {
                    return new ChangePasswordResponse(false, "Current password is incorrect");
                }
            }
            if (!Utils.Validator.Password(newPassword))
            {
                return new ChangePasswordResponse(false, "Password must be between 8 to 32 characters, contain a lowercase character, an uppercase character, a number and a special character at least.");
            }

            // Hash new password
            var newPasswordHash = passwordHasher.HashPassword(user, newPassword);

            // Update password in database
            user.PasswordHash = newPasswordHash;
            var updateResult = await _userRepository.Update(user);

            if (updateResult == 0)
            {
                return new ChangePasswordResponse(false, "Failed to update password");
            }

            _logger.LogInformation("Password changed successfully for user {UserId}", sub);
            return new ChangePasswordResponse(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user {UserId}", sub);
            return new ChangePasswordResponse(false, "An error occurred while changing password");
        }
    }

    public async Task<List<UserDto>> GetAll()
    {
        return _mapper.Map<List<UserDto>>(await _userRepository.GetAll());
    }

    public async Task<List<DriverLicenseDto>> GetOwnLicenses(int userId)
    {
        return _mapper.Map<List<DriverLicenseDto>>(await _licenseRepository.GetByUser(userId));
    }

    public async Task<bool> DeleteLicense(int userId, string licenseId)
    {
        return await _licenseRepository.DeleteLicense(userId, licenseId) != 0;
    }
}