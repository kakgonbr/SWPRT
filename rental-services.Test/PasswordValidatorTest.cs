using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace rental_services.Test
{
    public class PasswordValidatorTest
    {
        [Theory]
        [InlineData("A@1", false)]
        [InlineData("abcdef12345@", false)]
        [InlineData("Abcdefdjadjasjda", false)]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAAAAAAAAA@@@@@@@@@@@@213123", false)]
        [InlineData("99999999999999999813821", false)]
        [InlineData("!^@&*!#877318&@&*@!", false)]
        [InlineData("ABC@12345", false)]
        [InlineData("abc!@#$%%&ABC", false)]

        [InlineData("Abc@12345", true)]
        [InlineData("Password!1", true)]
        [InlineData("_}24I:9t58Tu?m@e", true)]
        public void IsValid_ReturnsExpected(string password, bool expected)
        {
            bool result = Server.Utils.Validator.Password(password);
            Assert.Equal(expected, result);
        }
    }
}
