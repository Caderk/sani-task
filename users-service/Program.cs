using Microsoft.EntityFrameworkCore;
using UsersService.Data;
using UsersService.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<UsersDbContext>(options =>
{
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 0)));
});

var app = builder.Build();

// 2. Use the CORS policy
app.UseCors("AllowAll");

// Minimal CRUD endpoints
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
