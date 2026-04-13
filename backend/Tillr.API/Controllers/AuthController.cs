using Microsoft.AspNetCore.Mvc;
using Tillr.Infrastructure.Services;

namespace Tillr.API.Controllers;

public record LoginRequest(string Slug, string Pin);

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth) => _auth = auth;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var result = await _auth.LoginAsync(req.Slug, req.Pin);
        if (!result.Success) return Unauthorized(new { message = "Invalid business ID or PIN." });
        return Ok(result);
    }
}
