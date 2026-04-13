# Tillr — Simple POS for SA Small Businesses

A lightweight point-of-sale system for mixed retail + food businesses. Built with .NET 8 + React + PostgreSQL.

---

## Project Structure

```
tillr/
├── backend/
│   ├── Tillr.Domain/          # Entities, Enums
│   ├── Tillr.Application/     # Handlers, Queries, DTOs
│   ├── Tillr.Infrastructure/  # EF Core DbContext, Repositories, Services
│   └── Tillr.API/             # Controllers, Program.cs
└── frontend/
    └── src/
        ├── api/               # Axios client + endpoint methods
        ├── components/        # Layout + reusable UI
        ├── pages/             # auth, dashboard, sales, history, summary
        ├── store/             # Zustand (auth + cart)
        ├── types/             # TypeScript interfaces
        └── utils/             # Formatters (ZAR currency, dates)
```

---

## Getting Started

### Backend

```bash
cd backend/Tillr.API
# Update appsettings.json with your Postgres connection string
dotnet ef database update
dotnet run
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## MVP Features

- PIN login per business (multi-tenant)
- New sale with product shortcuts + manual items
- Auto-generated sale reference numbers
- Cash / Card / Other payment methods
- Today's sales history with void support
- End-of-day summary with WhatsApp share
- Daily revenue dashboard

## Stack

| Layer | Tech |
|---|---|
| Backend | .NET 8, ASP.NET Core, EF Core |
| Database | PostgreSQL (Npgsql) |
| Frontend | React 18, TypeScript, Vite |
| State | Zustand |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Hosting | EasyPanel (recommended) |
