using Microsoft.EntityFrameworkCore;
using Tillr.Application.Products.Commands;
using Tillr.Application.Products.Queries;
using Tillr.Application.Sales.Commands;
using Tillr.Application.Sales.Queries;
using Tillr.Infrastructure.Persistence;
using Tillr.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Application handlers
builder.Services.AddScoped<CreateSaleHandler>();
builder.Services.AddScoped<VoidSaleHandler>();
builder.Services.AddScoped<GetSalesQuery>();
builder.Services.AddScoped<GetProductsQuery>();
builder.Services.AddScoped<ProductCommandHandler>();

// Infrastructure services
builder.Services.AddScoped<AuthService>();

// CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.MapControllers();
app.Run();
