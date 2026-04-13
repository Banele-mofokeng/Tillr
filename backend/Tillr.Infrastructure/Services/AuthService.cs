using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Tillr.Infrastructure.Persistence;

namespace Tillr.Infrastructure.Services;

public record LoginResult(bool Success, Guid? BusinessId, string? BusinessName, string? Slug);

public class AuthService
{
    private readonly AppDbContext _db;

    public AuthService(AppDbContext db) => _db = db;

    public async Task<LoginResult> LoginAsync(string slug, string pin)
    {
        var business = await _db.Businesses
            .FirstOrDefaultAsync(b => b.Slug == slug.ToLower());

        if (business is null) return new LoginResult(false, null, null, null);

        var hash = HashPin(pin);
        if (hash != business.PinHash) return new LoginResult(false, null, null, null);

        return new LoginResult(true, business.Id, business.Name, business.Slug);
    }

    public static string HashPin(string pin)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(pin));
        return Convert.ToHexString(bytes).ToLower();
    }
}
