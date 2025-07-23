using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace rental_services.Test
{
    public class PhoneNumberValidatorTest
    {
        [Theory]
        [InlineData("+12 123456789", true)]
        [InlineData("+12123456789", true)]
        [InlineData("0123456789", true)]

        [InlineData("+123 123456789", false)]
        [InlineData("+1 123456789", false)]
        [InlineData("+12 12345678", false)]
        [InlineData("+12 1234567890", false)]
        [InlineData("123456789", false)]
        [InlineData("01 23456789", false)]
        [InlineData("+12-123456789", false)]
        [InlineData("+12 123 456789", false)]
        [InlineData("", false)]
        public void IsValid_ReturnsExpected(string phoneNumber, bool expected)
        {
            var result = Server.Utils.Validator.PhoneNumber(phoneNumber);
            Assert.Equal(expected, result);
        }
    }
}
