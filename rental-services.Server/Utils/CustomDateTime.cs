namespace rental_services.Server.Utils
{
    public static class CustomDateTime
    {
        //public static DateTime CurrentTime { get; private set; } = DateTime.Now;
        public static DateTime CurrentTime => DateTime.Now.AddDays(_daysOffset).AddHours(_hoursOffset);
        private static int _daysOffset = 0;
        private static int _hoursOffset = 0;

        public static void Advance(int days = 1, int hours = 0)
        {
            //CurrentTime = CurrentTime.AddDays(days);
            _daysOffset += days;
            _hoursOffset += hours;
        }

        public static void Back(int days = 1, int hours = 0)
        {
            //CurrentTime = CurrentTime.AddDays(-days);
            _daysOffset -= days;
            _hoursOffset -= hours;
        }

        public static void Reset()
        {
            //CurrentTime = DateTime.Now;
            _daysOffset = 0;
        }

        //public static void SetTime(string time, string format = "dd/MM/yyyy")
        //{
        //    CurrentTime = DateTime.ParseExact(time, format, System.Globalization.CultureInfo.InvariantCulture);
        //}
    }
}
