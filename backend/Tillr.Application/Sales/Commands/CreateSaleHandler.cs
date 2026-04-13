using Microsoft.EntityFrameworkCore;
using Tillr.Domain.Entities;
using Tillr.Domain.Enums;
using Tillr.Infrastructure.Persistence;

namespace Tillr.Application.Sales.Commands;

public record CreateSaleItemDto(
    Guid? ProductId,
    string Name,
    decimal Quantity,
    decimal UnitPrice
);

public record CreateSaleCommand(
    Guid BusinessId,
    string? CustomerName,
    PaymentMethod PaymentMethod,
    List<CreateSaleItemDto> Items
);

public record CreateSaleResult(Guid SaleId, string Reference);

public class CreateSaleHandler
{
    private readonly AppDbContext _db;

    public CreateSaleHandler(AppDbContext db) => _db = db;

    public async Task<CreateSaleResult> HandleAsync(CreateSaleCommand cmd)
    {
        // Auto-generate reference per business (e.g. 0001, 0042)
        var count = await _db.Sales.CountAsync(s => s.BusinessId == cmd.BusinessId);
        var reference = (count + 1).ToString("D4");

        var sale = new Sale
        {
            BusinessId = cmd.BusinessId,
            Reference = reference,
            CustomerName = cmd.CustomerName,
            PaymentMethod = cmd.PaymentMethod,
            Status = SaleStatus.Completed,
        };

        foreach (var item in cmd.Items)
        {
            var lineTotal = item.Quantity * item.UnitPrice;
            sale.Items.Add(new SaleItem
            {
                ProductId = item.ProductId,
                Name = item.Name,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = lineTotal,
            });
        }

        sale.TotalAmount = sale.Items.Sum(i => i.LineTotal);

        _db.Sales.Add(sale);
        await _db.SaveChangesAsync();

        return new CreateSaleResult(sale.Id, sale.Reference);
    }
}
