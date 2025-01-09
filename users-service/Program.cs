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

// -----------------------------------------------------------------------------
// GET /api/users (with pagination & sorting)
// -----------------------------------------------------------------------------
// Query parameters:
//   - page      (int) default=1
//   - pageSize  (int) default=5
//   - sort      (string) one of: id, name, rut, email, birthday (default=id)
//   - sortDir   (string) asc or desc (default=asc)
app.MapGet("/api/users", async (HttpRequest request, UsersDbContext db) =>
{
    // 1) Parse query parameters (page, pageSize, sort, sortDir)
    int page = 1;
    int pageSize = 5;
    string sort = "id";
    string sortDir = "asc";

    // page
    if (request.Query.TryGetValue("page", out var pageVals) 
        && int.TryParse(pageVals.ToString(), out int parsedPage)
        && parsedPage > 0)
    {
        page = parsedPage;
    }

    // pageSize
    if (request.Query.TryGetValue("pageSize", out var pageSizeVals)
        && int.TryParse(pageSizeVals.ToString(), out int parsedPageSize)
        && parsedPageSize > 0)
    {
        pageSize = parsedPageSize;
    }

    // sort (id, name, rut, email, birthday)
    if (request.Query.TryGetValue("sort", out var sortVals))
    {
        // e.g. sort=name or sort=email
        sort = sortVals.ToString().ToLower();
    }

    // sortDir (asc or desc)
    if (request.Query.TryGetValue("sortDir", out var sortDirVals))
    {
        var candidate = sortDirVals.ToString().ToLower();
        if (candidate == "asc" || candidate == "desc")
        {
            sortDir = candidate;
        }
    }

    // 2) Build a Queryable
    IQueryable<User> query = db.Users.AsQueryable();

    // 3) Apply sorting
    //    Switch on the 'sort' field to pick which property to order by
    //    Then apply ascending or descending order based on 'sortDir'
    switch (sort)
    {
        case "name":
            query = sortDir == "asc" 
                ? query.OrderBy(u => u.Name) 
                : query.OrderByDescending(u => u.Name);
            break;
        case "rut":
            query = sortDir == "asc" 
                ? query.OrderBy(u => u.Rut) 
                : query.OrderByDescending(u => u.Rut);
            break;
        case "email":
            query = sortDir == "asc" 
                ? query.OrderBy(u => u.Email ?? "") 
                : query.OrderByDescending(u => u.Email ?? "");
            break;
        case "birthday":
            query = sortDir == "asc" 
                ? query.OrderBy(u => u.Birthday) 
                : query.OrderByDescending(u => u.Birthday);
            break;
        case "id":
        default:
            // default sort by ID
            query = sortDir == "asc" 
                ? query.OrderBy(u => u.Id) 
                : query.OrderByDescending(u => u.Id);
            break;
    }

    // 4) Pagination
    //    - Count total items
    //    - Skip and Take the current page data
    var totalCount = await query.CountAsync();
    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    // 5) Return a structured response
    return Results.Ok(new
    {
        page,
        pageSize,
        sort,
        sortDir,
        totalCount,
        totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        data = items
    });
});

// -----------------------------------------------------------------------------
// GET /api/users/{id}
// -----------------------------------------------------------------------------
app.MapGet("/api/users/{id}", async (int id, UsersDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    return user is not null ? Results.Ok(user) : Results.NotFound();
});

// -----------------------------------------------------------------------------
// POST /api/users
// -----------------------------------------------------------------------------
app.MapPost("/api/users", async (User user, UsersDbContext db) =>
{
    // Convert empty/whitespace email to null
    if (string.IsNullOrWhiteSpace(user.Email))
    {
        user.Email = null;
    }

    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Created($"/api/users/{user.Id}", user);
});

// -----------------------------------------------------------------------------
// PUT /api/users/{id}
// -----------------------------------------------------------------------------
app.MapPut("/api/users/{id}", async (int id, User updatedUser, UsersDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user is null)
        return Results.NotFound();

    // Basic update
    user.Name = updatedUser.Name;
    user.Rut = updatedUser.Rut;
    user.Email = string.IsNullOrWhiteSpace(updatedUser.Email) 
        ? null 
        : updatedUser.Email;
    user.Birthday = updatedUser.Birthday;

    await db.SaveChangesAsync();
    return Results.Ok(user);
});

// -----------------------------------------------------------------------------
// DELETE /api/users/{id}
// -----------------------------------------------------------------------------
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
