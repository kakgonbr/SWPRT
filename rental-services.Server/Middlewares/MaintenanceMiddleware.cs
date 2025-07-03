using rental_services.Server.Services;

namespace rental_services.Server.Middlewares
{
    public class MaintenanceMiddleware
    {
        private readonly RequestDelegate _next;

        public MaintenanceMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IMaintenanceService maintenanceService)
        {
            if (maintenanceService is not null 
                && maintenanceService.IsActive 
                && Utils.CustomDateTime.CurrentTime >= maintenanceService.Start 
                && Utils.CustomDateTime.CurrentTime <= maintenanceService.End 
                && context.Request.Path.StartsWithSegments("/api")
                && !context.User.IsInRole("Admin")
                && !(context.Request.Path.StartsWithSegments("/api/serverinfo")
                || context.Request.Path.StartsWithSegments("/api/auth/login")))
            {
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                await context.Response.WriteAsync("The system is under maintenance. Please try again later.");
                return;
            }

            await _next(context);
        }
    }
}
