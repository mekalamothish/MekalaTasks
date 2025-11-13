# Complete C# ASP.NET Core API Code

Copy these files into your ASP.NET Core project.

---

## File: TaskAPI.csproj

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Npgsql" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.6" />
  </ItemGroup>

</Project>
```

---

## File: Models/Task.cs

```csharp
namespace TaskAPI.Models;

public class Task
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.Todo;
    public bool? RequiresRevision { get; set; }
    public DateOnly? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}

public enum TaskStatus
{
    todo,
    in_progress,
    completed
}
```

---

## File: Models/Comment.cs

```csharp
namespace TaskAPI.Models;

public class Comment
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Task? Task { get; set; }
}
```

---

## File: Data/ApplicationDbContext.cs

```csharp
using Microsoft.EntityFrameworkCore;
using TaskAPI.Models;

namespace TaskAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Task> Tasks { get; set; }
    public DbSet<Comment> Comments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Task>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasMany(e => e.Comments)
                .WithOne(c => c.Task)
                .HasForeignKey(c => c.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired();
        });
    }
}
```

---

## File: DTOs/CreateTaskDto.cs

```csharp
namespace TaskAPI.DTOs;

public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "todo";
    public DateOnly? DueDate { get; set; }
    public bool RequiresRevision { get; set; }
}
```

---

## File: DTOs/UpdateTaskDto.cs

```csharp
namespace TaskAPI.DTOs;

public class UpdateTaskDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public DateOnly? DueDate { get; set; }
    public bool? RequiresRevision { get; set; }
}
```

---

## File: DTOs/TaskResponseDto.cs

```csharp
namespace TaskAPI.DTOs;

public class TaskResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "todo";
    public bool? RequiresRevision { get; set; }
    public string? DueDate { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}
```

---

## File: DTOs/CommentDto.cs

```csharp
namespace TaskAPI.DTOs;

public class CreateCommentDto
{
    public string Content { get; set; } = string.Empty;
}

public class CommentResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string TaskId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
}
```

---

## File: Controllers/TasksController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskAPI.Data;
using TaskAPI.DTOs;
using TaskAPI.Models;

namespace TaskAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TasksController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetTasks()
    {
        var tasks = await _context.Tasks
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => MapToResponseDto(t))
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskResponseDto>> GetTask(Guid id)
    {
        var task = await _context.Tasks.FindAsync(id);

        if (task == null)
        {
            return NotFound();
        }

        return Ok(MapToResponseDto(task));
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponseDto>> CreateTask(CreateTaskDto dto)
    {
        var task = new Task
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Status = Enum.Parse<TaskStatus>(dto.Status),
            DueDate = dto.DueDate,
            RequiresRevision = dto.RequiresRevision,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, MapToResponseDto(task));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskResponseDto>> UpdateTask(Guid id, UpdateTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);

        if (task == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrEmpty(dto.Title))
            task.Title = dto.Title;

        if (dto.Description != null)
            task.Description = dto.Description;

        if (!string.IsNullOrEmpty(dto.Status))
            task.Status = Enum.Parse<TaskStatus>(dto.Status);

        if (dto.DueDate != null)
            task.DueDate = dto.DueDate;

        if (dto.RequiresRevision != null)
            task.RequiresRevision = dto.RequiresRevision;

        task.UpdatedAt = DateTime.UtcNow;

        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();

        return Ok(MapToResponseDto(task));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var task = await _context.Tasks.FindAsync(id);

        if (task == null)
        {
            return NotFound();
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static TaskResponseDto MapToResponseDto(Task task)
    {
        return new TaskResponseDto
        {
            Id = task.Id.ToString(),
            Title = task.Title,
            Description = task.Description,
            Status = task.Status.ToString(),
            RequiresRevision = task.RequiresRevision,
            DueDate = task.DueDate?.ToString("yyyy-MM-dd"),
            CreatedAt = task.CreatedAt.ToString("O"),
            UpdatedAt = task.UpdatedAt.ToString("O")
        };
    }
}
```

---

## File: Controllers/CommentsController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskAPI.Data;
using TaskAPI.DTOs;
using TaskAPI.Models;

namespace TaskAPI.Controllers;

[ApiController]
[Route("api/tasks/{taskId}/comments")]
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CommentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommentResponseDto>>> GetComments(Guid taskId)
    {
        var taskExists = await _context.Tasks.AnyAsync(t => t.Id == taskId);
        if (!taskExists)
        {
            return NotFound("Task not found");
        }

        var comments = await _context.Comments
            .Where(c => c.TaskId == taskId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => MapToResponseDto(c))
            .ToListAsync();

        return Ok(comments);
    }

    [HttpPost]
    public async Task<ActionResult<CommentResponseDto>> CreateComment(Guid taskId, CreateCommentDto dto)
    {
        var taskExists = await _context.Tasks.AnyAsync(t => t.Id == taskId);
        if (!taskExists)
        {
            return NotFound("Task not found");
        }

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetComments), new { taskId }, MapToResponseDto(comment));
    }

    [HttpDelete("{commentId}")]
    public async Task<IActionResult> DeleteComment(Guid taskId, Guid commentId)
    {
        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == commentId && c.TaskId == taskId);

        if (comment == null)
        {
            return NotFound();
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static CommentResponseDto MapToResponseDto(Comment comment)
    {
        return new CommentResponseDto
        {
            Id = comment.Id.ToString(),
            TaskId = comment.TaskId.ToString(),
            Content = comment.Content,
            CreatedAt = comment.CreatedAt.ToString("O")
        };
    }
}
```

---

## File: Program.cs

```csharp
using Microsoft.EntityFrameworkCore;
using TaskAPI.Data;

var builder = WebApplicationBuilder.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
}

app.Run();
```

---

## File: appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=TaskDB;Username=postgres;Password=postgres"
  }
}
```

---

## File: appsettings.Development.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
```

---

## Quick Start

1. Create a new ASP.NET Core project:
   ```bash
   dotnet new webapi -n TaskAPI -f net8.0
   cd TaskAPI
   ```

2. Add NuGet packages:
   ```bash
   dotnet add package Microsoft.EntityFrameworkCore --version 8.0.0
   dotnet add package Microsoft.EntityFrameworkCore.Npgsql --version 8.0.0
   dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.0
   dotnet add package Swashbuckle.AspNetCore --version 6.4.6
   ```

3. Create the folder structure:
   ```bash
   mkdir Models Data DTOs Controllers Migrations
   ```

4. Copy all the files above into their respective folders

5. Update database connection in `appsettings.json`

6. Create and apply migrations:
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

7. Run the API:
   ```bash
   dotnet run
   ```

The API will be available at `http://localhost:5000`
