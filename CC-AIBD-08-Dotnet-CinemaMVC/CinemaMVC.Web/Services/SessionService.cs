using Microsoft.EntityFrameworkCore;
using CinemaMVC.Web.Models.Entities;
using CinemaMVC.Web.Repositories;

namespace CinemaMVC.Web.Services
{
    /// <summary>
    /// Service implementation for managing Session entities.
    /// </summary>
    public class SessionService : ISessionService
    {
        private readonly IRepository<Session> _sessionRepository;

        public SessionService(IRepository<Session> sessionRepository)
        {
            _sessionRepository = sessionRepository;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<Session>> GetAllSessionsAsync()
        {
            return await _sessionRepository.GetQueryable()
                .Include(s => s.Movie)
                .Include(s => s.Room)
                .ThenInclude(r => r!.Cinema)
                .ToListAsync();
        }

        /// <inheritdoc />
        public async Task<Session?> GetSessionByIdAsync(int id)
        {
            return await _sessionRepository.GetQueryable()
                .Include(s => s.Movie)
                .Include(s => s.Room)
                .ThenInclude(r => r!.Cinema)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        /// <inheritdoc />
        public async Task<(IEnumerable<Session> Sessions, int TotalCount)> GetSessionsPagedAsync(string search, int page, int pageSize)
        {
            var query = _sessionRepository.GetQueryable()
                .Include(s => s.Movie)
                .Include(s => s.Room)
                .ThenInclude(r => r!.Cinema)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                // ToLower()+Contains() : seul motif compatible a la fois avec PostgreSQL
                // (Npgsql) et le provider InMemory des tests (voir CinemaService).
                var searchLower = search.ToLower();
                query = query.Where(s => (s.Movie != null && s.Movie.Title.ToLower().Contains(searchLower))
                                      || (s.Room != null && s.Room.Name.ToLower().Contains(searchLower))
                                      || (s.Room != null && s.Room.Cinema != null && s.Room.Cinema.Name.ToLower().Contains(searchLower)));
            }

            int totalCount = await query.CountAsync();
            var sessions = await query
                .OrderByDescending(s => s.ShowTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (sessions, totalCount);
        }

        /// <inheritdoc />
        public async Task AddSessionAsync(Session session)
        {
            ArgumentNullException.ThrowIfNull(session);
            await _sessionRepository.AddAsync(session);
            await _sessionRepository.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task UpdateSessionAsync(Session session)
        {
            ArgumentNullException.ThrowIfNull(session);
            _sessionRepository.Update(session);
            await _sessionRepository.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task DeleteSessionAsync(int id)
        {
            var session = await _sessionRepository.GetByIdAsync(id);
            if (session != null)
            {
                _sessionRepository.Delete(session);
                await _sessionRepository.SaveChangesAsync();
            }
        }

        /// <inheritdoc />
        public async Task<IEnumerable<Session>> GetSessionsForCinemaAndDayAsync(int cinemaId, DateTime date)
        {
            return await _sessionRepository.GetQueryable()
                .Include(s => s.Movie)
                .Include(s => s.Room)
                .ThenInclude(r => r!.Cinema)
                .Where(s => s.Room != null && s.Room.CinemaId == cinemaId && s.ShowTime.Date == date.Date)
                .OrderBy(s => s.ShowTime)
                .ToListAsync();
        }

        /// <inheritdoc />
        public async Task<IEnumerable<Session>> SearchSessionsAsync(string movieTitle, int? cinemaId = null)
        {
            var query = _sessionRepository.GetQueryable()
                .Include(s => s.Movie)
                .Include(s => s.Room)
                .ThenInclude(r => r!.Cinema)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(movieTitle))
            {
                var titleLower = movieTitle.ToLower();
                query = query.Where(s => s.Movie != null && s.Movie.Title.ToLower().Contains(titleLower));
            }

            if (cinemaId.HasValue)
            {
                query = query.Where(s => s.Room != null && s.Room.CinemaId == cinemaId.Value);
            }

            return await query
                .OrderBy(s => s.ShowTime)
                .ToListAsync();
        }
    }
}
