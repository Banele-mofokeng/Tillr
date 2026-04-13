using Microsoft.EntityFrameworkCore;
using Tillr.Domain.Enums;
using Tillr.Infrastructure.Persistence;

namespace Tillr.Application.Sales.Commands;

public record VoidSaleCommand(Guid SaleId, Guid BusinessId);

public class VoidSaleHandler
{
    private readonly AppDbContext _db;

    public VoidSaleHandler(AppDbContext db) => _db = db;

    public async Task<bool> HandleAsync(VoidSaleCommand cmd)
    {
        var sale = await _db.Sales
            .FirstOrDefaultAsync(s => s.Id == cmd.SaleId && s.BusinessId == cmd.BusinessId);

        if (sale is null) return false;

        sale.Status = SaleStatus.Voided;
        await _db.SaveChangesAsync();
        return true;
    }
}
