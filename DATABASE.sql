USE master
IF EXISTS(select * from sys.databases where name='SWP-PROTOTYPE')
BEGIN
ALTER DATABASE [SWP-PROTOTYPE]
SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE [SWP-PROTOTYPE]
END;

CREATE DATABASE [SWP-PROTOTYPE]
USE [SWP-PROTOTYPE]


CREATE TABLE Users
(
    UserId int PRIMARY KEY IDENTITY(1, 1),
    Email varchar(100) NOT NULL UNIQUE,
    PhoneNumber varchar(20) NOT NULL UNIQUE,
    PasswordHash varchar(256) NOT NULL,
    Role varchar(10) NOT NULL DEFAULT 'Customer',
    FullName nvarchar(256),
    Address nvarchar(256),
    CreationDate date NOT NULL DEFAULT GETDATE(),
    EmailConfirmed bit NOT NULL DEFAULT 0,
    DateOfBirth date NOT NULL, -- not sure to store the date of birth, or just only allow 18+ customers to have accounts
    IsActive bit NOT NULL DEFAULT 0,
    GoogleuserId varchar(256),

    CONSTRAINT ck_user_role CHECK (Role IN ('Customer', 'Staff', 'Admin'))
)

CREATE TABLE DriverLicenseTypes
(
    LicenseTypeId int PRIMARY KEY IDENTITY(1, 1),
    LicenseTypeCode varchar(5) NOT NULL,
)

CREATE TABLE DriverLicenses
(
    UserId int NOT NULL,
    LicenseTypeId int NOT NULL,
    LicenseTypeCode varchar(256) NOT NULL,
    HolderName nvarchar(256) NOT NULL,
    DateOfIssue date NOT NULL,

    CONSTRAINT pk_drlc PRIMARY KEY (UserId, LicenseTypeId),
    CONSTRAINT fk_drlc_users FOREIGN KEY (UserId) REFERENCES Users,
    CONSTRAINT fk_drlc_drlct FOREIGN KEY (LicenseTypeId) REFERENCES DriverLicenseTypes
)

CREATE TABLE VehicleTypes
(
    VehicleTypeId int PRIMARY KEY IDENTITY (1, 1),
    VehicleTypeName varchar(100) NOT NULL,
    CylinderVolume_cm3 int NOT NULL
)

CREATE TABLE LicenseTypeToVehicleType
(
    LicenseTypeId int NOT NULL,
    VehicleTypeId int NOT NULL,

    CONSTRAINT pk_lctvht PRIMARY KEY (LicenseTypeId, VehicleTypeId),
    CONSTRAINT fk_lctvht_lct FOREIGN KEY (LicenseTypeId) REFERENCES DriverLicenseTypes,
    CONSTRAINT fk_lctvht_vht FOREIGN KEY (VehicleTypeId) REFERENCES VehicleTypes
)

CREATE TABLE Manufacturers
(
    ManufacturerId int PRIMARY KEY IDENTITY(1, 1),
    ManufacturerName nvarchar(100) NOT NULL
)

CREATE TABLE Shops
(
    Shopid int PRIMARY KEY IDENTITY(1, 1),
    Address nvarchar(256) NOT NULL,
    Status nvarchar(10) NOT NULL DEFAULT 'Open',

    CONSTRAINT ck_shop_status CHECK (Status IN ('Open', 'Closed'))
)

CREATE TABLE VehicleModels
(
    ModelId int PRIMARY KEY IDENTITY(1, 1),
    VehicleTypeId int NOT NULL,
    ShopId int NOT NULL,
    ModelName nvarchar(100) NOT NULL,
    RatePerDay bigint NOT NULL,
    ManufacturerId int NOT NULL,
    ImageFile varchar(100),
    Description nvarchar(MAX) NOT NULL, -- might want to implement some fancy formatting like markdown
    UpFrontPercentage int NOT NULL DEFAULT 50,
    IsAvailable bit NOT NULL DEFAULT 0,

    CONSTRAINT fk_vhm_vht FOREIGN KEY (VehicleTypeId) REFERENCES VehicleTypes,
    CONSTRAINT fk_vhm_manu FOREIGN KEY (ManufacturerId) REFERENCES Manufacturers,
    CONSTRAINT fk_vhm_shop FOREIGN KEY (ShopId) REFERENCES Shops
)

CREATE TABLE Reviews
(
    ReviewId int PRIMARY KEY IDENTITY(1, 1),
    UserId int NOT NULL,
    ModelId int NOT NULL,
    Rate int NOT NULL,
    Comment nvarchar(MAX),
    IsVisible bit NOT NULL DEFAULT 0,

    CONSTRAINT fk_rv_mdl FOREIGN KEY (ModelId) REFERENCES VehicleModels,
    CONSTRAINT fk_rv_usr FOREIGN KEY (UserId) REFERENCES Users
)

