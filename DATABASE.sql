USE master
IF EXISTS(select * from sys.databases where name='SWP-PROTOTYPE')
BEGIN
ALTER DATABASE [SWP-PROTOTYPE]
SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE [SWP-PROTOTYPE]
END;

CREATE DATABASE [SWP-PROTOTYPE]
GO

USE [SWP-PROTOTYPE]

CREATE TABLE Users
(
    UserId int PRIMARY KEY IDENTITY(1, 1),
    Email varchar(100) NOT NULL UNIQUE,
    PhoneNumber varchar(20) NOT NULL UNIQUE,
    PasswordHash varchar(256),
    Role varchar(10) NOT NULL DEFAULT 'Customer',
    FullName nvarchar(256),
    Address nvarchar(256),
    CreationDate date NOT NULL DEFAULT GETDATE(),
    EmailConfirmed bit NOT NULL DEFAULT 0,
    DateOfBirth date, -- not sure to store the date of birth, or just only allow 18+ customers to have accounts
    IsActive bit NOT NULL DEFAULT 0,
    GoogleuserId varchar(256),
    Sub varchar(256) NOT NULL UNIQUE DEFAULT '',

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
    LicenseId varchar(256) NOT NULL,
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
    --ShopId int NOT NULL,
    ModelName nvarchar(100) NOT NULL,
    RatePerDay bigint NOT NULL,
    ManufacturerId int NOT NULL,
    ImageFile varchar(100),
    Description nvarchar(MAX) NOT NULL, -- might want to implement some fancy formatting like markdown
    UpFrontPercentage int NOT NULL DEFAULT 50,
    IsAvailable bit NOT NULL DEFAULT 0,

    CONSTRAINT fk_vhm_vht FOREIGN KEY (VehicleTypeId) REFERENCES VehicleTypes,
    CONSTRAINT fk_vhm_manu FOREIGN KEY (ManufacturerId) REFERENCES Manufacturers
    --,
    --CONSTRAINT fk_vhm_shop FOREIGN KEY (ShopId) REFERENCES Shops
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
    ShopId int NOT NULL

    CONSTRAINT fk_vehicle_model FOREIGN KEY (ModelId) REFERENCES VehicleModels,
    CONSTRAINT fk_vehicle_shop FOREIGN KEY (ShopId) REFERENCES Shops
)

CREATE TABLE Bookings
(
    BookingId int PRIMARY KEY IDENTITY(1, 1),
    VehicleId int NOT NULL,
    UserId int NOT NULL,
    StartDate date NOT NULL,
    EndDate date NOT NULL,
    Status varchar(20) NOT NULL DEFAULT 'Awaiting Payment',

    CONSTRAINT fk_bookings_vehicle FOREIGN KEY (VehicleId) REFERENCES Vehicles,
    CONSTRAINT fk_bookings_users FOREIGN KEY (UserId) REFERENCES Users,
    CONSTRAINT ck_bookings_date CHECK (StartDate < EndDate),
    CONSTRAINT ck_bookings_status CHECK (Status IN ('Awaiting Payment', 'Upcoming', 'Active', 'Completed', 'Cancelled'))
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
    BookingId int NOT NULL,

    CONSTRAINT pk_bookperi PRIMARY KEY (PeripheralId, BookingId),
    CONSTRAINT fk_bookperi_peri FOREIGN KEY (PeripheralId) REFERENCES Peripherals,
    CONSTRAINT fk_bookperi_book FOREIGN KEY (BookingId) REFERENCES Bookings
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
    SendTime datetime NOT NULL DEFAULT GETDATE(),
    IsRead bit NOT NULL DEFAULT 0, 

    CONSTRAINT fk_chtmsg_chat FOREIGN KEY (ChatId) REFERENCES Chats,
    CONSTRAINT fk_chtmsg_sender FOREIGN KEY (SenderId) REFERENCES Users
)

