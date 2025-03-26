using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using YilmazVoeding.Core.Interfaces;
using YilmazVoeding.Core.Models;
using System.Security.Cryptography;

namespace YilmazVoeding.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly JwtSettings _jwtSettings;

        public AuthController(ICustomerRepository customerRepository, IOptions<JwtSettings> jwtSettings)
        {
            _customerRepository = customerRepository;
            _jwtSettings = jwtSettings.Value;
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginModel model)
        {
            if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password))
            {
                return BadRequest(new { message = "E-mailadres en wachtwoord zijn verplicht." });
            }

            var customer = await _customerRepository.GetByEmailAsync(model.Email);
            if (customer == null)
            {
                return Unauthorized(new { message = "Ongeldige inloggegevens." });
            }

            // Controleer wachtwoord met hash
            if (!VerifyPassword(model.Password, customer.Password))
            {
                return Unauthorized(new { message = "Ongeldige inloggegevens." });
            }

            // Genereer JWT token
            var token = GenerateJwtToken(customer);

            // Verwijder wachtwoord uit respons
            customer.Password = null;

            return Ok(new
            {
                userId = customer.Id,
                token,
                user = customer
            });
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenModel model)
        {
            if (string.IsNullOrEmpty(model.Token))
            {
                return BadRequest(new { message = "Token is verplicht." });
            }

            try
            {
                var principal = ValidateToken(model.Token);
                if (principal == null)
                {
                    return Unauthorized(new { message = "Ongeldige of verlopen token." });
                }

                var customerId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var customer = await _customerRepository.GetByIdAsync(customerId);
                if (customer == null)
                {
                    return Unauthorized(new { message = "Gebruiker niet gevonden." });
                }

                // Genereer nieuwe token
                var newToken = GenerateJwtToken(customer);

                return Ok(new
                {
                    token = newToken
                });
            }
            catch
            {
                return Unauthorized(new { message = "Ongeldige of verlopen token." });
            }
        }

        // Helper methode voor wachtwoord verificatie
        private bool VerifyPassword(string password, string storedHash)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                // Bereken hash van ingevoerd wachtwoord
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));
                
                // Converteer byte array naar string
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                string hashedPassword = builder.ToString();
                
                // Vergelijk hashes
                return storedHash == hashedPassword;
            }
        }

        // Helper methode voor JWT token generatie
        private string GenerateJwtToken(Customer customer)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, customer.Id.ToString()),
                new Claim(ClaimTypes.Email, customer.Email),
                new Claim(ClaimTypes.GivenName, customer.FirstName),
                new Claim(ClaimTypes.Surname, customer.LastName)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7), // Token geldig voor 7 dagen
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // Helper methode voor token validatie
        private ClaimsPrincipal ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };

            return tokenHandler.ValidateToken(token, validationParameters, out _);
        }
    }

    // Modellen voor login en token refresh
    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RefreshTokenModel
    {
        public string Token { get; set; }
    }
}