CREATE TABLE Vehicles
(
    VehicleId int PRIMARY KEY IDENTITY(1, 1),
    ModelId int NOT NULL,
    Condition nvarchar(100) NOT NULL DEFAULT 'Normal',

    CONSTRAINT fk_vehicle_model FOREIGN KEY (ModelId) REFERENCES VehicleModels
)

CREATE TABLE Bookings
(
    BookingId int PRIMARY KEY IDENTITY(1, 1),
    VehicleId int NOT NULL,
    UserId int NOT NULL,
    StartDate date NOT NULL,
    EndDate date NOT NULL,
    Status varchar(20) NOT NULL DEFAULT 'Pending',

    CONSTRAINT fk_bookings_vehicle FOREIGN KEY (VehicleId) REFERENCES Vehicles,
    CONSTRAINT fk_bookings_users FOREIGN KEY (UserId) REFERENCES Users,
    CONSTRAINT ck_bookings_date CHECK (StartDate < EndDate),
    CONSTRAINT ck_bookings_status CHECK (Status IN ('Pending', 'WaitingPickup', 'Active', 'Returned'))
)

CREATE TABLE Payments
(
    PaymentId int PRIMARY KEY IDENTITY(1, 1),
    BookingId int NOT NULL,
    AmountPaid bigint NOT NULL,
    PaymentDate date NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_pay_bookings FOREIGN KEY (BookingId) REFERENCES Bookings,
    CONSTRAINT ck_pay_amount CHECK (AmountPaid > 0)
)

CREATE TABLE Peripherals
(
    PeripheralId int PRIMARY KEY IDENTITY(1, 1),
    Name nvarchar(50) NOT NULL,
    RatePerDay bigint NOT NULL
)

CREATE TABLE AvailableModelPeripherals
(
    PeripheralId int NOT NULL,
    ModelId int NOT NULL,

    CONSTRAINT pk_avaimodperi PRIMARY KEY (PeripheralId, ModelId),
    CONSTRAINT fk_avaimodperi_peri FOREIGN KEY (PeripheralId) REFERENCES Peripherals,
    CONSTRAINT fk_avaimodperi_modl FOREIGN KEY (ModelId) REFERENCES VehicleModels
)

CREATE TABLE BookingPeripherals
(
    PeripheralId int NOT NULL,
    ModelId int NOT NULL,

    CONSTRAINT pk_bookperi PRIMARY KEY (PeripheralId, ModelId),
    CONSTRAINT fk_bookperi_peri FOREIGN KEY (PeripheralId) REFERENCES Peripherals,
    CONSTRAINT fk_bookperi_modl FOREIGN KEY (ModelId) REFERENCES VehicleModels
)

CREATE TABLE Chats
(
    ChatId int PRIMARY KEY IDENTITY(1, 1),
    UserId int NOT NULL,
    StaffId int,
    Status varchar(10) NOT NULL DEFAULT 'Unresolved',
    Priority varchar(10) NOT NULL DEFAULT 'Low',
    OpenTime datetime NOT NULL DEFAULT GETDATE(),
    Subject nvarchar(256) NOT NULL,

    CONSTRAINT fk_chat_user FOREIGN KEY (UserId) REFERENCES Users,
    CONSTRAINT fk_chat_staff FOREIGN KEY (StaffId) REFERENCES Users,
    CONSTRAINT ck_chat_status CHECK (Status IN ('Unresolved', 'Resolved')),
    CONSTRAINT ck_chat_priority CHECK (Priority IN ('Critical', 'High', 'Medium', 'Low'))
)

CREATE TABLE ChatMessages
(
    ChatMessageId int PRIMARY KEY IDENTITY(1, 1),
    ChatId int NOT NULL,
    SenderId int NOT NULL,
    Content nvarchar(MAX) NOT NULL, -- maybe enforce length checks on the API

    CONSTRAINT fk_chtmsg_chat FOREIGN KEY (ChatId) REFERENCES Chats,
    CONSTRAINT fk_chtmsg_sender FOREIGN KEY (SenderId) REFERENCES Users
)

CREATE TABLE Feedbacks
(
    FeedBackId int PRIMARY KEY IDENTITY(1, 1),
    UserId int NOT NULL,
    Title nvarchar(256) NOT NULL,
    Body nvarchar(MAX) NOT NULL,
    ImagePath varchar(256) NOT NULL,

    CONSTRAINT fk_fdbck_user FOREIGN KEY (UserId) REFERENCES Users
)

CREATE TABLE ReportTypes
(
    ReportTypeId int PRIMARY KEY IDENTITY(1, 1),
    Description nvarchar(100) NOT NULL
)

CREATE TABLE Reports
(
    ReportId int PRIMARY KEY IDENTITY(1, 1),
    UserId int NOT NULL,
    TypeId int NOT NULL,
    Title nvarchar(256) NOT NULL,
    Body nvarchar(MAX) NOT NULL,
    ImagePath varchar(256) NOT NULL,

    CONSTRAINT fk_rep_user FOREIGN KEY (UserId) REFERENCES Users,
    CONSTRAINT fk_rep_type FOREIGN KEY (TypeId) REFERENCES ReportTypes
)