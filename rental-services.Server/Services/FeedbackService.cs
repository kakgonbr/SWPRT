using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Repositories;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace rental_services.Server.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IFeedbackRepository _repository;

        public FeedbackService(IFeedbackRepository repository)
        {
            _repository = repository;
        }

        public async Task<FeedbackDTO> SubmitFeedbackAsync(FeedbackDTO feedbackDto, IFormFile? screenshot, string requestScheme, string requestHost)
        {
            var feedback = new Feedback
            {
                UserId = feedbackDto.UserId ?? 0,
                Title = feedbackDto.Title,
                Body = feedbackDto.Body,
                ImagePath = null
            };

            if (screenshot != null && screenshot.Length > 0)
            {
                // var imagesDir = Path.Combine("wwwroot", "images");
                  var imagesDir = rental_services.Server.Utils.Config.Image.ImagePath;

                if (!Directory.Exists(imagesDir))
                {
                    Directory.CreateDirectory(imagesDir);
                }
                var fileName = $"{DateTime.Now:yyyyMMddHHmmssfff}_{Guid.NewGuid()}{Path.GetExtension(screenshot.FileName)}";
                var savePath = Path.Combine(imagesDir, fileName);
                using (var stream = new FileStream(savePath, FileMode.Create))
                {
                    await screenshot.CopyToAsync(stream);
                }
                var imageUrl = $"{requestScheme}://{requestHost}/images/{fileName}";
                feedback.ImagePath = imageUrl;
            }

            await _repository.AddAsync(feedback);

            return new FeedbackDTO
            {
                FeedBackId = feedback.FeedBackId,
                UserId = feedback.UserId,
                Title = feedback.Title,
                Body = feedback.Body,
                ImagePath = feedback.ImagePath
            };
        }

        public async Task<List<FeedbackDTO>> GetAllFeedbackAsync()
        {
            var feedbacks = await _repository.GetAllWithUserAsync();
            return feedbacks.Select(f => new FeedbackDTO
            {
                FeedBackId = f.FeedBackId,
                UserId = f.UserId,
                Title = f.Title,
                Body = f.Body,
                ImagePath = f.ImagePath,
                CustomerName = f.User.FullName ?? "",
                CustomerEmail = f.User.Email
            }).ToList();
        }

        public async Task<List<FeedbackDTO>> SearchFeedbackAsync(string query)
        {
            var feedbacks = await _repository.SearchAsync(query);
            return feedbacks.Select(f => new FeedbackDTO
            {
                FeedBackId = f.FeedBackId,
                UserId = f.UserId,
                Title = f.Title,
                Body = f.Body,
                ImagePath = f.ImagePath,
                CustomerName = f.User.FullName ?? "",
                CustomerEmail = f.User.Email
            }).ToList();
        }
    }
} 
