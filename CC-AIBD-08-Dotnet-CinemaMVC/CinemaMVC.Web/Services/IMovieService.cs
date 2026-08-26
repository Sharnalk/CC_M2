using CinemaMVC.Web.Models.Entities;

namespace CinemaMVC.Web.Services
{
    /// <summary>
    /// Service contract for managing Movie entities.
    /// </summary>
    public interface IMovieService
    {
        /// <summary>
        /// Retrieves all movies in the system.
        /// </summary>
        /// <returns>A collection of all movies.</returns>
        Task<IEnumerable<Movie>> GetAllMoviesAsync();

        /// <summary>
        /// Retrieves a movie by its unique identifier.
        /// </summary>
        /// <param name="id">The movie ID.</param>
        /// <returns>The movie if found; otherwise, null.</returns>
        Task<Movie?> GetMovieByIdAsync(int id);

        /// <summary>
        /// Retrieves a paged and filtered list of movies.
        /// </summary>
        /// <param name="search">The search term filter for title, genre, or description.</param>
        /// <param name="page">The 1-based page number.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>A tuple containing the movies list and the total count of matching movies.</returns>
        Task<(IEnumerable<Movie> Movies, int TotalCount)> GetMoviesPagedAsync(string search, int page, int pageSize);

        /// <summary>
        /// Adds a new movie.
        /// </summary>
        /// <param name="movie">The movie to add.</param>
        Task AddMovieAsync(Movie movie);

        /// <summary>
        /// Updates an existing movie.
        /// </summary>
        /// <param name="movie">The movie to update.</param>
        Task UpdateMovieAsync(Movie movie);

        /// <summary>
        /// Deletes a movie by its identifier.
        /// </summary>
        /// <param name="id">The movie ID to delete.</param>
        Task DeleteMovieAsync(int id);
    }
}
