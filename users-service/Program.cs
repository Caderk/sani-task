using Microsoft.EntityFrameworkCore;
using UsersService.Data;
using UsersService.Models;

var builder = WebApplication.CreateBuilder(args);

// Retrieve connection string from environment variables or appsettings
// "ConnectionStrings__DefaultConnection" is set in docker-compose
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<UsersDbContext>(options =>
{
    options.UseMySql(connectionString,
        new MySqlServerVersion(new Version(8, 0, 0))); 
});

// Add services to the container if needed, e.g., builder.Services.AddControllers(); 
// (Not required for minimal APIs unless you want controllers)

var app = builder.Build();

// Example Minimal CRUD endpoints
app.MapGet("/", () => "Hello from .NET 8 Users Service!");

// Get all users
app.MapGet("/api/users", async (UsersDbContext db) =>
{
    return await db.Users.ToListAsync();
});

// Get user by ID
app.MapGet("/api/users/{id}", async (int id, UsersDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    return user is not null ? Results.Ok(user) : Results.NotFound();
});

// Create a new user
app.MapPost("/api/users", async (User user, UsersDbContext db) =>
{
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Created($"/api/users/{user.Id}", user);
});

// Update a user by ID
app.MapPut("/api/users/{id}", async (int id, User updatedUser, UsersDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user is null)
        return Results.NotFound();

    user.Name = updatedUser.Name;
    user.Rut = updatedUser.Rut;
    user.Email = updatedUser.Email;
    user.Birthday = updatedUser.Birthday;

    await db.SaveChangesAsync();
    return Results.Ok(user);
});

// Delete a user by ID
app.MapDelete("/api/users/{id}", async (int id, UsersDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user is null)
        return Results.NotFound();

    db.Users.Remove(user);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Run the app
app.Run();
