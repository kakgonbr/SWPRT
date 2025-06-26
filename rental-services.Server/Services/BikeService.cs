using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services
{
    public class BikeService : IBikeService
    {
        private Repositories.IVehicleModelRepository _vehicleModelRepository;
        private Repositories.IVehicleRepository _vehicleRepository;
        private Repositories.IPeripheralRepository _peripheralRepository;
        private AutoMapper.IMapper _mapper;
        private readonly ILogger<BikeService> _logger;

        public BikeService(Repositories.IVehicleModelRepository vehicleModelRepository, Repositories.IVehicleRepository vehicleRepository, AutoMapper.IMapper mapper, Repositories.IPeripheralRepository peripheralRepository, ILogger<BikeService> logger)
        {
            _vehicleModelRepository = vehicleModelRepository;
            _vehicleRepository = vehicleRepository;
            _mapper = mapper;
            _peripheralRepository = peripheralRepository;
            _logger = logger;
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

        public async Task<List<Models.DTOs.VehicleDTO>> GetDTOOfModelAsync(Models.VehicleModel model)
        {
            List<Models.Vehicle> vehicles = await GetOfModelAsync(model);

            return _mapper.Map<List<Models.DTOs.VehicleDTO>>(vehicles);
        }

        public async Task<List<Models.DTOs.VehicleDTO>> GetDTOOfModelAsync(int modelId)
        {
            List<Models.Vehicle> vehicles = await GetOfModelAsync(modelId);

            return _mapper.Map<List<Models.DTOs.VehicleDTO>>(vehicles);
        }

        public async Task<bool> UpdatePhysicalAsync(Models.DTOs.VehicleDTO vehicle)
        {
            Models.Vehicle? dbVehicle = await _vehicleRepository.GetByIdAsync(vehicle.VehicleId);

            if (dbVehicle is null)
            {
                return false;
            }

            _mapper.Map(vehicle, dbVehicle);
            await _vehicleRepository.SaveAsync();

            return true;
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

            return _mapper.Map<Models.DTOs.VehicleDetailsDTO>(model);
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
                    var dbPeripheral = await _peripheralRepository.GetByIdAsync(pDto.PeripheralId);
                    if (dbPeripheral is null)
                    {
                        continue;
                    }

                    dbVehicleModel.Peripherals.Add(dbPeripheral);
                }
            }

            await _vehicleModelRepository.SaveAsync();

            return true;
        }

        public async Task<bool> DeleteVehicleModel(int modelId)
        {
            Models.VehicleModel? dbVehicleModel = await _vehicleModelRepository.GetByIdAsync(modelId);

            if (dbVehicleModel is null)
            {
                return false;
            }

            dbVehicleModel.IsAvailable = false;


            return await _vehicleModelRepository.SaveAsync() != 0;
        }

        public async Task<bool> AddVehicleModel(Models.DTOs.VehicleDetailsDTO vehicleModel)
        {
            Models.VehicleModel newModel = new();

            _mapper.Map(vehicleModel, newModel);

            if (await _vehicleModelRepository.AddAsync(newModel) == 0)
            {
                return false;
            }

            if (vehicleModel.Peripherals is not null)
            {
                foreach (var pDto in vehicleModel.Peripherals)
                {
                    var dbPeripheral = await _peripheralRepository.GetByIdAsync(pDto.PeripheralId);
                    if (dbPeripheral is null)
                    {
                        continue;
                    }

                    newModel.Peripherals.Add(dbPeripheral);
                }
            }

            return await _vehicleModelRepository.SaveAsync() != 0;
        }

        public async Task<List<Models.DTOs.VehicleModelDTO>> GetAvailableModelsAsync(DateOnly? startDate, DateOnly? endDate, string? address, string? searchTerm)
        {
            if (startDate == null || endDate == null || startDate.Value > endDate.Value)
            {
                throw new ArgumentException("Start date cannot be after end date or one of them are null");
            }
            List<VehicleModel> vehicleModels;
            if (string.IsNullOrEmpty(searchTerm))
            {
                vehicleModels = await _vehicleModelRepository.GetAllEagerShopTypeAsync();
            }
            else
            {
                vehicleModels = await _vehicleModelRepository.GetAllEagerShopTypeAsync(searchTerm);
            }
            var result = new List<VehicleModel>();
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

        public async Task<bool> AddPhysicalAsync(int modelId, Models.DTOs.VehicleDTO vehicle)
        {
            Models.Vehicle dbVehicle = _mapper.Map<Models.Vehicle>(vehicle);
            dbVehicle.ModelId = modelId;
            dbVehicle.VehicleId = 0;

            return await _vehicleRepository.AddAsync(dbVehicle) != 0;
        }

        public async Task<bool> DeletePhysicalAsync(int id)
        {
            return await _vehicleRepository.DeleteAsync(id) != 0;
        }
        
        public List<VehicleModelDTO> FilterModelByVehicleType(List<VehicleModelDTO> vehicleModels, string? type)
        {
            if (string.IsNullOrEmpty(type))
            {
                return vehicleModels;
            }
            return vehicleModels
                .Where(vm => vm.VehicleType.Equals(type, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        public List<VehicleModelDTO> FilterModelByShop(List<VehicleModelDTO> vehicleModels, string? shop)
        {
            if (string.IsNullOrEmpty(shop))
            {
                return vehicleModels;
            }
            return vehicleModels
                .Where(vm => vm.Shop.Equals(shop, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
    }
}
