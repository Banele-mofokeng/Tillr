using Microsoft.EntityFrameworkCore;
using Tillr.Domain.Enums;
using Tillr.Infrastructure.Persistence;

namespace Tillr.Application.Sales.Queries;

public record SaleItemDto(string Name, decimal Quantity, decimal UnitPrice, decimal LineTotal);

public record SaleDto(
    Guid Id,
    string Reference,
    string? CustomerName,
    string PaymentMethod,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt,
    List<SaleItemDto> Items
);

public record DailySummaryDto(
    DateTime Date,
    int TotalTransactions,
    decimal TotalRevenue,
    decimal CashTotal,
    decimal CardTotal,
    decimal OtherTotal
);

public class GetSalesQuery
{
    private readonly AppDbContext _db;

    public GetSalesQuery(AppDbContext db) => _db = db;

    public async Task<List<SaleDto>> GetTodayAsync(Guid businessId)
    {
        var today = DateTime.UtcNow.Date;

        return await _db.Sales
            .Where(s => s.BusinessId == businessId && s.CreatedAt >= today)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SaleDto(
                s.Id,
                s.Reference,
                s.CustomerName,
                s.PaymentMethod.ToString(),
                s.TotalAmount,
                s.Status.ToString(),
                s.CreatedAt,
                s.Items.Select(i => new SaleItemDto(i.Name, i.Quantity, i.UnitPrice, i.LineTotal)).ToList()
            ))
            .ToListAsync();
    }

    public async Task<DailySummaryDto> GetDailySummaryAsync(Guid businessId, DateTime date)
    {
        var start = date.Date;
        var end = start.AddDays(1);

        var sales = await _db.Sales
            .Where(s => s.BusinessId == businessId
                     && s.CreatedAt >= start
                     && s.CreatedAt < end
                     && s.Status == SaleStatus.Completed)
            .ToListAsync();

        return new DailySummaryDto(
            date,
            sales.Count,
            sales.Sum(s => s.TotalAmount),
            sales.Where(s => s.PaymentMethod == PaymentMethod.Cash).Sum(s => s.TotalAmount),
            sales.Where(s => s.PaymentMethod == PaymentMethod.Card).Sum(s => s.TotalAmount),
            sales.Where(s => s.PaymentMethod == PaymentMethod.Other).Sum(s => s.TotalAmount)
        );
    }
}
