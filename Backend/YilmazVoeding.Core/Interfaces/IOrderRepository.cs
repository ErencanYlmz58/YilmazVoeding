using YilmazVoeding.Core.Models;

namespace YilmazVoeding.Core.Interfaces
{
    public interface IOrderRepository
    {
        Task<IEnumerable<Order>> GetAllAsync();
        Task<Order> GetByIdAsync(int id);
        Task<IEnumerable<Order>> GetByCustomerIdAsync(int customerId);
        Task<Order> AddAsync(Order order);
        Task UpdateAsync(Order order);
        Task UpdateStatusAsync(int id, OrderStatus status);
        Task DeleteAsync(int id);
    }
}