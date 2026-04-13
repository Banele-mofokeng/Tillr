namespace Tillr.Domain.Entities;

public class Product : BaseEntity
{
    public Guid BusinessId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty; // "Food" | "Retail"
    public string? Barcode { get; set; }                  // EAN-13, UPC-A etc.
    public bool IsActive { get; set; } = true;

    // Navigation
    public Business Business { get; set; } = null!;
}
