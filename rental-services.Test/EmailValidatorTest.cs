using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace rental_services.Test
{
    public class EmailValidatorTests
    {
        [Theory]
        [InlineData("example@email.com", true)]
        [InlineData("example.first.middle.lastname@email.com", true)]
        [InlineData("example@subdomain.email.com", true)]
        [InlineData("example+firstname+lastname@email.com", true)]
        [InlineData("\"example\"@email.com", true)]
        [InlineData("0987654321@example.com", true)]
        [InlineData("example@email-one.com", true)]
        [InlineData("_______@email.com", true)]
        [InlineData("example@email.name", true)]
        [InlineData("example@email.museum", true)]
        [InlineData("example@email.co.vn", true)]
        [InlineData("example.firstname-lastname@email.com", true)]

        [InlineData("extremely.”odd\\unusual”@example.com", false)]
        [InlineData("extremely.unusual.”@”.unusual.com@example.com", false)]
        [InlineData("very.”(),:;<>[]”.VERY.”very@\\\\ “very”.unusual@strange.email.example.com", false)]
        [InlineData("plaintextaddress", false)]
        [InlineData("@#@@##@%^%#$@#$@#.com", false)]
        [InlineData("@email.com", false)]
        [InlineData("John Doe <example@email.com>", false)]
        [InlineData("example.email.com", false)]
        [InlineData("example@example@email.com", false)]
        [InlineData(".example@email.com", false)]
        [InlineData("example.@email.com", false)]
        [InlineData("example...example@email.com", false)]
        [InlineData("example@email.com (John Doe)", false)]
        [InlineData("example@email", false)]
        [InlineData("example@-email.com", false)]
        [InlineData("example@111.222.333.44444", false)]
        [InlineData("example@email…com", false)]
        [InlineData("CAT...123@email.com", false)]
        [InlineData("”(),:;<>[\\]@email.com", false)]
        [InlineData("obviously\"not\"correct@email.com", false)]
        [InlineData("example\\ is”especially”not\\allowed@email.com", false)]
        public void IsValid_ReturnsExpected(string email, bool expected)
        {
            bool result = Server.Utils.Validator.Email(email);
            Assert.Equal(expected, result);
        }
    }
}
