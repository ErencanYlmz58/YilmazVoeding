using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using YilmazVoeding.Core.Interfaces;
using YilmazVoeding.Core.Models;
using YilmazVoeding.Infrastructure.Data;

namespace YilmazVoeding.Infrastructure.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly YilmazVoedingContext _context;

        public CustomerRepository(YilmazVoedingContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Customer>> GetAllAsync()
        {
            return await _context.Customers.ToListAsync();
        }

        public async Task<Customer> GetByIdAsync(int id)
        {
            return await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Customer> GetByEmailAsync(string email)
        {
            return await _context.Customers.FirstOrDefaultAsync(c => c.Email == email);
        }

        public async Task<Customer> AddAsync(Customer customer)
        {
            // Hash het wachtwoord voordat het wordt opgeslagen
            customer.Password = HashPassword(customer.Password);
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return customer;
        }

        public async Task UpdateAsync(Customer customer)
        {
            // Controleer of het wachtwoord is gewijzigd (indien niet leeg)
            if (!string.IsNullOrEmpty(customer.Password))
            {
                // Haal de huidige entiteit op om te controleren of het wachtwoord is gewijzigd
                var existingCustomer = await _context.Customers.AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == customer.Id);
                
                if (existingCustomer != null && customer.Password != existingCustomer.Password)
                {
                    // Hash het nieuwe wachtwoord
                    customer.Password = HashPassword(customer.Password);
                }
            }
            else
            {
                // Als geen nieuw wachtwoord is opgegeven, behoud het bestaande
                var existingCustomer = await _context.Customers.AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == customer.Id);
                
                if (existingCustomer != null)
                {
                    customer.Password = existingCustomer.Password;
                }
            }
            
            _context.Entry(customer).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer != null)
            {
                _context.Customers.Remove(customer);
                await _context.SaveChangesAsync();
            }
        }

        // Hulpmethode voor het hashen van wachtwoorden
        private string HashPassword(string password)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                // Bereken hash 
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));
                
                // Converteer byte array naar string
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }
    }
}