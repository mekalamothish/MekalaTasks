# Task API - ASP.NET Core Web API

A complete RESTful API built with ASP.NET Core 8.0 for managing tasks and comments.

## Project Structure

```
TaskAPI/
├── Models/
│   ├── Task.cs
│   └── Comment.cs
├── Data/
│   └── ApplicationDbContext.cs
├── DTOs/
│   ├── CreateTaskDto.cs
│   ├── UpdateTaskDto.cs
│   ├── TaskResponseDto.cs
│   └── CommentDto.cs
├── Controllers/
│   ├── TasksController.cs
│   └── CommentsController.cs
├── Migrations/
│   └── [EF Core migrations]
├── TaskAPI.csproj
├── Program.cs
├── appsettings.json
└── appsettings.Development.json
```

## Prerequisites

- .NET 8.0 SDK
- PostgreSQL database
- Visual Studio Code or Visual Studio 2022

## Setup Instructions

### 1. Create PostgreSQL Database
```bash
createdb TaskDB
```

### 2. Create Project
```bash
dotnet new webapi -n TaskAPI -f net8.0
cd TaskAPI
```

### 3. Add NuGet Packages
```bash
dotnet add package Microsoft.EntityFrameworkCore --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Npgsql --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.0
dotnet add package Swashbuckle.AspNetCore --version 6.4.6
```

### 4. Update Connection String
Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=TaskDB;Username=postgres;Password=your_password"
  }
}
```

### 5. Run Migrations
```bash
dotnet ef database update
```

### 6. Run the API
```bash
dotnet run
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `http://localhost:5000/swagger`

## API Endpoints

### Tasks

**Get all tasks**
```
GET /api/tasks
```

**Get task by ID**
```
GET /api/tasks/{id}
```

**Create new task**
```
POST /api/tasks
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "dueDate": "2025-12-31",
  "requiresRevision": false
}
```

**Update task**
```
PUT /api/tasks/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "in_progress",
  "requiresRevision": true
}
```

**Delete task**
```
DELETE /api/tasks/{id}
```

### Comments

**Get comments for a task**
```
GET /api/tasks/{taskId}/comments
```

**Add comment to a task**
```
POST /api/tasks/{taskId}/comments
Content-Type: application/json

{
  "content": "Comment text here"
}
```

**Delete comment**
```
DELETE /api/tasks/{taskId}/comments/{commentId}
```

## Response Models

### Task Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project",
  "description": "Finish the task management API",
  "status": "in_progress",
  "requiresRevision": false,
  "dueDate": "2025-12-31",
  "createdAt": "2025-11-12T10:30:00Z",
  "updatedAt": "2025-11-12T10:30:00Z"
}
```

### Comment Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Working on this task",
  "createdAt": "2025-11-12T10:30:00Z"
}
```

## Database Schema

### Tasks Table
- `Id` (UUID, Primary Key)
- `Title` (String, Required)
- `Description` (String, Nullable)
- `Status` (String: todo, in_progress, completed)
- `RequiresRevision` (Boolean, Nullable)
- `DueDate` (Date, Nullable)
- `CreatedAt` (DateTime)
- `UpdatedAt` (DateTime)

### Comments Table
- `Id` (UUID, Primary Key)
- `TaskId` (UUID, Foreign Key)
- `Content` (String, Required)
- `CreatedAt` (DateTime)

## Development Commands

### Run with hot reload
```bash
dotnet watch run
```

### Create a migration
```bash
dotnet ef migrations add MigrationName
```

### Update database
```bash
dotnet ef database update
```

### Remove last migration
```bash
dotnet ef migrations remove
```

## CORS Configuration

The API is configured to allow requests from any origin. Update the CORS policy in `Program.cs` if needed:

```csharp
options.AddPolicy("AllowAll", policy =>
{
    policy.AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader();
});
```

## Frontend Integration

Update the React app's `.env` file:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Deployment

### Docker
Create a Dockerfile in the TaskAPI directory:
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TaskAPI.csproj", "."]
RUN dotnet restore "TaskAPI.csproj"
COPY . .
RUN dotnet build "TaskAPI.csproj" -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/build .
EXPOSE 5000 5001
ENTRYPOINT ["dotnet", "TaskAPI.dll"]
```

### Environment Variables
Set via environment:
```bash
ConnectionStrings__DefaultConnection=Host=db_host;Port=5432;Database=TaskDB;Username=user;Password=pass
```

## Troubleshooting

**Database connection error**
- Verify PostgreSQL is running
- Check connection string in appsettings.json
- Ensure database exists

**Port already in use**
```bash
dotnet run --urls "http://localhost:5002"
```

**Migration issues**
```bash
dotnet ef database drop
dotnet ef database update
```
