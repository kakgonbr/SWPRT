
using Microsoft.EntityFrameworkCore;
using rental_services.Server.Data;

namespace rental_services.Server
{
    public class Program
    {
        internal static bool DoSomething()
        {
            return true;
        }

        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddDbContext<RentalContext>(options =>
                options.UseSqlServer(Environment.GetEnvironmentVariable("DATABASE_CONNECTION") ?? throw new InvalidOperationException("Environment Variable 'DATABASE_CONNECTION' not found.")));
            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
