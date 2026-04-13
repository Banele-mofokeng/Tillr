using Microsoft.EntityFrameworkCore;
using Tillr.Domain.Entities;
using Tillr.Infrastructure.Persistence;

namespace Tillr.Application.Products.Commands;

// --- Create ---
public record CreateProductCommand(
    Guid BusinessId,
    string Name,
    decimal Price,
    string Category,
    string? Barcode
);

// --- Update ---
public record UpdateProductCommand(
    Guid ProductId,
    Guid BusinessId,
    string Name,
    decimal Price,
    string Category,
    string? Barcode,
    bool IsActive
);

public class ProductCommandHandler
{
    private readonly AppDbContext _db;

    public ProductCommandHandler(AppDbContext db) => _db = db;

    public async Task<Guid> CreateAsync(CreateProductCommand cmd)
    {
        // Check barcode uniqueness within the business
        if (!string.IsNullOrWhiteSpace(cmd.Barcode))
        {
            var exists = await _db.Products.AnyAsync(p =>
                p.BusinessId == cmd.BusinessId && p.Barcode == cmd.Barcode);

            if (exists) throw new InvalidOperationException("A product with this barcode already exists.");
        }

        var product = new Product
        {
            BusinessId = cmd.BusinessId,
            Name = cmd.Name.Trim(),
            Price = cmd.Price,
            Category = cmd.Category,
            Barcode = string.IsNullOrWhiteSpace(cmd.Barcode) ? null : cmd.Barcode.Trim(),
            IsActive = true,
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return product.Id;
    }

    public async Task<bool> UpdateAsync(UpdateProductCommand cmd)
    {
        var product = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == cmd.ProductId && p.BusinessId == cmd.BusinessId);

        if (product is null) return false;

        // Check barcode uniqueness — exclude self
        if (!string.IsNullOrWhiteSpace(cmd.Barcode))
        {
            var taken = await _db.Products.AnyAsync(p =>
                p.BusinessId == cmd.BusinessId &&
                p.Barcode == cmd.Barcode &&
                p.Id != cmd.ProductId);

            if (taken) throw new InvalidOperationException("Another product already has this barcode.");
        }

        product.Name = cmd.Name.Trim();
        product.Price = cmd.Price;
        product.Category = cmd.Category;
        product.Barcode = string.IsNullOrWhiteSpace(cmd.Barcode) ? null : cmd.Barcode.Trim();
        product.IsActive = cmd.IsActive;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid productId, Guid businessId)
    {
        var product = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == productId && p.BusinessId == businessId);

        if (product is null) return false;

        // Soft delete — keep historical sale records intact
        product.IsActive = false;
        await _db.SaveChangesAsync();
        return true;
    }
}
