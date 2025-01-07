using UsersService.Models;
using Microsoft.EntityFrameworkCore;

namespace UsersService.Data
{
    public class UsersDbContext : DbContext
    {
        public UsersDbContext(DbContextOptions<UsersDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
    }
}
