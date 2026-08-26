using Microsoft.EntityFrameworkCore;
using CinemaMVC.Web.Data;
using CinemaMVC.Web.Models.Entities;
using CinemaMVC.Web.Repositories;
using CinemaMVC.Web.Services;

namespace CinemaMVC.Tests
{
    /// <summary>
    /// Unit tests for MovieService and SessionService using an InMemory database.
    /// </summary>
    public class MovieSessionServiceTests
    {
        private DbContextOptions<ApplicationDbContext> CreateNewInMemoryDatabaseOptions()
        {
            return new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        /// <summary>
        /// Tests that GetMoviesPagedAsync filters movies correctly.
        /// </summary>
        [Fact]
        public async Task GetMoviesPagedAsync_ShouldReturnFilteredMovies()
        {
            var options = CreateNewInMemoryDatabaseOptions();
            using (var context = new ApplicationDbContext(options))
            {
                await context.Movies.AddRangeAsync(
                    new Movie { Id = 1, Title = "Inception", Genre = "Sci-Fi", Description = "Dream heist", DurationMinutes = 148 },
                    new Movie { Id = 2, Title = "The Dark Knight", Genre = "Action", Description = "Batman fight", DurationMinutes = 152 },
                    new Movie { Id = 3, Title = "Interstellar", Genre = "Sci-Fi", Description = "Space time travel", DurationMinutes = 169 }
                );
                await context.SaveChangesAsync();
            }

            using (var context = new ApplicationDbContext(options))
            {
                var repo = new Repository<Movie>(context);
                var service = new MovieService(repo);

                var (movies, totalCount) = await service.GetMoviesPagedAsync("Sci-Fi", 1, 10);

                Assert.Equal(2, totalCount);
                Assert.Contains(movies, m => m.Title == "Inception");
                Assert.Contains(movies, m => m.Title == "Interstellar");
            }
        }

        /// <summary>
        /// Tests that SearchSessionsAsync retrieves scheduled sessions by movie title filter.
        /// </summary>
        [Fact]
        public async Task SearchSessionsAsync_ShouldReturnMatchingSessions()
        {
            var options = CreateNewInMemoryDatabaseOptions();
            using (var context = new ApplicationDbContext(options))
            {
                var movie = new Movie { Id = 1, Title = "Avatar", Genre = "Adventure", Description = "Blue aliens", DurationMinutes = 162 };
                var cinema = new Cinema { Id = 1, Name = "Cinema Paris", Address = "A", City = "Paris" };
                var room = new Room { Id = 1, Name = "Room IMAX", Capacity = 200, CinemaId = 1 };
                var session1 = new Session { Id = 10, MovieId = 1, RoomId = 1, ShowTime = DateTime.Today.AddHours(14), Price = 12.00m };
                var session2 = new Session { Id = 11, MovieId = 1, RoomId = 1, ShowTime = DateTime.Today.AddHours(18), Price = 12.50m };

                await context.Movies.AddAsync(movie);
                await context.Cinemas.AddAsync(cinema);
                await context.Rooms.AddAsync(room);
                await context.Sessions.AddRangeAsync(session1, session2);
                await context.SaveChangesAsync();
            }

            using (var context = new ApplicationDbContext(options))
            {
                var repo = new Repository<Session>(context);
                var service = new SessionService(repo);

                var result = await service.SearchSessionsAsync("Avatar");

                Assert.Equal(2, result.Count());
                Assert.All(result, s => Assert.Equal("Avatar", s.Movie?.Title));
            }
        }
    }
}
