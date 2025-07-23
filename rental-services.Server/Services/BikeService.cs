using Microsoft.EntityFrameworkCore;
using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.JavaScript;

namespace rental_services.Server.Services
{
    public class BikeService : IBikeService
    {
        private Repositories.IVehicleModelRepository _vehicleModelRepository;
        private Repositories.IVehicleRepository _vehicleRepository;
        private Repositories.IPeripheralRepository _peripheralRepository;
        private Repositories.IShopRepository _shopRepository;
        private Repositories.IVehicleTypeRepository _vehicleTypeRepository;
        private Repositories.IManufacturerRepository _manufacturerRepository;
        private AutoMapper.IMapper _mapper;
        private readonly ILogger<BikeService> _logger;

        public BikeService(Repositories.IVehicleModelRepository vehicleModelRepository,
            Repositories.IVehicleRepository vehicleRepository, AutoMapper.IMapper mapper,
            Repositories.IPeripheralRepository peripheralRepository, ILogger<BikeService> logger,
            Repositories.IShopRepository shopRepository, Repositories.IVehicleTypeRepository vehicleTypeRepository,
            Repositories.IManufacturerRepository manufacturerRepository
        )
        {
            _vehicleModelRepository = vehicleModelRepository;
            _vehicleRepository = vehicleRepository;
            _mapper = mapper;
            _peripheralRepository = peripheralRepository;
            _logger = logger;
            _shopRepository = shopRepository;
            _vehicleTypeRepository = vehicleTypeRepository;
            _manufacturerRepository = manufacturerRepository;
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

            var incomingIds = vehicleModel.Vehicles?.Select(v => v.VehicleId).ToHashSet() ?? new();
            var toDelete = dbVehicleModel.Vehicles
                .Where(v => !incomingIds.Contains(v.VehicleId))
                .ToList();

            _vehicleRepository.DeleteRange(toDelete);

            if (vehicleModel.Vehicles is not null)
            {
                foreach (var vDto in vehicleModel.Vehicles)
                {
                    var dbVehicle = await _vehicleRepository.GetByIdAsync(vDto.VehicleId);

                    if (dbVehicle is null)
                    {
                        dbVehicle = await _vehicleRepository.AddAsync(_mapper.Map<Vehicle>(vDto));
                    }
                    else
                    {
                        _mapper.Map(vDto, dbVehicle);
                    }

                    dbVehicleModel.Vehicles.Add(dbVehicle);
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

            if (vehicleModel.Vehicles is not null)
            {
                foreach (var vDto in vehicleModel.Vehicles)
                {
                    var dbVehicle = await _vehicleRepository.GetByIdAsync(vDto.VehicleId);

                    if (dbVehicle is null)
                    {
                        dbVehicle = await _vehicleRepository.AddAsync(_mapper.Map<Vehicle>(vDto));
                    }
                    else
                    {
                        _mapper.Map(vDto, dbVehicle);
                    }

                    newModel.Vehicles.Add(dbVehicle);
                }
            }

            return await _vehicleModelRepository.SaveAsync() != 0;
        }

        public async Task<List<Models.DTOs.VehicleModelDTO>> GetAvailableModelsAsync(DateOnly? startDate,
            DateOnly? endDate, string? address, string? searchTerm)
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
                //if (!string.IsNullOrEmpty(address) && !model.Shop.Address.Contains(address, StringComparison.OrdinalIgnoreCase))
                //{
                //    continue;
                //}

                var shopList = model.Vehicles.Select(v => v.Shop).ToList();

                if (!string.IsNullOrEmpty(address) &&
                    !shopList.Any(s => s.Address.Contains(address, StringComparison.OrdinalIgnoreCase)))
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
                        if (!(booking.EndDate < startDate || booking.StartDate > endDate) || booking.Status == Utils.Config.BookingStatus.Upcoming || booking.Status == Utils.Config.BookingStatus.Active)
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

        public async Task<int?> AssignAvailableVehicleAsync(int modelId, DateOnly startDate, DateOnly endDate,
            string? shopLocation)
        {
            var vehicles = await _vehicleModelRepository.GetOfModelEagerBookingAsync(modelId);

            if (!string.IsNullOrEmpty(shopLocation))
            {
                vehicles = vehicles
                    .Where(v => v.Shop.Address.Contains(shopLocation, StringComparison.OrdinalIgnoreCase)).ToList();
            }

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
                {
                    return vehicle.VehicleId;
                }
            }

            return null;
        }

        public async Task<bool> AddPhysicalAsync(int modelId, Models.DTOs.VehicleDTO vehicle)
        {
            Models.Vehicle dbVehicle = _mapper.Map<Models.Vehicle>(vehicle);
            dbVehicle.ModelId = modelId;
            dbVehicle.VehicleId = 0;

            return await _vehicleRepository.AddAsync(dbVehicle) != null;
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
                //.Where(vm => vm.Shop.Equals(shop, StringComparison.OrdinalIgnoreCase))
                .Where(vm => vm.Shops.Any(s => s.Equals(shop, StringComparison.OrdinalIgnoreCase)))
                .ToList();
        }

        public async Task<List<ShopDTO>> GetAllShopsAsync()
        {
            return _mapper.Map<List<ShopDTO>>(await _shopRepository.GetAllAsync());
        }

        public async Task<List<ManufacturerDTO>> GetAllManufacturersAsync()
        {
            return _mapper.Map<List<ManufacturerDTO>>(await _manufacturerRepository.GetAllAsync());
        }

        public async Task<List<VehicleTypeDTO>> GetAllVehicleTypesAsync()
        {
            return _mapper.Map<List<VehicleTypeDTO>>(await _vehicleTypeRepository.GetAllAsync());
        }

        public async Task<List<PeripheralDTO>> GetAllPeripheralsAsync()
        {
            return _mapper.Map<List<PeripheralDTO>>(await _peripheralRepository.GetAllAsync());
        }
    }
}