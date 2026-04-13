using Microsoft.AspNetCore.Mvc;
using Tillr.Application.Sales.Commands;
using Tillr.Application.Sales.Queries;

namespace Tillr.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly CreateSaleHandler _createHandler;
    private readonly VoidSaleHandler _voidHandler;
    private readonly GetSalesQuery _query;

    public SalesController(CreateSaleHandler createHandler, VoidSaleHandler voidHandler, GetSalesQuery query)
    {
        _createHandler = createHandler;
        _voidHandler = voidHandler;
        _query = query;
    }

    [HttpGet("{businessId}/today")]
    public async Task<IActionResult> GetToday(Guid businessId)
    {
        var sales = await _query.GetTodayAsync(businessId);
        return Ok(sales);
    }

    [HttpGet("{businessId}/summary")]
    public async Task<IActionResult> GetSummary(Guid businessId, [FromQuery] DateTime? date)
    {
        var summary = await _query.GetDailySummaryAsync(businessId, date ?? DateTime.UtcNow);
        return Ok(summary);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSaleCommand cmd)
    {
        var result = await _createHandler.HandleAsync(cmd);
        return Ok(result);
    }

    [HttpPatch("{saleId}/void")]
    public async Task<IActionResult> Void(Guid saleId, [FromQuery] Guid businessId)
    {
        var success = await _voidHandler.HandleAsync(new VoidSaleCommand(saleId, businessId));
        return success ? Ok() : NotFound();
    }
}
