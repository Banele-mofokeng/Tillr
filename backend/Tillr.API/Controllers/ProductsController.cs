using Microsoft.AspNetCore.Mvc;
using Tillr.Application.Products.Commands;
using Tillr.Application.Products.Queries;

namespace Tillr.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly GetProductsQuery _query;
    private readonly ProductCommandHandler _commands;

    public ProductsController(GetProductsQuery query, ProductCommandHandler commands)
    {
        _query = query;
        _commands = commands;
    }

    [HttpGet("{businessId}")]
    public async Task<IActionResult> GetAll(Guid businessId)
    {
        var products = await _query.GetAllAsync(businessId);
        return Ok(products);
    }

    [HttpGet("{businessId}/barcode/{barcode}")]
    public async Task<IActionResult> GetByBarcode(Guid businessId, string barcode)
    {
        var product = await _query.GetByBarcodeAsync(businessId, barcode);
        if (product is null) return NotFound(new { message = "No product found for this barcode." });
        return Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand cmd)
    {
        try
        {
            var id = await _commands.CreateAsync(cmd);
            return Ok(new { id });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{productId}")]
    public async Task<IActionResult> Update(Guid productId, [FromBody] UpdateProductCommand cmd)
    {
        try
        {
            var success = await _commands.UpdateAsync(cmd with { ProductId = productId });
            return success ? Ok() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{productId}")]
    public async Task<IActionResult> Delete(Guid productId, [FromQuery] Guid businessId)
    {
        var success = await _commands.DeleteAsync(productId, businessId);
        return success ? Ok() : NotFound();
    }
}