CREATE TABLE Feedbacks
(
    FeedBackId int PRIMARY KEY IDENTITY(1, 1),
    UserId int NOT NULL,
    Title nvarchar(256) NOT NULL,
    Body nvarchar(MAX) NOT NULL,
    ImagePath varchar(256),

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
    ReportTime datetime NOT NULL DEFAULT GETDATE(),
    Status varchar(20) NOT NULL DEFAULT 'Unresolved',

    CONSTRAINT fk_rep_user FOREIGN KEY (UserId) REFERENCES Users,
    CONSTRAINT fk_rep_type FOREIGN KEY (TypeId) REFERENCES ReportTypes,
    CONSTRAINT ck_rep_status CHECK (Status IN ('Unresolved', 'Resolved', 'In Progress'))
)

CREATE TABLE Banners
(
    BannerId int PRIMARY KEY IDENTITY(1, 1),
    Title nvarchar(50) NOT NULL,
    Message nvarchar(256) NOT NULL,
    StartTime datetime NOT NULL DEFAULT GETDATE(),
    EndTime datetime NOT NULL,
    ButtonText nvarchar(50) NOT NULL,
    ButtonLink varchar(50) NOT NULL,
    Type varchar(10) NOT NULL,
    Background varchar(7) NOT NULL,
    TextColor varchar(7) NOT NULL,
    Priority int NOT NULL DEFAULT 1,
    IsActive bit NOT NULL DEFAULT 0,
    ShowOnce bit NOT NULL DEFAULT 0,

    CONSTRAINT ck_ban_type CHECK (Type IN ('Info', 'Warning', 'Success', 'Error', 'Promotion')),
    CONSTRAINT ck_ban_date CHECK (EndTime > StartTime)
)

INSERT INTO Banners 
(Title, Message, StartTime, EndTime, ButtonText, ButtonLink, Type, Background, TextColor, Priority, IsActive, ShowOnce)
VALUES
-- 1. Info Banner
('Welcome Back!', 
 'Check out our new features and updates for July 2025.', 
 '2025-07-01T08:00:00', 
 '2025-07-10T23:59:59', 
 'Learn More', 
 '/features', 
 'Info', 
 '#e3f2fd', 
 '#0d47a1', 
 2, 
 1, 
 0),

-- 2. Promotion Banner
('Limited Offer!', 
 'Get 20% off on all bookings until July 5th. Use code JULY20 at checkout!', 
 '2025-07-01T00:00:00', 
 '2025-07-05T23:59:59', 
 'Book Now', 
 '/promo', 
 'Promotion', 
 '#fff8e1', 
 '#bf360c', 
 1, 
 1, 
 1),

-- 3. Warning Banner
('Scheduled Maintenance', 
 'Our site will be undergoing scheduled maintenance on July 3rd from 2am to 5am UTC.', 
 '2025-07-02T20:00:00', 
 '2025-07-03T05:00:00', 
 'View Details', 
 '/maintenance', 
 'Warning', 
 '#fff3e0', 
 '#ff6f00', 
 3, 
 0, 
 0);


