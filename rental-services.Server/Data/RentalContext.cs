using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using rental_services.Server.Models;

namespace rental_services.Server.Data;

public partial class RentalContext : DbContext
{
    public RentalContext()
    {
    }

    public RentalContext(DbContextOptions<RentalContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Banner> Banners { get; set; }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<Chat> Chats { get; set; }

    public virtual DbSet<ChatMessage> ChatMessages { get; set; }

    public virtual DbSet<DriverLicense> DriverLicenses { get; set; }

    public virtual DbSet<DriverLicenseType> DriverLicenseTypes { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<Manufacturer> Manufacturers { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Peripheral> Peripherals { get; set; }

    public virtual DbSet<Report> Reports { get; set; }

    public virtual DbSet<ReportType> ReportTypes { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Shop> Shops { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

    public virtual DbSet<VehicleModel> VehicleModels { get; set; }

    public virtual DbSet<VehicleType> VehicleTypes { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer(Environment.GetEnvironmentVariable("DATABASE_CONNECTION"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Banner>(entity =>
        {
            entity.HasKey(e => e.BannerId).HasName("PK__Banners__32E86AD13335A0E2");

            entity.Property(e => e.Background)
                .HasMaxLength(7)
                .IsUnicode(false);
            entity.Property(e => e.ButtonLink)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ButtonText).HasMaxLength(50);
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.Message).HasMaxLength(256);
            entity.Property(e => e.Priority).HasDefaultValue(1);
            entity.Property(e => e.StartTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.TextColor)
                .HasMaxLength(7)
                .IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(50);
            entity.Property(e => e.Type)
                .HasMaxLength(10)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId).HasName("PK__Bookings__73951AEDCBBA77DA");

            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("Awaiting Payment");

            entity.HasOne(d => d.User).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_bookings_users");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.VehicleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_bookings_vehicle");
        });

        modelBuilder.Entity<Chat>(entity =>
        {
            entity.HasKey(e => e.ChatId).HasName("PK__Chats__A9FBE7C6EBD50456");

            entity.Property(e => e.OpenTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Priority)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("Low");
            entity.Property(e => e.Status)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("Unresolved");
            entity.Property(e => e.Subject).HasMaxLength(256);

            entity.HasOne(d => d.Staff).WithMany(p => p.ChatStaffs)
                .HasForeignKey(d => d.StaffId)
                .HasConstraintName("fk_chat_staff");

            entity.HasOne(d => d.User).WithMany(p => p.ChatUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_chat_user");
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.ChatMessageId).HasName("PK__ChatMess__9AB610356F132ECD");

            entity.Property(e => e.SendTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Chat).WithMany(p => p.ChatMessages)
                .HasForeignKey(d => d.ChatId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_chtmsg_chat");

            entity.HasOne(d => d.Sender).WithMany(p => p.ChatMessages)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_chtmsg_sender");
        });

        modelBuilder.Entity<DriverLicense>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.LicenseTypeId }).HasName("pk_drlc");

            entity.Property(e => e.HolderName).HasMaxLength(256);
            entity.Property(e => e.LicenseId)
                .HasMaxLength(256)
                .IsUnicode(false);

            entity.HasOne(d => d.LicenseType).WithMany(p => p.DriverLicenses)
                .HasForeignKey(d => d.LicenseTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_drlc_drlct");

            entity.HasOne(d => d.User).WithMany(p => p.DriverLicenses)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_drlc_users");
        });

        modelBuilder.Entity<DriverLicenseType>(entity =>
        {
            entity.HasKey(e => e.LicenseTypeId).HasName("PK__DriverLi__48F794F850B95713");

            entity.Property(e => e.LicenseTypeCode)
                .HasMaxLength(5)
                .IsUnicode(false);

            entity.HasMany(d => d.VehicleTypes).WithMany(p => p.LicenseTypes)
                .UsingEntity<Dictionary<string, object>>(
                    "LicenseTypeToVehicleType",
                    r => r.HasOne<VehicleType>().WithMany()
                        .HasForeignKey("VehicleTypeId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_lctvht_vht"),
                    l => l.HasOne<DriverLicenseType>().WithMany()
                        .HasForeignKey("LicenseTypeId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_lctvht_lct"),
                    j =>
                    {
                        j.HasKey("LicenseTypeId", "VehicleTypeId").HasName("pk_lctvht");
                        j.ToTable("LicenseTypeToVehicleType");
                    });
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedBackId).HasName("PK__Feedback__E2CB3B876A9D9547");

            entity.Property(e => e.ImagePath)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(256);

            entity.HasOne(d => d.User).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_fdbck_user");
        });

        modelBuilder.Entity<Manufacturer>(entity =>
        {
            entity.HasKey(e => e.ManufacturerId).HasName("PK__Manufact__357E5CC1BEF140B3");

            entity.Property(e => e.ManufacturerName).HasMaxLength(100);
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__9B556A385E3A3030");

            entity.Property(e => e.PaymentDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Booking).WithMany(p => p.Payments)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_pay_bookings");
        });

        modelBuilder.Entity<Peripheral>(entity =>
        {
            entity.HasKey(e => e.PeripheralId).HasName("PK__Peripher__1799457580F3DC79");

            entity.Property(e => e.Name).HasMaxLength(50);

            entity.HasMany(d => d.Models).WithMany(p => p.Peripherals)
                .UsingEntity<Dictionary<string, object>>(
                    "AvailableModelPeripheral",
                    r => r.HasOne<VehicleModel>().WithMany()
                        .HasForeignKey("ModelId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_avaimodperi_modl"),
                    l => l.HasOne<Peripheral>().WithMany()
                        .HasForeignKey("PeripheralId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_avaimodperi_peri"),
                    j =>
                    {
                        j.HasKey("PeripheralId", "ModelId").HasName("pk_avaimodperi");
                        j.ToTable("AvailableModelPeripherals");
                    });

            entity.HasMany(d => d.ModelsNavigation).WithMany(p => p.PeripheralsNavigation)
                .UsingEntity<Dictionary<string, object>>(
                    "BookingPeripheral",
                    r => r.HasOne<VehicleModel>().WithMany()
                        .HasForeignKey("ModelId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_bookperi_modl"),
                    l => l.HasOne<Peripheral>().WithMany()
                        .HasForeignKey("PeripheralId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_bookperi_peri"),
                    j =>
                    {
                        j.HasKey("PeripheralId", "ModelId").HasName("pk_bookperi");
                        j.ToTable("BookingPeripherals");
                    });
        });

        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasKey(e => e.ReportId).HasName("PK__Reports__D5BD4805994E66A9");

            entity.Property(e => e.ImagePath)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(256);

            entity.HasOne(d => d.Type).WithMany(p => p.Reports)
                .HasForeignKey(d => d.TypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_rep_type");

            entity.HasOne(d => d.User).WithMany(p => p.Reports)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_rep_user");
        });

