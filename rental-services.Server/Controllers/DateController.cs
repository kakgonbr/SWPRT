using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Utils;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DateController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetCurrentTime()
        {
            return Ok(new { time = CustomDateTime.CurrentTime });
        }

        [HttpPost("advance")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public IActionResult Advance([FromQuery] int days = 1, [FromQuery] int hours = 0)
        {
            CustomDateTime.Advance(days, hours);
            return Ok(new { message = $"Advanced by {days} day(s), {hours} hour(s)", time = CustomDateTime.CurrentTime });
        }

        [HttpPost("back")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public IActionResult Back([FromQuery] int days = 1, [FromQuery] int hours = 0)
        {
            CustomDateTime.Back(days, hours);
            return Ok(new { message = $"Went back by {days} day(s), {hours} hour(s)", time = CustomDateTime.CurrentTime });
        }

        [HttpPost("reset")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public IActionResult Reset()
        {
            CustomDateTime.Reset();
            return Ok(new { message = "Reset to system time", time = CustomDateTime.CurrentTime });
        }

        //[HttpPost("set")]
        //[Authorize(Roles = Utils.Config.Role.Admin)]
        //public IActionResult SetTime([FromQuery] string time, [FromQuery] string format = "dd/MM/yyyy")
        //{
        //    try
        //    {
        //        CustomDateTime.SetTime(time, format);
        //        return Ok(new { message = $"Set to {time}", time = CustomDateTime.CurrentTime });
        //    }
        //    catch (FormatException)
        //    {
        //        return BadRequest("Invalid date or format.");
        //    }
        //}
    }

}
