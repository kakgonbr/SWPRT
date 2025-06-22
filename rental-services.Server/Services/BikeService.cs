namespace rental_services.Server.Services
{
    public class BikeService : IBikeService
    {
        private Repositories.IVehicleModelRepository _vehicleModelRepository;
        private Repositories.IVehicleRepository _vehicleRepository;
        private Repositories.IPeripheralRepository _peripheralRepository;
        private AutoMapper.IMapper _mapper;

        public BikeService(Repositories.IVehicleModelRepository vehicleModelRepository, Repositories.IVehicleRepository vehicleRepository, AutoMapper.IMapper mapper, Repositories.IPeripheralRepository peripheralRepository)
        {
            _vehicleModelRepository = vehicleModelRepository;
            _vehicleRepository = vehicleRepository;
            _mapper = mapper;
            _peripheralRepository = peripheralRepository;
        }

        public async Task<List<Models.VehicleModel>> GetVehicleModelsAsync()
        {
            return await _vehicleModelRepository.GetAllAsync();
        }

        public async Task<List<Models.Vehicle>> GetVehiclesAsync()
        {
            return await _vehicleRepository.GetAllAsync();
        }

        public async Task<List<Models.Vehicle>> GetOfModelAsync(Models.VehicleModel model)
        {
            return await _vehicleModelRepository.GetOfModelAsync(model);
        }

        public async Task<List<Models.Vehicle>> GetOfModelAsync(int modelId)
        {
            return await _vehicleModelRepository.GetOfModelAsync(modelId);
        }

        public async Task<List<Models.DTOs.VehicleModelDTO>> GetModelListAsync()
        {
            List<Models.VehicleModel> vehicleModels = await _vehicleModelRepository.GetAllAsync();

            return _mapper.Map<List<Models.DTOs.VehicleModelDTO>>(vehicleModels);
        }

        public async Task<Models.DTOs.VehicleDetailsDTO?> GetVehicleDetails(int modelId)
        {
            Models.VehicleModel? model = await _vehicleModelRepository.GetByIdAsync(modelId);

            if (model is null)
            {
                return null;
            }

            Models.DTOs.VehicleDetailsDTO modelDTO = new();
            _mapper.Map(model, modelDTO);

            return modelDTO;
        }

        public async Task<bool> UpdateVehicleModelAsync(Models.DTOs.VehicleDetailsDTO vehicleModel)
        {
            Models.VehicleModel? dbVehicleModel = await _vehicleModelRepository.GetByIdAsync(vehicleModel.ModelId);

            if (dbVehicleModel is null)
            {
                return false;
            }

            _mapper.Map(vehicleModel, dbVehicleModel);

            dbVehicleModel.Peripherals.Clear();

            if (vehicleModel.Peripherals is not null)
            {
                foreach (var pDto in vehicleModel.Peripherals)
                {
                    dbVehicleModel.Peripherals.Add(_peripheralRepository.AttachPeripheral(pDto.PeripheralId));
                }
            }

            await _vehicleModelRepository.SaveAsync();

            return true;
        }

        public async Task<List<Models.DTOs.VehicleModelDTO>> GetAvailableModelsAsync(DateOnly startDate, DateOnly endDate, string? address)
        {
            var vehicleModels = await _vehicleModelRepository.GetAllEagerShopAsync();
            var result = new List<Models.VehicleModel>();

            foreach (var model in vehicleModels)
            {
                if (!string.IsNullOrEmpty(address) && !model.Shop.Address.Contains(address, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var vehicles = await _vehicleModelRepository.GetOfModelEagerBookingAsync(model.ModelId);
                int availableCount = 0;
                foreach (var vehicle in vehicles)
                {
                    bool isAvailable = true;
                    foreach (var booking in vehicle.Bookings)
                    {
                        if (!(booking.EndDate < startDate || booking.StartDate > endDate))
                        {
                            isAvailable = false;
                            break;
                        }
                    }
                    if (isAvailable)
                        availableCount++;
                }
                if (availableCount > 1)
                {
                    result.Add(model);
                }
            }
            return _mapper.Map<List<Models.DTOs.VehicleModelDTO>>(result);
        }
    }
}
