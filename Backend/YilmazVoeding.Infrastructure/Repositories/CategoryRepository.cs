using Microsoft.EntityFrameworkCore;
using YilmazVoeding.Core.Interfaces;
using YilmazVoeding.Core.Models;
using YilmazVoeding.Infrastructure.Data;

namespace YilmazVoeding.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly YilmazVoedingContext _context;

        public CategoryRepository(YilmazVoedingContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _context.Categories
                .ToListAsync();
        }

        public async Task<Category> GetByIdAsync(int id)
        {
            return await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Category> AddAsync(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task UpdateAsync(Category category)
        {
            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category != null)
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
            }
        }
    }
}