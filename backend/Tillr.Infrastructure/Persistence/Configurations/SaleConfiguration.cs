using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tillr.Domain.Entities;

namespace Tillr.Infrastructure.Persistence.Configurations;

public class SaleConfiguration : IEntityTypeConfiguration<Sale>
{
    public void Configure(EntityTypeBuilder<Sale> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Reference).IsRequired().HasMaxLength(20);
        builder.Property(s => s.CustomerName).HasMaxLength(100);
        builder.Property(s => s.TotalAmount).HasPrecision(10, 2);
        builder.Property(s => s.PaymentMethod).HasConversion<string>();
        builder.Property(s => s.Status).HasConversion<string>();

        builder.HasMany(s => s.Items)
               .WithOne(i => i.Sale)
               .HasForeignKey(i => i.SaleId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