-- Insert into Users (10 rows)
-- Pass: Abc@12345
INSERT INTO Users (Email, PhoneNumber, PasswordHash, Role, FullName, Address, CreationDate, EmailConfirmed, DateOfBirth, IsActive, Sub)
VALUES
    ('admin@vroomvroom.vn', '0905123456', 'AQAAAAIAAYagAAAAEHgBObsBOeTlITPhVA01SAlv1EzRcNimdUs3gvGZmfoQF72Q9jphT2NlCIhQz/Sl6A==', 'Admin', N'Nguyễn Thị Hồng Nhung', N'12 Nguyễn Trãi, Quận 1, TP.HCM', '2025-01-01', 1, '1985-03-15', 1, 'user-xt7kpq2n'),
    ('staff@vroomvroom.vn', '0916123456', 'AQAAAAIAAYagAAAAEHgBObsBOeTlITPhVA01SAlv1EzRcNimdUs3gvGZmfoQF72Q9jphT2NlCIhQz/Sl6A==', 'Staff', N'Đỗ Văn Tuấn', N'45 Trần Phú, Hải Châu, Đà Nẵng', '2025-01-02', 1, '1992-07-22', 1, 'user-4m9jwv8r'),
    ('minh.nguyen@gmail.com', '0937123456', 'AQAAAAIAAYagAAAAEHgBObsBOeTlITPhVA01SAlv1EzRcNimdUs3gvGZmfoQF72Q9jphT2NlCIhQz/Sl6A==', 'Customer', N'Nguyễn Văn Minh', N'78 Lê Lợi, Ba Đình, Hà Nội', '2025-05-01', 0, '1990-11-30', 1, 'user-hz3cnb6y'),
    ('john.smith@outlook.com', '0988123456', 'AQAAAAIAAYagAAAAEHgBObsBOeTlITPhVA01SAlv1EzRcNimdUs3gvGZmfoQF72Q9jphT2NlCIhQz/Sl6A==', 'Customer', N'John Smith', N'123 Bùi Viện, Quận 1, TP.HCM', '2025-05-15', 0, '1995-05-10', 0, 'user-pq5rt2kf'),
    ('thu.vo@yahoo.com', '0979123456', 'AQAAAAIAAYagAAAAEHgBObsBOeTlITPhVA01SAlv1EzRcNimdUs3gvGZmfoQF72Q9jphT2NlCIhQz/Sl6A==', 'Customer', N'Võ Thị Thu', N'56 Nguyễn Huệ, Hội An, Quảng Nam', '2025-06-01', 1, '1988-09-05', 1, 'user-8ldwgx9m');


-- Insert into DriverLicenseTypes (2 rows: <125cc and 125+ cc)
INSERT INTO DriverLicenseTypes (LicenseTypeCode)
VALUES 
    ('A1'), -- <125cc
    ('A2'); -- 125+ cc

-- Insert into DriverLicenses (8 rows for customers)
INSERT INTO DriverLicenses (UserId, LicenseTypeId, LicenseId, HolderName, DateOfIssue)
VALUES
    (3, 1, 'VN123456789', N'Nguyễn Văn Minh', '2020-06-01'),
    (4, 1, 'VN987654321', N'Võ Thị Thu', '2021-03-15'),
    (5, 2, 'IDP2025001', N'John Smith', '2025-01-01');

-- Insert into VehicleTypes (3 rows)
INSERT INTO VehicleTypes (VehicleTypeName, CylinderVolume_cm3)
VALUES 
    ('Motorbike <125cc', 110),
    ('Motorbike 125-150cc', 135),
    ('Motorbike 150-175cc', 160);

-- Insert into LicenseTypeToVehicleType (4 rows)
INSERT INTO LicenseTypeToVehicleType (LicenseTypeId, VehicleTypeId)
VALUES 
    (1, 1), -- A1 can drive <125cc
    (2, 1), -- A2 can drive <125cc
    (2, 2), -- A2 can drive 125-150cc
    (2, 3); -- A2 can drive 150-175cc

-- Insert into Manufacturers (3 rows)
INSERT INTO Manufacturers (ManufacturerName)
VALUES 
    (N'Honda'),
    (N'Yamaha'),
    (N'Piaggio');


