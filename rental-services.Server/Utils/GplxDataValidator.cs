using System.Text.RegularExpressions;
using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Utils
{
    public class GplxDataValidator
    {
        public class ValidationResult
        {
            public bool IsValid { get; set; }
            public List<string> Errors { get; set; } = new List<string>();
            public List<string> Warnings { get; set; } = new List<string>();
        }

        public ValidationResult ValidateAndClean(GplxData data)
        {
            var result = new ValidationResult { IsValid = true };

            // Validate và clean từng field
            data.FullName = ValidateAndCleanFullName(data.FullName, result);
            data.DateOfBirth = ValidateAndCleanDateOfBirth(data.DateOfBirth, result);
            data.LicenseNumber = ValidateAndCleanLicenseNumber(data.LicenseNumber, result);
            data.LicenseClass = ValidateAndCleanLicenseClass(data.LicenseClass, result);
            data.Address = ValidateAndCleanAddress(data.Address, result);
            data.DateOfIssue = ValidateAndCleanDateOfIssue(data.DateOfIssue, result);

            return result;
        }

        private string? ValidateAndCleanFullName(string? name, ValidationResult result)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                result.Errors.Add("Họ tên không được để trống");
                result.IsValid = false;
                return null;
            }

            // Clean: bỏ khoảng trắng thừa
            name = Regex.Replace(name, @"\s+", " ").Trim();

            // Kiểm tra độ dài
            if (name.Length < 2)
            {
                result.Errors.Add("Họ tên phải có ít nhất 2 ký tự");
                result.IsValid = false;
                return null;
            }

            if (name.Length > 100)
            {
                result.Errors.Add("Họ tên không được quá 100 ký tự");
                result.IsValid = false;
                return null;
            }

            // Kiểm tra ký tự đặc biệt không hợp lệ
            if (Regex.IsMatch(name, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]"))
            {
                result.Errors.Add("Họ tên không được chứa ký tự đặc biệt");
                result.IsValid = false;
                return null;
            }

            // Kiểm tra có chứa số không
            if (Regex.IsMatch(name, @"\d"))
            {
                result.Errors.Add("Họ tên không được chứa số");
                result.IsValid = false;
                return null;
            }

            // Chuẩn hóa: viết hoa chữ cái đầu
            name = NormalizeName(name);

            return name;
        }

        private string? ValidateAndCleanDateOfBirth(string? dateOfBirth, ValidationResult result)
        {
            if (string.IsNullOrWhiteSpace(dateOfBirth))
            {
                result.Errors.Add("Ngày sinh không được để trống");
                result.IsValid = false;
                return null;
            }

            // Kiểm tra format ngày tháng
            if (!DateTime.TryParse(dateOfBirth, out DateTime parsedDate))
            {
                result.Errors.Add("Ngày sinh không đúng định dạng");
                result.IsValid = false;
                return null;
            }

            // Kiểm tra ngày sinh không thể trong tương lai
            if (parsedDate > DateTime.Now)
            {
                result.Errors.Add("Ngày sinh không thể trong tương lai");
                result.IsValid = false;
                return null;
            }

            // Kiểm tra tuổi hợp lý (ít nhất 16 tuổi, nhiều nhất 120 tuổi)
            var age = DateTime.Now.Year - parsedDate.Year;
            if (parsedDate > DateTime.Now.AddYears(-age)) age--;

            if (age < 16)
            {
                result.Errors.Add("Tuổi phải từ 16 trở lên để có bằng lái");
                result.IsValid = false;
                return null;
            }

            if (age > 120)
            {
                result.Errors.Add("Ngày sinh không hợp lý");
                result.IsValid = false;
                return null;
            }

            // Trả về format ISO
            return parsedDate.ToString("yyyy-MM-dd");
        }

        private string? ValidateAndCleanLicenseNumber(string? licenseNumber, ValidationResult result)
        {
            if (string.IsNullOrWhiteSpace(licenseNumber))
            {
                result.Errors.Add("Số bằng lái không được để trống");
                result.IsValid = false;
                return null;
            }

            // Clean: bỏ khoảng trắng và ký tự đặc biệt
            licenseNumber = Regex.Replace(licenseNumber, @"[^\d]", "");

            // Kiểm tra đúng 12 chữ số
            if (!Regex.IsMatch(licenseNumber, @"^\d{12}$"))
            {
                result.Errors.Add("Số bằng lái phải có đúng 12 chữ số");
                result.IsValid = false;
                return null;
            }

            return licenseNumber;
        }

        private string? ValidateAndCleanLicenseClass(string? licenseClass, ValidationResult result)
        {
            if (string.IsNullOrWhiteSpace(licenseClass))
            {
                result.Errors.Add("Hạng bằng lái không được để trống");
                result.IsValid = false;
                return null;
            }

            // Clean: bỏ khoảng trắng và chuyển thành chữ hoa
            licenseClass = licenseClass.Trim().ToUpper();

            // Kiểm tra format hạng bằng lái (A, A1, A2, B1, B2, C, D, E, F)
            if (!Regex.IsMatch(licenseClass, @"^[A-F][0-9]?$"))
            {
                result.Errors.Add("Hạng bằng lái không đúng định dạng (A, A1, A2, B1, B2, C, D, E, F)");
                result.IsValid = false;
                return null;
            }

            return licenseClass;
        }

        private string? ValidateAndCleanAddress(string? address, ValidationResult result)
        {
            if (string.IsNullOrWhiteSpace(address))
            {
                result.Warnings.Add("Địa chỉ đang trống");
                return null;
            }

            // Clean: bỏ khoảng trắng thừa
            address = Regex.Replace(address, @"\s+", " ").Trim();

            // Kiểm tra độ dài
            if (address.Length < 5)
            {
                result.Warnings.Add("Địa chỉ quá ngắn, có thể không chính xác");
            }

            if (address.Length > 200)
            {
                result.Errors.Add("Địa chỉ không được quá 200 ký tự");
                result.IsValid = false;
                return null;
            }

            // Chuẩn hóa dấu câu
            address = NormalizeAddress(address);

            return address;
        }

        private string? ValidateAndCleanDateOfIssue(string? dateOfIssue, ValidationResult result)
        {
            if (string.IsNullOrWhiteSpace(dateOfIssue))
            {
                result.Warnings.Add("Ngày cấp đang trống");
                return null;
            }

            // Kiểm tra format ngày tháng
            if (!DateTime.TryParse(dateOfIssue, out DateTime parsedDate))
            {
                result.Errors.Add("Ngày cấp không đúng định dạng");
                result.IsValid = false;
                return null;
            }

            // Kiểm tra ngày cấp không thể trong tương lai
            if (parsedDate > DateTime.Now)
            {
                result.Errors.Add("Ngày cấp không thể trong tương lai");
                result.IsValid = false;
                return null;
            }

            // Kiểm tra ngày cấp không thể quá xa trong quá khứ (100 năm)
            if (parsedDate < DateTime.Now.AddYears(-100))
            {
                result.Errors.Add("Ngày cấp không hợp lý");
                result.IsValid = false;
                return null;
            }

            // Trả về format ISO
            return parsedDate.ToString("yyyy-MM-dd");
        }

        private string NormalizeName(string name)
        {
            // Chuyển thành chữ thường trước
            name = name.ToLower();
            
            // Viết hoa chữ cái đầu của mỗi từ
            var words = name.Split(' ');
            for (int i = 0; i < words.Length; i++)
            {
                if (words[i].Length > 0)
                {
                    words[i] = char.ToUpper(words[i][0]) + words[i].Substring(1);
                }
            }
            
            return string.Join(" ", words);
        }

        private string NormalizeAddress(string address)
        {
            // Chuẩn hóa dấu câu
            address = address.Replace(" ,", ",").Replace(", ", ",");
            address = address.Replace(" .", ".").Replace(". ", ".");
            address = address.Replace(" -", "-").Replace("- ", "-");
            
            // Bỏ khoảng trắng thừa
            address = Regex.Replace(address, @"\s+", " ").Trim();
            
            return address;
        }
    }
} 