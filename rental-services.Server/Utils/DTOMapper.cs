using AutoMapper;
using Microsoft.IdentityModel.Tokens;
using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Utils
{
    public class DTOMapper : Profile
    {
        public DTOMapper()
        {
            // database to list view
            CreateMap<VehicleModel, VehicleModelDTO>()
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(
                src => $"{src.Manufacturer.ManufacturerName} {src.ModelName}"
            ))
            .ForMember(dest => dest.VehicleType, opt => opt.MapFrom(
                src => src.VehicleType.VehicleTypeName
            ))
            .ForMember(dest => dest.Shop, opt => opt.MapFrom(
                src => src.Shop.Address
            ))
            .ForMember(dest => dest.Rating, opt => opt.MapFrom(
                src => src.Reviews.Any()
                    ? Math.Round(src.Reviews.Average(r => r.Rate), 1)
                    : 0
            ));

            // database to detailed view
            CreateMap<VehicleModel, VehicleDetailsDTO>()
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(
                src => $"{src.Manufacturer.ManufacturerName} {src.ModelName}"
            ))
            .ForMember(dest => dest.Rating, opt => opt.MapFrom(
                src => src.Reviews.Any()
                    ? Math.Round(src.Reviews.Average(r => r.Rate), 1)
                    : 0
            ))
            .ForMember(dest => dest.VehicleType, opt => opt.MapFrom(
                src => src.VehicleType.VehicleTypeName
            ))
            .ForMember(dest => dest.Shop, opt => opt.MapFrom(
                src => src.Shop.Address
            ))
            .ForMember(dest => dest.Peripherals, opt => opt.MapFrom(
                src => src.Peripherals.Select(p => new PeripheralDTO
                {
                    PeripheralId = p.PeripheralId,
                    Name = p.Name
                })
            ))
            .ForMember(dest => dest.NumOfAvailable, opt => opt.MapFrom(
                src => src.Vehicles.IsNullOrEmpty() ? 0 : src.Vehicles.Count
            ));

            // admin detailed view to database
            CreateMap<VehicleDetailsDTO, VehicleModel>()
            .ForMember(dest => dest.Peripherals, opt => opt.Ignore()) // handled manually
            .ForMember(dest => dest.Vehicles, opt => opt.Ignore())
            .ForMember(dest => dest.Reviews, opt => opt.Ignore())
            .ForMember(dest => dest.Manufacturer, opt => opt.Ignore())
            .ForMember(dest => dest.Shop, opt => opt.Ignore())
            .ForMember(dest => dest.VehicleType, opt => opt.Ignore())
            .ForMember(dest => dest.PeripheralsNavigation, opt => opt.Ignore());

            // back and forth
            CreateMap<Vehicle, VehicleDTO>();
            CreateMap<VehicleDTO, Vehicle>()
            .ForMember(dest => dest.ModelId, opt => opt.Ignore());
        }
    }
}
