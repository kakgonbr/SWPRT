using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Repositories;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

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
                var imagesDir = Path.Combine("wwwroot", "images");
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
    }
} 