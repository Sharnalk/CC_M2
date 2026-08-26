using CinemaMVC.Web.Models.Entities;

namespace CinemaMVC.Web.Services
{
    /// <summary>
    /// Service contract for managing Cinema entities.
    /// </summary>
    public interface ICinemaService
    {
        /// <summary>
        /// Retrieves all cinemas in the system.
        /// </summary>
        /// <returns>A collection of all cinemas.</returns>
        Task<IEnumerable<Cinema>> GetAllCinemasAsync();

        /// <summary>
        /// Retrieves a cinema by its unique identifier.
        /// </summary>
        /// <param name="id">The cinema ID.</param>
        /// <returns>The cinema if found; otherwise, null.</returns>
        Task<Cinema?> GetCinemaByIdAsync(int id);

        /// <summary>
        /// Retrieves a paged and filtered list of cinemas.
        /// </summary>
        /// <param name="search">The search term filter for name, city, or address.</param>
        /// <param name="page">The 1-based page number.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>A tuple containing the cinemas list and the total count of matching cinemas.</returns>
        Task<(IEnumerable<Cinema> Cinemas, int TotalCount)> GetCinemasPagedAsync(string search, int page, int pageSize);

        /// <summary>
        /// Adds a new cinema.
        /// </summary>
        /// <param name="cinema">The cinema to add.</param>
        Task AddCinemaAsync(Cinema cinema);

        /// <summary>
        /// Updates an existing cinema.
        /// </summary>
        /// <param name="cinema">The cinema to update.</param>
        Task UpdateCinemaAsync(Cinema cinema);

        /// <summary>
        /// Deletes a cinema by its identifier.
        /// </summary>
        /// <param name="id">The cinema ID to delete.</param>
        Task DeleteCinemaAsync(int id);
    }
}
