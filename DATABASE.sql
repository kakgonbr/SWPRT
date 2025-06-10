USE master
IF EXISTS(select * from sys.databases where name='SWP-PROTOTYPE')
DROP DATABASE [SWP-PROTOTYPE]

CREATE DATABASE [SWP-PROTOTYPE]
USE [SWP-PROTOTYPE]


CREATE TABLE Users
(
	UserId int PRIMARY KEY IDENTITY(1, 1),
	Email varchar(100) NOT NULL UNIQUE,
	PhoneNumber varchar(20) NOT NULL UNIQUE,
	PasswordHash varchar(256) NOT NULL,
	Role int NOT NULL,
	FullName nvarchar(256),
	Address nvarchar(256),
	CreationDate date NOT NULL DEFAULT GETDATE(),
	EmailConfirmed bit NOT NULL DEFAULT 0,
	DateOfBirth date NOT NULL -- not sure to store the date of birth, or just only allow 18+ customers to have accounts
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
	Status nvarchar(10) NOT NULL
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
	Description nvarchar(MAX), -- might want to implement some fancy formatting like markdown

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

	CONSTRAINT fk_rv_mdl FOREIGN KEY (ModelId) REFERENCES VehicleModels,
	CONSTRAINT fk_rv_usr FOREIGN KEY (UserId) REFERENCES Users
)

CREATE TABLE Vehicles
(
	VehicleId int PRIMARY KEY IDENTITY(1, 1),
	ModelId int NOT NULL,
	Condition nvarchar(100),

	CONSTRAINT fk_vehicle_model FOREIGN KEY (ModelId) REFERENCES VehicleModels
)

CREATE TABLE Bookings
(
	BookingId int PRIMARY KEY IDENTITY(1, 1),
	VehicleId int NOT NULL,
	UserId int NOT NULL,
	StartDate date NOT NULL,
	EndDate date NOT NULL,
	PreRentDuration int NOT NULL, -- maybe in day
	PostRentDuration int NOT NULL,

	CONSTRAINT fk_bookings_vehicle FOREIGN KEY (VehicleId) REFERENCES Vehicles,
	CONSTRAINT fk_bookings_users FOREIGN KEY (UserId) REFERENCES Users,
	CONSTRAINT ck_bookings_date CHECK (StartDate < EndDate)
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