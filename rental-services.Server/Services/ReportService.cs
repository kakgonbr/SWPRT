using AutoMapper;
using Microsoft.IdentityModel.Tokens;
using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Repositories;
using rental_services.Server.Utils;

namespace rental_services.Server.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;
        private readonly IMapper _mapper;
        public ReportService(IReportRepository reportRepository, IMapper mapper)
        {
            _reportRepository = reportRepository;
            _mapper = mapper;
        }
        public async Task<bool> CreateReportAsync(ReportDTO reportDTO)
        {
            var report = _mapper.Map<Report>(reportDTO);
            return await _reportRepository.CreateReportAsync(report) > 0 ? true : false;
        }

        public async Task<List<ReportDTO>> GetAllReportsAsync()
        {
            var reports = await _reportRepository.GetAllReportsAsync();
            return _mapper.Map<List<ReportDTO>>(reports);
        }

        public async Task<ReportDTO?> GetReportByIdAsync(int reportId)
        {
            var report = await _reportRepository.GetReportByIdAsync(reportId);
            return report == null ? null : _mapper.Map<ReportDTO>(report);
        }

        public async Task<List<ReportDTO>> GetReportsPaginatedAsync(int page, int pageSize)
        {
            if (page < 0 || pageSize < 0)
                return [];
            var reports = await _reportRepository.GetReportsPaginatedAsync(page, pageSize);
            return _mapper.Map<List<ReportDTO>>(reports);
        }

        public async Task<bool> UpdateReportAsync(ReportDTO reportDTO)
        {
            var chat = _mapper.Map<Report>(reportDTO);
            if (chat is null)
                return false;
            return await _reportRepository.UpdateReportAsync(chat) > 0 ? true : false;
        }
    }
}
