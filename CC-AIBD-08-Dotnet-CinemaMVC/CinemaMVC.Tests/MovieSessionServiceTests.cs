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
        private static DbContextOptions<ApplicationDbContext> CreateNewInMemoryDatabaseOptions()
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
        /// Tests that AddMovieAsync, UpdateMovieAsync and DeleteMovieAsync all work end to end.
        /// </summary>
        [Fact]
        public async Task MovieService_ShouldAddUpdateAndDeleteMovie()
        {
            var options = CreateNewInMemoryDatabaseOptions();
            int movieId;

            using (var context = new ApplicationDbContext(options))
            {
                var service = new MovieService(new Repository<Movie>(context));
                var movie = new Movie { Title = "Dune", Genre = "Sci-Fi", Description = "Desert planet", DurationMinutes = 166 };
                await service.AddMovieAsync(movie);
                movieId = movie.Id;
            }

            using (var context = new ApplicationDbContext(options))
            {
                var service = new MovieService(new Repository<Movie>(context));
                await service.UpdateMovieAsync(new Movie { Id = movieId, Title = "Dune: Part Two", Genre = "Sci-Fi", Description = "Desert planet", DurationMinutes = 166 });
            }

            int savedId;
            using (var context = new ApplicationDbContext(options))
            {
                var saved = await context.Movies.FirstAsync();
                savedId = saved.Id;
                Assert.Equal("Dune: Part Two", saved.Title);
            }

            using (var context = new ApplicationDbContext(options))
            {
                var service = new MovieService(new Repository<Movie>(context));
                await service.DeleteMovieAsync(savedId);
            }

            using (var context = new ApplicationDbContext(options))
            {
                Assert.Empty(await context.Movies.ToListAsync());
            }
        }

        /// <summary>
        /// Tests that AddRoomAsync, UpdateRoomAsync and DeleteRoomAsync all work end to end.
        /// </summary>
        [Fact]
        public async Task RoomService_ShouldAddUpdateAndDeleteRoom()
        {
            var options = CreateNewInMemoryDatabaseOptions();

            using (var context = new ApplicationDbContext(options))
            {
                await context.Cinemas.AddAsync(new Cinema { Id = 1, Name = "Cinema Test", Address = "A", City = "B" });
                await context.SaveChangesAsync();
            }

            int roomId;
            using (var context = new ApplicationDbContext(options))
            {
                var service = new RoomService(new Repository<Room>(context));
                var room = new Room { Name = "Salle 1", Capacity = 100, CinemaId = 1 };
                await service.AddRoomAsync(room);
                roomId = room.Id;
            }

            using (var context = new ApplicationDbContext(options))
            {
                var service = new RoomService(new Repository<Room>(context));
                await service.UpdateRoomAsync(new Room { Id = roomId, Name = "Salle 1 Renovee", Capacity = 120, CinemaId = 1 });
            }

            int savedId;
            using (var context = new ApplicationDbContext(options))
            {
                var saved = await context.Rooms.FirstAsync();
                savedId = saved.Id;
                Assert.Equal(120, saved.Capacity);
            }

            using (var context = new ApplicationDbContext(options))
            {
                var service = new RoomService(new Repository<Room>(context));
                await service.DeleteRoomAsync(savedId);
            }

            using (var context = new ApplicationDbContext(options))
            {
                Assert.Empty(await context.Rooms.ToListAsync());
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

        /// <summary>
        /// Tests that AddSessionAsync, UpdateSessionAsync and DeleteSessionAsync all work end to end.
        /// </summary>
        [Fact]
        public async Task SessionService_ShouldAddUpdateAndDeleteSession()
        {
            var options = CreateNewInMemoryDatabaseOptions();

            using (var context = new ApplicationDbContext(options))
            {
                await context.Movies.AddAsync(new Movie { Id = 1, Title = "Dune", Genre = "Sci-Fi", Description = "Desert planet", DurationMinutes = 166 });
                await context.Cinemas.AddAsync(new Cinema { Id = 1, Name = "Cinema Test", Address = "A", City = "B" });
                await context.Rooms.AddAsync(new Room { Id = 1, Name = "Salle 1", Capacity = 100, CinemaId = 1 });
                await context.SaveChangesAsync();
            }

            int sessionId;
            using (var context = new ApplicationDbContext(options))
            {
                var service = new SessionService(new Repository<Session>(context));
                var session = new Session { MovieId = 1, RoomId = 1, ShowTime = DateTime.Today.AddHours(20), Price = 10.00m };
                await service.AddSessionAsync(session);
                sessionId = session.Id;
            }

            using (var context = new ApplicationDbContext(options))
            {
                var service = new SessionService(new Repository<Session>(context));
                await service.UpdateSessionAsync(new Session { Id = sessionId, MovieId = 1, RoomId = 1, ShowTime = DateTime.Today.AddHours(21), Price = 12.00m });
            }

            int savedId;
            using (var context = new ApplicationDbContext(options))
            {
                var saved = await context.Sessions.FirstAsync();
                savedId = saved.Id;
                Assert.Equal(12.00m, saved.Price);
            }

            using (var context = new ApplicationDbContext(options))
            {
                var service = new SessionService(new Repository<Session>(context));
                await service.DeleteSessionAsync(savedId);
            }

            using (var context = new ApplicationDbContext(options))
            {
                Assert.Empty(await context.Sessions.ToListAsync());
            }
        }
    }
}
