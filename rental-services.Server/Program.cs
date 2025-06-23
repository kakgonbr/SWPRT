using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using rental_services.Server.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using rental_services.Server.Controllers;
using rental_services.Server.Models;
using rental_services.Server.Services;
using rental_services.Server.Repositories;

namespace rental_services.Server
{
    public class Program
    {
        internal static bool DoSomething()
        {
            return true;
        }

        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            // automapper
            builder.Services.AddAutoMapper(typeof(Utils.DTOMapper));

            // Bind JWT config
            string jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? throw new InvalidOperationException("Environment Variable 'JWT_KEY' not found.");
            string jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? throw new InvalidOperationException("Environment Variable 'JWT_ISSUER' not found.");
            string jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? throw new InvalidOperationException("Environment Variable 'JWT_AUDIENCE' not found.");
            // Add JWT bearer authentication
            builder.Services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    // Validate token information (lifetime, issuer, etc)
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = jwtIssuer,
                        ValidateAudience = true,
                        ValidAudience = jwtAudience,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                        ValidateLifetime = true
                    };
                });
            // TODO: Add policies later for AddAuthorization()
            builder.Services.AddAuthorization(); 
            // Add passsword hasher
            builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
            // Add services to the container.
            builder.Logging.ClearProviders();
            builder.Logging.AddConsole();
            // Add EF Core with SQL Server
            builder.Services.AddDbContext<RentalContext>(options =>
                options.UseSqlServer(Environment.GetEnvironmentVariable("DATABASE_CONNECTION") ?? throw new InvalidOperationException("Environment Variable 'DATABASE_CONNECTION' not found.")));
            // Register services and repositories
            builder.Services
                .AddScoped<IUserRepository, UserRepository>()
                .AddScoped<IUserService, UserService>()
                .AddScoped<IVehicleModelRepository, VehicleModelRepository>()
                .AddScoped<IVehicleRepository, VehicleRepository>()
                .AddScoped<IPeripheralRepository, PeripheralRepository>()
                .AddScoped<IBikeService, BikeService>();
            builder.Services.AddControllers();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowLocalhost3000", policy =>
                {
                    policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Build app
            var app = builder.Build();
            // Use files
            app.UseDefaultFiles();
            app.UseStaticFiles();
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            // Use authentication and authorization
            app.UseRouting();

            app.UseCors("AllowLocalhost3000");

            app.UseAuthentication();
            app.UseAuthorization();
            //
            //app.UseHttpsRedirection(); // nginx handles https
            app.MapControllers();
            app.MapFallbackToFile("/index.html");
            app.Run();
        }
    }
}