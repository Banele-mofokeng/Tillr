namespace Tillr.Domain.Entities;

public class SaleItem : BaseEntity
{
    public Guid SaleId { get; set; }
    public Guid? ProductId { get; set; }   // null = manually typed item
    public string Name { get; set; } = string.Empty; // snapshot at time of sale
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }

    // Navigation
    public Sale Sale { get; set; } = null!;
    public Product? Product { get; set; }
}
