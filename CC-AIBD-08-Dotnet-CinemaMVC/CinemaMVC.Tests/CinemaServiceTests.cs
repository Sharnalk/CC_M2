using Microsoft.EntityFrameworkCore;
using CinemaMVC.Web.Data;
using CinemaMVC.Web.Models.Entities;
using CinemaMVC.Web.Repositories;
using CinemaMVC.Web.Services;

namespace CinemaMVC.Tests
{
    /// <summary>
    /// Unit tests for the CinemaService class using EF Core InMemory database provider.
    /// </summary>
    public class CinemaServiceTests
    {
        private static DbContextOptions<ApplicationDbContext> CreateNewInMemoryDatabaseOptions()
        {
            // Generates a unique database name to isolate tests
            return new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        /// <summary>
        /// Tests that GetCinemaByIdAsync returns the correct cinema including its associated rooms.
        /// </summary>
        [Fact]
        public  async Task GetCinemaByIdAsync_ShouldReturnCinema_WhenExists()
        {
            // Arrange
            var options = CreateNewInMemoryDatabaseOptions();
            using (var context = new ApplicationDbContext(options))
            {
                var cinema = new Cinema
                {
                    Id = 1,
                    Name = "CineGroup Bellecour",
                    Address = "Place Bellecour",
                    City = "Lyon"
                };
                var room = new Room
                {
                    Id = 10,
                    Name = "Salle IMAX",
                    Capacity = 300,
                    CinemaId = 1
                };

                await context.Cinemas.AddAsync(cinema);
                await context.Rooms.AddAsync(room);
                await context.SaveChangesAsync();
            }

            using (var context = new ApplicationDbContext(options))
            {
                var repo = new Repository<Cinema>(context);
                var service = new CinemaService(repo);

                // Act
                var result = await service.GetCinemaByIdAsync(1);

                // Assert
                Assert.NotNull(result);
                Assert.Equal("CineGroup Bellecour", result.Name);
                Assert.Single(result.Rooms);
                Assert.Equal("Salle IMAX", result.Rooms.First().Name);
            }
        }

        /// <summary>
        /// Tests that GetCinemasPagedAsync correctly filters cinemas based on search criteria.
        /// </summary>
        [Fact]
        public async Task GetCinemasPagedAsync_ShouldReturnFilteredCinemas_WhenSearchIsProvided()
        {
            // Arrange
            var options = CreateNewInMemoryDatabaseOptions();
            using (var context = new ApplicationDbContext(options))
            {
                await context.Cinemas.AddRangeAsync(
                    new Cinema { Id = 1, Name = "Cinema Pathé", Address = "Rue A", City = "Paris" },
                    new Cinema { Id = 2, Name = "Cinema Gaumont", Address = "Rue B", City = "Lyon" },
                    new Cinema { Id = 3, Name = "CineGroup Ecully", Address = "Rue C", City = "Lyon" }
                );
                await context.SaveChangesAsync();
            }

            using (var context = new ApplicationDbContext(options))
            {
                var repo = new Repository<Cinema>(context);
                var service = new CinemaService(repo);

                // Act - Search "Lyon"
                var (cinemasLyon, totalLyon) = await service.GetCinemasPagedAsync("Lyon", 1, 10);

                // Assert
                Assert.Equal(2, totalLyon);
                Assert.Contains(cinemasLyon, c => c.Name == "Cinema Gaumont");
                Assert.Contains(cinemasLyon, c => c.Name == "CineGroup Ecully");

                // Act - Search "Gaumont"
                var (cinemasGaumont, totalGaumont) = await service.GetCinemasPagedAsync("Gaumont", 1, 10);

                // Assert
                Assert.Equal(1, totalGaumont);
                Assert.Equal("Cinema Gaumont", cinemasGaumont.First().Name);
            }
        }

        /// <summary>
        /// Tests that GetCinemasPagedAsync correctly paginates results.
        /// </summary>
        [Fact]
        public async Task GetCinemasPagedAsync_ShouldPaginateCorrectly()
        {
            // Arrange
            var options = CreateNewInMemoryDatabaseOptions();
            using (var context = new ApplicationDbContext(options))
            {
                await context.Cinemas.AddRangeAsync(
                    new Cinema { Id = 1, Name = "Cinema A", Address = "A", City = "City" },
                    new Cinema { Id = 2, Name = "Cinema B", Address = "B", City = "City" },
                    new Cinema { Id = 3, Name = "Cinema C", Address = "C", City = "City" }
                );
                await context.SaveChangesAsync();
            }

            using (var context = new ApplicationDbContext(options))
            {
                var repo = new Repository<Cinema>(context);
                var service = new CinemaService(repo);

                // Act - Page 1 with size 2
                var (cinemasPage1, totalPage1) = await service.GetCinemasPagedAsync("", 1, 2);
                // Act - Page 2 with size 2
                var (cinemasPage2, totalPage2) = await service.GetCinemasPagedAsync("", 2, 2);

                // Assert
                Assert.Equal(3, totalPage1);
                Assert.Equal(2, cinemasPage1.Count());
                Assert.Single(cinemasPage2);
            }
        }

        /// <summary>
        /// Tests that AddCinemaAsync persists a new cinema record.
        /// </summary>
        [Fact]
        public async Task AddCinemaAsync_ShouldSaveCinema()
        {
            // Arrange
            var options = CreateNewInMemoryDatabaseOptions();
            using (var context = new ApplicationDbContext(options))
            {
                var repo = new Repository<Cinema>(context);
                var service = new CinemaService(repo);

                var newCinema = new Cinema
                {
                    Name = "CineGroup Villeurbanne",
                    Address = "Rue Henri Barbusse",
                    City = "Villeurbanne"
                };

                // Act
                await service.AddCinemaAsync(newCinema);
            }

            // Assert
            using (var context = new ApplicationDbContext(options))
            {
                var saved = await context.Cinemas.FirstOrDefaultAsync();
                Assert.NotNull(saved);
                Assert.Equal("CineGroup Villeurbanne", saved.Name);
            }
        }

        /// <summary>
        /// Tests that UpdateCinemaAsync persists changes to an existing cinema record.
        /// </summary>
        [Fact]
        public async Task UpdateCinemaAsync_ShouldPersistChanges()
        {
            // Arrange
            var options = CreateNewInMemoryDatabaseOptions();
            using (var context = new ApplicationDbContext(options))
            {
                await context.Cinemas.AddAsync(new Cinema { Id = 1, Name = "Old Name", Address = "Old Address", City = "Old City" });
                await context.SaveChangesAsync();
            }

            using (var context = new ApplicationDbContext(options))
            {
                var repo = new Repository<Cinema>(context);
                var service = new CinemaService(repo);

                // Act
                await service.UpdateCinemaAsync(new Cinema { Id = 1, Name = "New Name", Address = "New Address", City = "New City" });
            }

            // Assert
            using (var context = new ApplicationDbContext(options))
            {
                var updated = await context.Cinemas.FindAsync(1);
                Assert.NotNull(updated);
                Assert.Equal("New Name", updated.Name);
            }
        }

        /// <summary>
        /// Tests that AddCinemaAsync and UpdateCinemaAsync reject a null entity
        /// (CrudServiceBase's ArgumentNullException.ThrowIfNull guard).
        /// </summary>
        [Fact]
        public async Task AddAndUpdateCinemaAsync_ShouldThrow_WhenCinemaIsNull()
        {
            // Arrange
            var options = CreateNewInMemoryDatabaseOptions();
            using var context = new ApplicationDbContext(options);
            var repo = new Repository<Cinema>(context);
            var service = new CinemaService(repo);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => service.AddCinemaAsync(null!));
            await Assert.ThrowsAsync<ArgumentNullException>(() => service.UpdateCinemaAsync(null!));
        }

        /// <summary>
        /// Tests that DeleteCinemaAsync removes a cinema from the database.
        /// </summary>
        [Fact]
        public async Task DeleteCinemaAsync_ShouldRemoveCinema()
        {
            // Arrange
            var options = CreateNewInMemoryDatabaseOptions();
            using (var context = new ApplicationDbContext(options))
            {
                await context.Cinemas.AddAsync(new Cinema { Id = 5, Name = "Delete Me", Address = "A", City = "B" });
                await context.SaveChangesAsync();
            }

            using (var context = new ApplicationDbContext(options))
            {
                var repo = new Repository<Cinema>(context);
                var service = new CinemaService(repo);

                // Act
                await service.DeleteCinemaAsync(5);
            }

            // Assert
            using (var context = new ApplicationDbContext(options))
            {
                var deleted = await context.Cinemas.FindAsync(5);
                Assert.Null(deleted);
            }
        }
    }
}