        modelBuilder.Entity<ReportType>(entity =>
        {
            entity.HasKey(e => e.ReportTypeId).HasName("PK__ReportTy__78CF8CE3E6E3D2B0");

            entity.Property(e => e.Description).HasMaxLength(100);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__Reviews__74BC79CEC348AC99");

            entity.HasOne(d => d.Model).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.ModelId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_rv_mdl");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_rv_usr");
        });

        modelBuilder.Entity<Shop>(entity =>
        {
            entity.HasKey(e => e.Shopid).HasName("PK__Shops__67C453A1DE200D38");

            entity.Property(e => e.Address).HasMaxLength(256);
            entity.Property(e => e.Status)
                .HasMaxLength(10)
                .HasDefaultValue("Open");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C9D16878A");

            entity.HasIndex(e => e.PhoneNumber, "UQ__Users__85FB4E38349A6DD7").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534D07FF8CC").IsUnique();

            entity.HasIndex(e => e.Sub, "UQ__Users__CA32102A94328F03").IsUnique();

            entity.Property(e => e.Address).HasMaxLength(256);
            entity.Property(e => e.CreationDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FullName).HasMaxLength(256);
            entity.Property(e => e.GoogleuserId)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Role)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("Customer");
            entity.Property(e => e.Sub)
                .HasMaxLength(256)
                .IsUnicode(false)
                .HasDefaultValue("");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.VehicleId).HasName("PK__Vehicles__476B54927FC694C5");

            entity.Property(e => e.Condition)
                .HasMaxLength(100)
                .HasDefaultValue("Normal");

            entity.HasOne(d => d.Model).WithMany(p => p.Vehicles)
                .HasForeignKey(d => d.ModelId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_vehicle_model");

            entity.HasOne(d => d.Shop).WithMany(p => p.Vehicles)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_vehicle_shop");
        });

        modelBuilder.Entity<VehicleModel>(entity =>
        {
            entity.HasKey(e => e.ModelId).HasName("PK__VehicleM__E8D7A12C185909B1");

            entity.Property(e => e.ImageFile)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.ModelName).HasMaxLength(100);
            entity.Property(e => e.UpFrontPercentage).HasDefaultValue(50);

            entity.HasOne(d => d.Manufacturer).WithMany(p => p.VehicleModels)
                .HasForeignKey(d => d.ManufacturerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_vhm_manu");

            entity.HasOne(d => d.VehicleType).WithMany(p => p.VehicleModels)
                .HasForeignKey(d => d.VehicleTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_vhm_vht");
        });

        modelBuilder.Entity<VehicleType>(entity =>
        {
            entity.HasKey(e => e.VehicleTypeId).HasName("PK__VehicleT__9F449643D48AA95D");

            entity.Property(e => e.CylinderVolumeCm3).HasColumnName("CylinderVolume_cm3");
            entity.Property(e => e.VehicleTypeName)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
