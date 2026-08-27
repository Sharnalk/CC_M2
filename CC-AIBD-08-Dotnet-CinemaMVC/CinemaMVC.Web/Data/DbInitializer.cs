using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CinemaMVC.Web.Models.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CinemaMVC.Web.Data
{
    /// <summary>
    /// Handles database initialization, creation, and seeding of sample data.
    /// </summary>
    public static class DbInitializer
    {
        /// <summary>
        /// Seeds the database with default cinemas, rooms, movies, sessions, and an administrative user.
        /// </summary>
        /// <param name="context">The database context.</param>
        /// <param name="userManager">The ASP.NET Core Identity user manager.</param>
        public static async Task SeedAsync(ApplicationDbContext context, UserManager<IdentityUser> userManager)
        {
            // 1. Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // 2. Seed Identity User (Administrator)
            string adminEmail = "admin@cinegroup.com";
            var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
            if (existingAdmin == null)
            {
                var adminUser = new IdentityUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(adminUser, "Admin123!");
                if (!result.Succeeded)
                {
                    throw new InvalidOperationException($"Failed to seed admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }

            // 3. Seed Cinemas (if none exist)
            if (!await context.Cinemas.AnyAsync())
            {
                var cinemas = new List<Cinema>
                {
                    new Cinema { Name = "CineGroup Bellecour", Address = "12 Place Bellecour", City = "Lyon" },
                    new Cinema { Name = "CineGroup Ecully", Address = "Chemin de Petit Bois", City = "Ecully" },
                    new Cinema { Name = "CineGroup Nation", Address = "8 Place de la Nation", City = "Paris" },
                    new Cinema { Name = "CineGroup Vaise", Address = "45 Rue de Bourgogne", City = "Lyon" },
                    new Cinema { Name = "CineGroup Part-Dieu", Address = "Centre Commercial Part-Dieu", City = "Lyon" }
                };

                await context.Cinemas.AddRangeAsync(cinemas);
                await context.SaveChangesAsync();

                // 4. Seed Rooms for Cinemas
                var bellecour = cinemas[0];
                var ecully = cinemas[1];
                var nation = cinemas[2];

                var rooms = new List<Room>
                {
                    new Room { Name = "Salle IMAX 3D", Capacity = 300, CinemaId = bellecour.Id },
                    new Room { Name = "Salle Prestige 4DX", Capacity = 150, CinemaId = bellecour.Id },
                    new Room { Name = "Salle Standard 3", Capacity = 100, CinemaId = bellecour.Id },
                    
                    new Room { Name = "Salle Horizon", Capacity = 180, CinemaId = ecully.Id },
                    new Room { Name = "Salle Club", Capacity = 80, CinemaId = ecully.Id },
                    
                    new Room { Name = "Salle Dolby Atmos", Capacity = 220, CinemaId = nation.Id },
                    new Room { Name = "Salle Standard A", Capacity = 120, CinemaId = nation.Id }
                };

                await context.Rooms.AddRangeAsync(rooms);
                await context.SaveChangesAsync();

                // 5. Seed Movies
                var movies = new List<Movie>
                {
                    new Movie 
                    { 
                        Title = "Inception", 
                        Genre = "Sci-Fi / Thriller", 
                        DurationMinutes = 148, 
                        ReleaseDate = new DateTime(2010, 7, 16, 0, 0, 0, DateTimeKind.Utc),
                        Description = "Dom Cobb est un voleur expérimenté dans l'art de l'extraction, sa spécialité consiste à s'approprier les secrets les plus précieux d'un individu pendant qu'il rêve."
                    },
                    new Movie 
                    { 
                        Title = "Avatar: La Voie de l'eau", 
                        Genre = "Aventure / Action", 
                        DurationMinutes = 192, 
                        ReleaseDate = new DateTime(2022, 12, 14, 0, 0, 0, DateTimeKind.Utc),
                        Description = "Jake Sully et Ney'tiri ont formé une famille et font tout pour rester ensemble. Ils doivent cependant quitter leur foyer et explorer les régions de Pandora."
                    },
                    new Movie 
                    { 
                        Title = "Interstellar", 
                        Genre = "Sci-Fi / Drame", 
                        DurationMinutes = 169, 
                        ReleaseDate = new DateTime(2014, 11, 5, 0, 0, 0, DateTimeKind.Utc),
                        Description = "Un groupe d'explorateurs voyage au-delà de notre galaxie grâce à un voyage interstellaire pour découvrir si l'humanité a un avenir parmi les étoiles."
                    },
                    new Movie 
                    { 
                        Title = "Dune: Deuxième Partie", 
                        Genre = "Sci-Fi / Aventure", 
                        DurationMinutes = 166, 
                        ReleaseDate = new DateTime(2024, 2, 28, 0, 0, 0, DateTimeKind.Utc),
                        Description = "Paul Atreides s'unit à Chani et aux Fremen tout en préparant sa revanche contre les conspirateurs qui ont détruit sa famille."
                    },
                    new Movie 
                    { 
                        Title = "Oppenheimer", 
                        Genre = "Drame / Biopic", 
                        DurationMinutes = 180, 
                        ReleaseDate = new DateTime(2023, 7, 19, 0, 0, 0, DateTimeKind.Utc),
                        Description = "Le destin biographique exceptionnel du physicien J. Robert Oppenheimer, qui a dirigé le Projet Manhattan menant à la création de la bombe atomique."
                    }
                };

                await context.Movies.AddRangeAsync(movies);
                await context.SaveChangesAsync();

                // 6. Seed Sessions (Scheduled for Today and Tomorrow)
                var today = DateTime.Today;
                var tomorrow = DateTime.Today.AddDays(1);

                var rImax = rooms[0];      // Bellecour IMAX
                var rPrestige = rooms[1];  // Bellecour Prestige
                var rHorizon = rooms[3];   // Ecully Horizon
                var rDolby = rooms[5];     // Nation Dolby

                var mInception = movies[0];
                var mAvatar = movies[1];
                var mInterstellar = movies[2];
                var mDune = movies[3];
                var mOppenheimer = movies[4];

                var sessions = new List<Session>
                {
                    // Today's sessions at Bellecour IMAX
                    new Session { RoomId = rImax.Id, MovieId = mAvatar.Id, ShowTime = today.AddHours(14).AddMinutes(30), Price = 15.50m },
                    new Session { RoomId = rImax.Id, MovieId = mAvatar.Id, ShowTime = today.AddHours(18).AddMinutes(0), Price = 15.50m },
                    new Session { RoomId = rImax.Id, MovieId = mDune.Id, ShowTime = today.AddHours(21).AddMinutes(30), Price = 16.00m },

                    // Today's sessions at Bellecour Prestige
                    new Session { RoomId = rPrestige.Id, MovieId = mInception.Id, ShowTime = today.AddHours(13).AddMinutes(0), Price = 12.00m },
                    new Session { RoomId = rPrestige.Id, MovieId = mInterstellar.Id, ShowTime = today.AddHours(16).AddMinutes(15), Price = 13.50m },
                    new Session { RoomId = rPrestige.Id, MovieId = mOppenheimer.Id, ShowTime = today.AddHours(20).AddMinutes(0), Price = 14.00m },

                    // Today's sessions at Ecully Horizon
                    new Session { RoomId = rHorizon.Id, MovieId = mDune.Id, ShowTime = today.AddHours(14).AddMinutes(0), Price = 11.50m },
                    new Session { RoomId = rHorizon.Id, MovieId = mInception.Id, ShowTime = today.AddHours(17).AddMinutes(30), Price = 10.00m },
                    new Session { RoomId = rHorizon.Id, MovieId = mInterstellar.Id, ShowTime = today.AddHours(20).AddMinutes(45), Price = 11.50m },

                    // Today's sessions at Nation Dolby
                    new Session { RoomId = rDolby.Id, MovieId = mOppenheimer.Id, ShowTime = today.AddHours(14).AddMinutes(0), Price = 14.50m },
                    new Session { RoomId = rDolby.Id, MovieId = mAvatar.Id, ShowTime = today.AddHours(18).AddMinutes(0), Price = 15.00m },
                    new Session { RoomId = rDolby.Id, MovieId = mDune.Id, ShowTime = today.AddHours(21).AddMinutes(30), Price = 15.00m },

                    // Tomorrow's sessions (so date tabs work)
                    new Session { RoomId = rImax.Id, MovieId = mDune.Id, ShowTime = tomorrow.AddHours(14).AddMinutes(30), Price = 16.00m },
                    new Session { RoomId = rImax.Id, MovieId = mAvatar.Id, ShowTime = tomorrow.AddHours(18).AddMinutes(0), Price = 15.50m },
                    new Session { RoomId = rHorizon.Id, MovieId = mInception.Id, ShowTime = tomorrow.AddHours(20).AddMinutes(30), Price = 10.00m }
                };

                await context.Sessions.AddRangeAsync(sessions);
                await context.SaveChangesAsync();
            }

            // 7. Recaler les séances de démonstration sur la date du jour.
            //    Le bloc de seeding ci-dessus ne s'exécute qu'une fois, et il place les
            //    séances relativement au jour du premier démarrage. Sans ce recalage, la
            //    programmation "du jour" se vide dès le lendemain et la page d'accueil
            //    n'affiche plus aucune séance.
            await RealignSessionsToTodayAsync(context);
        }

        /// <summary>
        /// Décale l'ensemble des séances pour que la première retombe sur aujourd'hui,
        /// en conservant leur répartition relative (jour J et J+1) et leurs horaires.
        /// Sans effet si les séances sont déjà calées sur le jour courant.
        /// </summary>
        private static async Task RealignSessionsToTodayAsync(ApplicationDbContext context)
        {
            var sessions = await context.Sessions.ToListAsync();
            if (sessions.Count == 0)
            {
                return;
            }

            int shiftInDays = (DateTime.Today - sessions.Min(s => s.ShowTime).Date).Days;
            if (shiftInDays == 0)
            {
                return;
            }

            foreach (var session in sessions)
            {
                session.ShowTime = session.ShowTime.AddDays(shiftInDays);
            }

            await context.SaveChangesAsync();
        }
    }
}
