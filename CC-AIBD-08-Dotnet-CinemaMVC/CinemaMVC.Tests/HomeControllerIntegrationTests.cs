using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
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
                    // Retirer TOUT ce que UseNpgsql() a enregistré, pas seulement
                    // DbContextOptions<T> : EF Core ajoute aussi un descripteur
                    // IDbContextOptionsConfiguration<T> distinct, et le laisser en place
                    // fait cohabiter Npgsql et InMemory dans le même conteneur de services
                    // ("Only a single database provider can be registered" à l'exécution —
                    // bug découvert en ajoutant un test qui boot vraiment l'hôte).
                    services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
                    services.RemoveAll<IDbContextOptionsConfiguration<ApplicationDbContext>>();

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

        /// <summary>
        /// Boots the real ASP.NET host (Program.cs) against the InMemory database and
        /// requests the home page over HTTP. Unlike the test above, this genuinely
        /// exercises application startup and DbInitializer.SeedAsync, not just a
        /// manually-constructed controller.
        /// </summary>
        [Fact]
        public async Task GetHomePage_ShouldReturnSuccess_AfterFullApplicationStartup()
        {
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("CineGroup", content);
        }
    }
}
