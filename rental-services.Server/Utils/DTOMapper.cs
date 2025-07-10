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
            .ForMember(dest => dest.Shops, opt => opt.MapFrom(
                src => src.Vehicles.GroupBy(v => v.Shop.Address).Select(g => g.First().Shop.Address).ToList()
            ))
            .ForMember(dest => dest.Rating, opt => opt.MapFrom(
                src => src.Reviews.Any()
                    ? Math.Round(src.Reviews.Average(r => r.Rate), 1)
                    : 0
            ))
            .ForMember(dest => dest.Quantity, opt => opt.MapFrom(
                src => src.Vehicles.Count    
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
            //.ForMember(dest => dest.Shop, opt => opt.MapFrom(
            //    src => src.Shop.Address
            //))
            //.ForMember(dest => dest.Peripherals, opt => opt.MapFrom(
            //    src => src.Peripherals.Select(p => new PeripheralDTO
            //    {
            //        PeripheralId = p.PeripheralId,
            //        Name = p.Name
            //    })
            //))
            .ForMember(dest => dest.NumOfAvailable, opt => opt.MapFrom(
                src => src.Vehicles.IsNullOrEmpty() ? 0 : src.Vehicles.Count
            ));

            // admin detailed view to database
            CreateMap<VehicleDetailsDTO, VehicleModel>()
            .ForMember(dest => dest.Peripherals, opt => opt.Ignore()) // handled manually
            .ForMember(dest => dest.Vehicles, opt => opt.Ignore()) // also handled manually
            .ForMember(dest => dest.Reviews, opt => opt.Ignore())
            .ForMember(dest => dest.Manufacturer, opt => opt.Ignore())
            //.ForMember(dest => dest.Shop, opt => opt.Ignore())
            .ForMember(dest => dest.VehicleType, opt => opt.Ignore()) // changed by setting id instead.
            .ForMember(dest => dest.PeripheralsNavigation, opt => opt.Ignore());

            // shop
            CreateMap<Shop, ShopDTO>();
            CreateMap<ShopDTO, Shop>()
            .ForMember(dest => dest.Shopid, opt => opt.Ignore());

            // back and forth
            CreateMap<Vehicle, VehicleDTO>();
            CreateMap<VehicleDTO, Vehicle>()
            .ForMember(dest => dest.ModelId, opt => opt.Ignore());

            CreateMap<Peripheral, PeripheralDTO>();
            CreateMap<PeripheralDTO, Peripheral>();

            CreateMap<ChatDTO, Chat>()
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Staff, opt => opt.Ignore())
                .ForMember(dest => dest.ChatMessages, opt => opt.Ignore());
            CreateMap<Chat, ChatDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.StaffName, opt => opt.MapFrom(src => src.Staff != null ? src.Staff.FullName : string.Empty))
                .ForMember(dest => dest.HasNewCustomerMessage, opt => opt.Ignore());

            CreateMap<ChatMessage, ChatMessageDTO>()
               .ForMember(dest => dest.SendTime, opt => opt.MapFrom(src => src.SendTime));
                   
            // rental
            // database to view
            // to eagerly load: user, vehicle, model (from vehicle), manufacturer (from model), payments
            CreateMap<Booking, BookingDTO>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(
                src => src.BookingId.ToString()
            ))
            .ForMember(dest => dest.BikeName, opt => opt.MapFrom(
                src => $"{src.Vehicle.Model.Manufacturer.ManufacturerName} {src.Vehicle.Model.ModelName}"
            ))
            .ForMember(dest => dest.BikeImageUrl, opt => opt.MapFrom(
                src => src.Vehicle.Model.ImageFile
            ))
            .ForMember(dest => dest.CustomerPhone, opt => opt.MapFrom(
                src => src.User.PhoneNumber
            ))
            .ForMember(dest => dest.OrderDate, opt => opt.MapFrom(
                src => src.Payments.FirstOrDefault() == null ? null : (DateOnly?)src.Payments.FirstOrDefault().PaymentDate
            ))
            .ForMember(dest => dest.PricePerDay, opt => opt.MapFrom(
                src => src.Vehicle.Model.RatePerDay
            ))
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(
                src => src.User.FullName
            ))
            .ForMember(dest => dest.CustomerEmail, opt => opt.MapFrom(
                src => src.User.Email
            ));

            CreateMap<DriverLicense, DriverLicenseDto>();

            CreateMap<User, UserDto>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(
                src => src.Role.ToLower()
            ));
            CreateMap<UserDto, User>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(
                src => src.Role[0].ToString().ToUpper() + src.Role.Substring(1)
            ))
            .ForMember(dest => dest.DriverLicenses, opt => opt.Ignore())
            .ForMember(dest => dest.PhoneNumber, opt => opt.Ignore())
            .ForMember(dest => dest.CreationDate, opt => opt.Ignore());

            CreateMap<Banner, BannerDTO>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(
                src => src.Type.ToLower()));
            CreateMap<BannerDTO, Banner>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(
                src => src.Type[0].ToString().ToUpper() + src.Type.Substring(1)
            ))
            .ForMember(dest => dest.BannerId, opt => opt.Ignore());

            CreateMap<SystemSettingsDTO, ServerInfoDTO>();

            CreateMap<Manufacturer, ManufacturerDTO>();
            CreateMap<VehicleType, VehicleTypeDTO>();

            CreateMap<Report, ReportDTO>()
                .ForMember(dest => dest.TypeName, opt => opt.MapFrom(src => src.Type.Description))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.User.Email));
            CreateMap<ReportDTO, Report>();
        }
    }
}
