# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore
COPY Tillr.Domain/Tillr.Domain.csproj Tillr.Domain/
COPY Tillr.Application/Tillr.Application.csproj Tillr.Application/
COPY Tillr.Infrastructure/Tillr.Infrastructure.csproj Tillr.Infrastructure/
COPY Tillr.API/Tillr.API.csproj Tillr.API/

RUN dotnet restore Tillr.API/Tillr.API.csproj

# Copy everything and build
COPY . .
RUN dotnet publish Tillr.API/Tillr.API.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

ENTRYPOINT ["dotnet", "Tillr.API.dll"]
