namespace rental_services.Server.Utils
{
    public static class CustomDateTime
    {
        public static DateTime CurrentTime { get; private set; } = DateTime.Now;

        public static void Advance(int days = 1)
        {
            CurrentTime = CurrentTime.AddDays(days);
        }

        public static void Back(int days = 1)
        {
            CurrentTime = CurrentTime.AddDays(-days);
        }

        public static void Reset()
        {
            CurrentTime = DateTime.Now;
        }

        public static void SetTime(string time, string format = "dd/MM/yyyy")
        {
            CurrentTime = DateTime.ParseExact(time, format, System.Globalization.CultureInfo.InvariantCulture);
        }
    }
}
