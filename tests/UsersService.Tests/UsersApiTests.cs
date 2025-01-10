using Microsoft.EntityFrameworkCore;
using UsersService.Data;
using UsersService.Models;
using Xunit;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace UsersService.Tests
{
    public class UsersApiTests
    {
        private List<User> GetSampleUsers() => new()
        {
            new User { Id = 1, Name = "Alice", Rut = "12345678-9", Email = "alice@example.com", Birthday = new DateTime(1990, 1, 1) },
            new User { Id = 2, Name = "Bob", Rut = "98765432-1", Email = "bob@example.com", Birthday = new DateTime(1985, 5, 15) },
            new User { Id = 3, Name = "Charlie", Rut = "11223344-5", Email = "charlie@example.com", Birthday = new DateTime(2000, 10, 20) }
        };

        private UsersDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<UsersDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new UsersDbContext(options);

            // Seed data
            context.Users.AddRange(GetSampleUsers());
            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task GetAllUsers_ReturnsPaginatedResults()
        {
            // Arrange
            var dbContext = GetInMemoryDbContext();

            // Act
            var query = dbContext.Users.AsQueryable();
            query = query.OrderBy(u => u.Name).Skip(0).Take(2);

            var result = await query.ToListAsync();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Alice", result[0].Name);
            Assert.Equal("Bob", result[1].Name);
        }

        [Fact]
        public async Task GetUserById_ReturnsCorrectUser()
        {
            // Arrange
            var dbContext = GetInMemoryDbContext();

            var userId = 1;

            // Act
            var user = await dbContext.Users.FindAsync(userId);

            // Assert
            Assert.NotNull(user);
            Assert.Equal("Alice", user!.Name);
        }

        [Fact]
        public async Task AddUser_InsertsUserCorrectly()
        {
            // Arrange
            var dbContext = GetInMemoryDbContext();

            var newUser = new User
            {
                Id = 4,
                Name = "David",
                Rut = "55667788-9",
                Email = "david@example.com",
                Birthday = new DateTime(1992, 8, 12)
            };

            // Act
            dbContext.Users.Add(newUser);
            await dbContext.SaveChangesAsync();

            // Assert
            var userInDb = await dbContext.Users.FindAsync(4);
            Assert.NotNull(userInDb);
            Assert.Equal("David", userInDb!.Name);
        }

        [Fact]
        public async Task UpdateUser_UpdatesFieldsCorrectly()
        {
            // Arrange
            var dbContext = GetInMemoryDbContext();

            var userId = 1;

            // Act
            var user = await dbContext.Users.FindAsync(userId);
            if (user != null)
            {
                user.Name = "Alice Updated";
                await dbContext.SaveChangesAsync();
            }

            // Assert
            var updatedUser = await dbContext.Users.FindAsync(userId);
            Assert.NotNull(updatedUser);
            Assert.Equal("Alice Updated", updatedUser!.Name);
        }

        [Fact]
        public async Task DeleteUser_RemovesUserCorrectly()
        {
            // Arrange
            var dbContext = GetInMemoryDbContext();

            var userId = 1;

            // Act
            var user = await dbContext.Users.FindAsync(userId);
            if (user != null)
            {
                dbContext.Users.Remove(user);
                await dbContext.SaveChangesAsync();
            }

            // Assert
            var deletedUser = await dbContext.Users.FindAsync(userId);
            Assert.Null(deletedUser);
        }
    }
}
