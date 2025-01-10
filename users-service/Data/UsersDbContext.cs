using Microsoft.EntityFrameworkCore;
using UsersService.Models;

namespace UsersService.Data
{
    public class UsersDbContext : DbContext
    {
        public UsersDbContext(DbContextOptions<UsersDbContext> options) : base(options) { }

        public virtual DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Map the entity to the "users" table
            modelBuilder.Entity<User>().ToTable("users");

            // If you want to enforce constraints, indexes, etc. here
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Rut).IsUnique();
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