-- Insert into Shops (2 rows)
INSERT INTO Shops (Address, Status)
VALUES 
    (N'123 Đường Lê Lợi, Quận 1, TP.HCM', 'Open'),
    (N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM', 'Open');

-- Insert into VehicleModels (15 rows: 5 per vehicle type)
INSERT INTO VehicleModels (VehicleTypeId, ModelName, RatePerDay, ManufacturerId, ImageFile, Description, UpFrontPercentage, IsAvailable)
VALUES 
    (1, N'Wave Alpha', 100000, 1, 'wave_alpha.jpg', N'Popular motorbike for daily use.', 50, 1),
    (1, N'Sirius', 120000, 2, 'sirius.jpg', N'Reliable and fuel-efficient.', 50, 1),
    (1, N'Blade', 105000, 1, 'blade.jpg', N'Affordable and durable.', 50, 1),
    (2, N'Winner X', 150000, 1, 'winner_x.jpg', N'Sporty underbone motorbike.', 50, 1),
    (2, N'Exciter', 160000, 2, 'exciter.jpg', N'Popular choice for young riders.', 50, 1),
    (2, N'Liberty', 145000, 3, 'liberty.jpg', N'Elegant Italian design.', 50, 1),
    (3, N'CB150R', 200000, 1, 'cb150r.jpg', N'Naked bike with sporty performance.', 50, 1),
    (3, N'R15', 220000, 2, 'r15.jpg', N'Sport bike with racing DNA.', 50, 1),
    (1, N'Future', 110000, 1, 'future.jpg', N'Modern design with good performance.', 50, 1),
    (1, N'Jupiter', 115000, 2, 'jupiter.jpg', N'Sporty look with smooth ride.', 50, 1),
    (2, N'Air Blade', 140000, 1, 'air_blade.jpg', N'Stylish scooter with good performance.', 50, 1),
    (2, N'NVX', 155000, 2, 'nvx.jpg', N'Powerful scooter with modern features.', 50, 1),
    (3, N'CBR150R', 210000, 1, 'cbr150r.jpg', N'Fully faired sport bike.', 50, 1),
    (3, N'MT-15', 215000, 2, 'mt15.jpg', N'Street fighter style.', 50, 1),
    (3, N'Medley', 205000, 3, 'medley.jpg', N'Premium scooter with large wheels.', 50, 1);

-- Insert into Vehicles (45 rows: 3 per model)
INSERT INTO Vehicles (ModelId, Condition, ShopId)
VALUES 
    (1, 'Normal', 1), (1, 'Normal', 1), (1, 'Normal', 1), -- Shop 1: 24 vehicles
    (2, 'Normal', 1), (2, 'Normal', 2), (2, 'Normal', 2),
    (3, 'Normal', 1), (3, 'Normal', 2), (3, 'Normal', 1),
    (4, 'Normal', 1), (4, 'Normal', 1), (4, 'Normal', 1),
    (5, 'Normal', 1), (5, 'Normal', 1), (5, 'Normal', 2),
    (6, 'Normal', 1), (6, 'Normal', 1), (6, 'Normal', 1),
    (7, 'Normal', 1), (7, 'Normal', 1), (7, 'Normal', 1),
    (8, 'Normal', 1), (8, 'Normal', 2), (8, 'Normal', 2),
    (9, 'Normal', 1), (9, 'Normal', 2), (9, 'Normal', 1), -- Shop 2: 21 vehicles
    (10, 'Normal', 1), (10, 'Normal', 1), (10, 'Normal', 1),
    (11, 'Normal', 2), (11, 'Normal', 1), (11, 'Normal', 1),
    (12, 'Normal', 2), (12, 'Normal', 1), (12, 'Normal', 2),
    (13, 'Normal', 2), (13, 'Normal', 1), (13, 'Normal', 2),
    (14, 'Normal', 1), (14, 'Normal', 2), (14, 'Normal', 1),
    (15, 'Normal', 1), (15, 'Normal', 2), (15, 'Normal', 1);

INSERT INTO Reviews (UserId, ModelId, Rate, Comment, IsVisible)
VALUES
    (3, 2, 3, N'Good bike, but noisy.', 0),
    (4, 3, 4, N'Xe bền, giá hợp lý.', 1),
    (5, 1, 4, N'Nice scooter for city.', 1);

-- Insert into Bookings (20 rows: 10 per shop)
INSERT INTO Bookings (UserId, VehicleId, StartDate, EndDate, Status)
VALUES
    (3, 4, '2025-05-15', '2025-07-10', 'Active'),
    (4, 7, '2025-06-01', '2025-06-02', 'Active'),
    (5, 8, '2025-06-05', '2025-06-30', 'Upcoming')

-- Insert into Payments (20 rows: 1 per booking)
INSERT INTO Payments (BookingId, AmountPaid, PaymentDate)
VALUES 
	(1, 600000, '2025-06-03'), 
	(2, 600000, '2025-06-04'),
    (3, 580000, '2025-06-05')

-- Insert into Peripherals (10 rows)
INSERT INTO Peripherals (Name, RatePerDay)
VALUES 
    (N'Helmet', 10000), (N'Gloves', 5000), (N'Jacket', 15000), (N'Raincoat', 10000),
    (N'Phone Holder', 5000), (N'GPS Device', 20000), (N'First Aid Kit', 5000), (N'Tool Kit', 10000),
    (N'Spare Tire', 15000), (N'Lock', 5000);

-- Insert into AvailableModelPeripherals (3-4 peripherals per model, sample for brevity)
INSERT INTO AvailableModelPeripherals (PeripheralId, ModelId)
VALUES 
    (1, 1), (2, 1), (3, 1), (4, 1), -- Model 1
    (1, 2), (2, 2), (5, 2), (6, 2) -- Model 2
    -- Similar for other models

-- Insert into BookingPeripherals (sample, assuming schema error, should be BookingId)
-- Proceeding with ModelId as per schema
INSERT INTO BookingPeripherals (PeripheralId, BookingId)
VALUES 
    (1, 1), (2, 1), (3, 1), -- Model 1 in bookings
    (1, 2), (2, 2), (5, 2); -- Model 2 in bookings

-- Insert into Chats (10 rows: 1 per user)
INSERT INTO Chats (UserId, StaffId, Status, Priority, OpenTime, Subject)
VALUES
    (3, 2, 'Unresolved', 'High', '2025-05-15 11:00:00', N'Bike breakdown'),
    (4, 2, 'Resolved', 'Low', '2025-06-01 12:00:00', N'Đổi xe'),
    (5, 2, 'Resolved', 'Medium', '2025-06-10 13:00:00', N'Check license');

-- Insert into ChatMessages (sample for brevity)
INSERT INTO ChatMessages (ChatId, SenderId, Content)
VALUES
    (1, 3, N'Help! Bike stopped on Nguyen Trai.'),
    (1, 3, N'We’ll send a mechanic now.'),
    (2, 1, N'Xe này cũ, đổi xe khác được không?'),
    (3, 2, N'Can you check my license status?');

	--select * from ChatMessages

-- Insert into Feedbacks (10 rows: 1 per user)
INSERT INTO Feedbacks (UserId, Title, Body, ImagePath)
VALUES 
    (3, N'Good experience', N'Easy to book bikes.', 'feedback3.jpg'),
    (4, N'Fast service', N'Quick responses from staff.', 'feedback4.jpg'),
    (5, N'Nice bikes', N'Great selection of motorbikes.', 'feedback5.jpg')

	-- select * from Users

-- Insert into ReportTypes (3 rows)
INSERT INTO ReportTypes (Description)
VALUES 
    (N'Vehicle Issue'),
    (N'Payment Issue'),
    (N'Other');

-- Insert into Reports (sample rows)
INSERT INTO Reports (UserId, TypeId, Title, Body, ImagePath)
VALUES 
    (3, 1, N'Vehicle not starting', N'The motorbike I rented won’t start.', 'report1.jpg'),
    (4, 2, N'Overcharged', N'I was charged more than agreed.', 'report2.jpg'),
    (5, 3, N'Delivery delay', N'Bike was delivered late.', 'report3.jpg');