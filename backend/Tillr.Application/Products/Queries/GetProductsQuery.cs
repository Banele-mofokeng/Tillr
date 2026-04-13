using Microsoft.EntityFrameworkCore;
using Tillr.Infrastructure.Persistence;

namespace Tillr.Application.Products.Queries;

public record ProductDto(
    Guid Id,
    string Name,
    decimal Price,
    string Category,
    string? Barcode,
    bool IsActive
);

public class GetProductsQuery
{
    private readonly AppDbContext _db;

    public GetProductsQuery(AppDbContext db) => _db = db;

    public async Task<List<ProductDto>> GetAllAsync(Guid businessId) =>
        await _db.Products
            .Where(p => p.BusinessId == businessId && p.IsActive)
            .OrderBy(p => p.Category).ThenBy(p => p.Name)
            .Select(p => new ProductDto(p.Id, p.Name, p.Price, p.Category, p.Barcode, p.IsActive))
            .ToListAsync();

    public async Task<ProductDto?> GetByBarcodeAsync(Guid businessId, string barcode) =>
        await _db.Products
            .Where(p => p.BusinessId == businessId && p.Barcode == barcode && p.IsActive)
            .Select(p => new ProductDto(p.Id, p.Name, p.Price, p.Category, p.Barcode, p.IsActive))
            .FirstOrDefaultAsync();
}
