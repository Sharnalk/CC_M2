using CinemaMVC.Web.Models.Entities;

namespace CinemaMVC.Web.Services
{
    /// <summary>
    /// Service contract for managing Session entities.
    /// </summary>
    public interface ISessionService
    {
        /// <summary>
        /// Retrieves all sessions in the system.
        /// </summary>
        /// <returns>A collection of all sessions.</returns>
        Task<IEnumerable<Session>> GetAllSessionsAsync();

        /// <summary>
        /// Retrieves a session by its unique identifier.
        /// </summary>
        /// <param name="id">The session ID.</param>
        /// <returns>The session if found; otherwise, null.</returns>
        Task<Session?> GetSessionByIdAsync(int id);

        /// <summary>
        /// Retrieves a paged and filtered list of sessions.
        /// </summary>
        /// <param name="search">The search term filter for movie title or room name.</param>
        /// <param name="page">The 1-based page number.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>A tuple containing the sessions list and the total count of matching sessions.</returns>
        Task<(IEnumerable<Session> Sessions, int TotalCount)> GetSessionsPagedAsync(string search, int page, int pageSize);

        /// <summary>
        /// Adds a new session.
        /// </summary>
        /// <param name="session">The session to add.</param>
        Task AddSessionAsync(Session session);

        /// <summary>
        /// Updates an existing session.
        /// </summary>
        /// <param name="session">The session to update.</param>
        Task UpdateSessionAsync(Session session);

        /// <summary>
        /// Deletes a session by its identifier.
        /// </summary>
        /// <param name="id">The session ID to delete.</param>
        Task DeleteSessionAsync(int id);

        /// <summary>
        /// Retrieves sessions for a specific cinema and a specific day.
        /// </summary>
        /// <param name="cinemaId">The cinema identifier.</param>
        /// <param name="date">The target date.</param>
        /// <returns>A collection of sessions scheduled for that day in the given cinema.</returns>
        Task<IEnumerable<Session>> GetSessionsForCinemaAndDayAsync(int cinemaId, DateTime date);

        /// <summary>
        /// Searches sessions by movie title and optionally by cinema.
        /// </summary>
        /// <param name="movieTitle">The movie title query.</param>
        /// <param name="cinemaId">Optional cinema ID filter.</param>
        /// <returns>A collection of sessions matching the search criteria.</returns>
        Task<IEnumerable<Session>> SearchSessionsAsync(string movieTitle, int? cinemaId = null);
    }
}
