using System.Text.RegularExpressions;
using rental_services.Server.Models.DTOs;

  namespace rental_services.Server.Utils{
    // Class chuyên để xử lý văn bản thô từ OCR
    public class GplxParser
    {
        private readonly List<string> _lines;
        private readonly string _rawText;

        public GplxParser(string rawOcrText)
        {
            _rawText = rawOcrText;
            _lines = rawOcrText.Split('\n')
                .Select(l => l.Trim())
                .Where(l => !string.IsNullOrWhiteSpace(l))
                .ToList();
        }

        public GplxData Parse()
        {
            return new GplxData
            {
                FullName = ParseFullName(),
                DateOfBirth = ParseDateOfBirth(),
                LicenseNumber = ParseLicenseNumber(),
                LicenseClass = ParseLicenseClass(),
                Address = ParseAddress(),
                DateOfIssue = ParseDateOfIssue()
            };
        }

       
        private string? ParseFullName()
        {
            var nameLine = _lines.FirstOrDefault(l => l.Contains("Họ tên") || l.Contains("Họ và tên") || l.Contains("Full name"));
            if (string.IsNullOrEmpty(nameLine)) return null;

            // Tìm vị trí nhãn
            var idx = nameLine.IndexOf("Full name");
            if (idx == -1) idx = nameLine.IndexOf("Họ tên");
            if (idx == -1) idx = nameLine.IndexOf("Họ và tên");
            if (idx == -1) return null;

            // Lấy phần sau nhãn (bỏ luôn dấu : nếu có)
            var afterLabel = nameLine.Substring(idx);
            afterLabel = afterLabel.Replace("Họ tên", "", StringComparison.OrdinalIgnoreCase)
                           .Replace("Họ và tên", "", StringComparison.OrdinalIgnoreCase)
                           .Replace("Full name", "", StringComparison.OrdinalIgnoreCase)
                           .TrimStart(':', ' ', '\t');
            return afterLabel.Trim();
        }

        private string? ParseDateOfBirth()
        {
            var dobLine = _lines.FirstOrDefault(l => l.Contains("Ngày sinh") || l.Contains("Date of Birth"));
            return ExtractDate(dobLine);
        }
        
        private string? ParseDateOfIssue()
        {
            var preprocessedText = _rawText.Replace("nonth", "tháng").Replace("Aear", "năm");
            var match = Regex.Match(preprocessedText, @"ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return $"{match.Groups[3].Value}-{match.Groups[2].Value.PadLeft(2, '0')}-{match.Groups[1].Value.PadLeft(2, '0')}";
            }
            return null;
        }

        private string? ParseLicenseNumber()
        {
            var match = Regex.Match(_rawText, @"\b\d{12}\b");
            return match.Success ? match.Value : null;
        }

        private string? ParseLicenseClass()
        {
            var classLine = _lines.FirstOrDefault(l => l.Contains("Hạng") || l.Contains("Class"));
            if (string.IsNullOrEmpty(classLine)) return null;

            var match = Regex.Match(classLine, @"\b([A-Z][0-9]?)\b");
            return match.Success ? match.Value : null;
        }

        private string? ParseAddress()
        {
            int addressIndex = _lines.FindIndex(l => l.Contains("Nơi cư trú") || l.Contains("Address"));
            if (addressIndex != -1 && addressIndex + 1 < _lines.Count)
            {
                return _lines[addressIndex + 1].Trim();
            }
            return null;
        }

        private string? ExtractDate(string? line)
        {
            if (string.IsNullOrEmpty(line)) return null;

            var match = Regex.Match(line, @"(\d{1,2})[./-](\d{1,2})[./-](\d{4})");
            if (match.Success)
            {
                return $"{match.Groups[3].Value}-{match.Groups[2].Value.PadLeft(2, '0')}-{match.Groups[1].Value.PadLeft(2, '0')}";
            }
            return null;
        }
    }
} 