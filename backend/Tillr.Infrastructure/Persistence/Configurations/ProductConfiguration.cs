using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tillr.Domain.Entities;

namespace Tillr.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Category).HasMaxLength(50);
        builder.Property(p => p.Barcode).HasMaxLength(50);
        builder.Property(p => p.Price).HasPrecision(10, 2);

        // One barcode per business (unique per tenant)
        builder.HasIndex(p => new { p.BusinessId, p.Barcode })
               .IsUnique()
               .HasFilter("[Barcode] IS NOT NULL");
    }
}
