using Tillr.Domain.Enums;

namespace Tillr.Domain.Entities;

public class Sale : BaseEntity
{
    public Guid BusinessId { get; set; }
    public string Reference { get; set; } = string.Empty; // e.g. "0042"
    public string? CustomerName { get; set; }             // optional: "Table 3", "John"
    public PaymentMethod PaymentMethod { get; set; }
    public decimal TotalAmount { get; set; }
    public SaleStatus Status { get; set; } = SaleStatus.Completed;

    // Navigation
    public Business Business { get; set; } = null!;
    public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
}
