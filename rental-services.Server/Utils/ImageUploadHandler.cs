namespace rental_services.Server.Utils
{
    public static class ImageUploadHandler
    {
        /// <summary>
        /// Saves image at the directory stated in config<br></br>
        /// Upon failure, instead of the image's name, an error string starting with "Failed" will be returned.
        /// </summary>
        /// <param name="image"></param>
        /// <returns></returns>
        public static async Task<string> Upload(IFormFile image)
        {

            if (image == null || image.Length == 0)
            {
                return "Failed: No file uploaded.";
            }

            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (extension != ".jpg" && extension != ".png" && extension != ".jpeg")
            {
                return "Failed: Only JPG/PNG files are allowed.";
            }

            string timeStamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
            string randomPart = new Random().Next(1000, 9999).ToString();
            string uniqueName = $"{timeStamp}_{randomPart}{extension}";
            string filePath = Path.Combine(Config.Image.ImagePath, uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            return uniqueName;
        }
    }
}
