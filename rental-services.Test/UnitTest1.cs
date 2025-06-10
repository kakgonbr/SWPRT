using FluentAssertions;

namespace rental_services.Test
{
    public class UnitTest1
    {
        [Fact]
        public void Test1()
        {
            rental_services.Server.Program.DoSomething().Should().BeFalse();
        }
    }
}
