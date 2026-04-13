# Deploying Tillr on EasyPanel

## Prerequisites
- EasyPanel running on your VPS
- SQL Server instance accessible from EasyPanel
- A domain or subdomain pointing to your server (e.g. `api.tillr.co.za`, `app.tillr.co.za`)

---

## Step 1 — Create the Database

On your SQL Server instance, create a new database:

```sql
CREATE DATABASE Tillr;
```

---

## Step 2 — Deploy the API

1. **+ New Service** → **App**
2. Name: `tillr-api`
3. Source: connect your GitHub repo → select the `backend/` folder
4. Dockerfile path: `backend/Dockerfile`
5. Port: `5000`

**Environment Variables** (set in EasyPanel → Service → Environment):
```
ConnectionStrings__DefaultConnection=Server=YOUR_SERVER;Database=Tillr;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;
ASPNETCORE_ENVIRONMENT=Production
```

6. Enable **HTTPS** and set your domain: `api.tillr.co.za`
7. Deploy

**Run migrations** (one-time, via EasyPanel terminal):
```bash
dotnet ef database update
```

---

## Step 3 — Deploy the Frontend

1. **+ New Service** → **App**
2. Name: `tillr-web`
3. Source: connect your GitHub repo → select the `frontend/` folder
4. Dockerfile path: `frontend/Dockerfile`

**Build Args** (set in EasyPanel → Service → Build Args):
```
VITE_API_URL=https://api.tillr.co.za/api
```

> ⚠️ The API URL must be set at **build time** for Vite — it gets baked into the JS bundle.

5. Port: `80`
6. Enable **HTTPS** and set your domain: `app.tillr.co.za`
7. Deploy

---

## Step 4 — Update CORS in the API

Once you have your frontend URL, update `Program.cs`:

```csharp
policy.WithOrigins("https://app.tillr.co.za")
```

Then redeploy the API.

---

## Step 5 — Seed Your First Business

Run this against your `Tillr` database to create the first pilot business:

```sql
INSERT INTO Businesses (Id, Name, Slug, PinHash, CreatedAt)
VALUES (
  NEWID(),
  'Mama Kitchen',
  'mama-kitchen',
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  GETUTCDATE()
);
```

> PIN hash above is SHA256 of "1234". Generate your own:

PowerShell:
```powershell
[System.BitConverter]::ToString(
  [System.Security.Cryptography.SHA256]::Create().ComputeHash(
    [System.Text.Encoding]::UTF8.GetBytes("1234")
  )
).Replace("-","").ToLower()
```

---

## URLs

| Service | URL |
|---|---|
| Frontend | https://app.tillr.co.za |
| API | https://api.tillr.co.za |
| Swagger | https://api.tillr.co.za/swagger |
