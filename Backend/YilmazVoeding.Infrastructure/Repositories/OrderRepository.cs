using Microsoft.EntityFrameworkCore;
using YilmazVoeding.Core.Interfaces;
using YilmazVoeding.Core.Models;
using YilmazVoeding.Infrastructure.Data;

namespace YilmazVoeding.Infrastructure.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly YilmazVoedingContext _context;

        public OrderRepository(YilmazVoedingContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Order>> GetAllAsync()
        {
            return await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .ToListAsync();
        }

        public async Task<Order> GetByIdAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<IEnumerable<Order>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Where(o => o.CustomerId == customerId)
                .ToListAsync();
        }

        public async Task<Order> AddAsync(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task UpdateAsync(Order order)
        {
            _context.Entry(order).State = EntityState.Modified;
            
            // Bestaande OrderItems verwijderen
            var existingOrderItems = await _context.OrderItems
                .Where(oi => oi.OrderId == order.Id)
                .ToListAsync();
            
            _context.OrderItems.RemoveRange(existingOrderItems);
            
            // Nieuwe OrderItems toevoegen
            foreach (var item in order.OrderItems)
            {
                _context.OrderItems.Add(item);
            }
            
            await _context.SaveChangesAsync();
        }

        public async Task UpdateStatusAsync(int id, OrderStatus status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order != null)
            {
                order.Status = status;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order != null)
            {
                // Verwijder eerst alle OrderItems
                var orderItems = await _context.OrderItems
                    .Where(oi => oi.OrderId == id)
                    .ToListAsync();
                
                _context.OrderItems.RemoveRange(orderItems);
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();
            }
        }
    }
}