namespace rental_services.Server.Services
{
    public class RentalService : IRentalService
    {
        private Repositories.IBookingRepository _bookingRepository;
        private Repositories.IPeripheralRepository _peripheralRepository;
        private AutoMapper.IMapper _mapper;

        public RentalService(Repositories.IBookingRepository bookingRepository, AutoMapper.IMapper mapper, Repositories.IPeripheralRepository peripheralRepository)
        {
            _bookingRepository = bookingRepository;
            _mapper = mapper;
            _peripheralRepository = peripheralRepository;
        }

        public async Task<List<Models.DTOs.BookingDTO>> GetAllBookingsAsync()
        {
            return _mapper.Map<List<Models.DTOs.BookingDTO>>(await _bookingRepository.GetAllAsync());
        }

        public async Task<List<Models.DTOs.BookingDTO>> GetOfUserAsync(int userId)
        {
            return _mapper.Map<List<Models.DTOs.BookingDTO>>(await _bookingRepository.GetOfUserAsync(userId));
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            return await _bookingRepository.UpdateStatusAsync(id, status) != 0;
        }
    }
}
