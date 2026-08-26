using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using CinemaMVC.Web.Data;
using CinemaMVC.Web.Models.Entities;
using CinemaMVC.Web.Repositories;
using CinemaMVC.Web.Services;
using CinemaMVC.Web.Controllers;
using System.Linq;

namespace CinemaMVC.Tests
{
    /// <summary>
    /// Integration tests for public space endpoints, ensuring the MVC pipeline functions correctly.
    /// </summary>
    public class HomeControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public HomeControllerIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove existing ApplicationDbContext registration (PostgreSQL)
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    // Register ApplicationDbContext with an InMemory database for reliable integration testing
                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("IntegrationTestsDb");
                    });
                });
            });
        }

        /// <summary>
        /// Verifies that the HomeController Index action returns the correct View and matches the HomeViewModel.
        /// </summary>
        [Fact]
        public async Task Index_ShouldReturnViewWithHomeViewModel()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "HomeControllerTestDb")
                .Options;

            using (var context = new ApplicationDbContext(options))
            {
                await context.Cinemas.AddAsync(new Cinema { Id = 1, Name = "Test Cinema", Address = "Address", City = "City" });
                await context.SaveChangesAsync();
            }

            using (var context = new ApplicationDbContext(options))
            {
                var cinemaRepo = new Repository<Cinema>(context);
                var sessionRepo = new Repository<Session>(context);
                var cinemaService = new CinemaService(cinemaRepo);
                var sessionService = new SessionService(sessionRepo);
                
                var controller = new HomeController(cinemaService, sessionService, null!);

                // Act
                var result = await controller.Index(null, null);

                // Assert
                Assert.NotNull(result);
                var viewResult = Assert.IsType<Microsoft.AspNetCore.Mvc.ViewResult>(result);
                var model = Assert.IsType<CinemaMVC.Web.Controllers.HomeViewModel>(viewResult.Model);
                Assert.Single(model.Cinemas);
                Assert.Equal("Test Cinema", model.Cinemas.First().Name);
            }
        }
    }
}
