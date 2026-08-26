using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CinemaMVC.Web.Models.Entities;

namespace CinemaMVC.Web.Data
{
    /// <summary>
    /// Database context for the cinema management system, incorporating ASP.NET Core Identity.
    /// </summary>
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Cinema> Cinemas { get; set; } = null!;

        public virtual DbSet<Room> Rooms { get; set; } = null!;

        public virtual DbSet<Movie> Movies { get; set; } = null!;

        public virtual DbSet<Session> Sessions { get; set; } = null!;

        /// <summary>
        /// Configures database mapping and relations using Fluent API.
        /// </summary>
        /// <param name="builder">The ModelBuilder context builder.</param>
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure Delete Behaviors
            builder.Entity<Cinema>()
                .HasMany(c => c.Rooms)
                .WithOne(r => r.Cinema)
                .HasForeignKey(r => r.CinemaId)
                .OnDelete(DeleteBehavior.Cascade); // Cascade delete rooms if a cinema is deleted

            builder.Entity<Room>()
                .HasMany(r => r.Sessions)
                .WithOne(s => s.Room)
                .HasForeignKey(s => s.RoomId)
                .OnDelete(DeleteBehavior.Cascade); // Cascade delete sessions if a room is deleted

            builder.Entity<Movie>()
                .HasMany(m => m.Sessions)
                .WithOne(s => s.Movie)
                .HasForeignKey(s => s.MovieId)
                .OnDelete(DeleteBehavior.Cascade); // Cascade delete sessions if a movie is deleted

            // Price column precision specification
            builder.Entity<Session>()
                .Property(s => s.Price)
                .HasPrecision(18, 2);
        }
    }
}
