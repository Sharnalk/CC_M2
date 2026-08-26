using Microsoft.EntityFrameworkCore;
using CinemaMVC.Web.Models.Entities;
using CinemaMVC.Web.Repositories;

namespace CinemaMVC.Web.Services
{
    /// <summary>
    /// Service implementation for managing Cinema entities.
    /// </summary>
    public class CinemaService : ICinemaService
    {
        private readonly IRepository<Cinema> _cinemaRepository;

        public CinemaService(IRepository<Cinema> cinemaRepository)
        {
            _cinemaRepository = cinemaRepository;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<Cinema>> GetAllCinemasAsync()
        {
            return await _cinemaRepository.GetAllAsync();
        }

        /// <inheritdoc />
        public async Task<Cinema?> GetCinemaByIdAsync(int id)
        {
            return await _cinemaRepository.GetQueryable()
                .Include(c => c.Rooms)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        /// <inheritdoc />
        public async Task<(IEnumerable<Cinema> Cinemas, int TotalCount)> GetCinemasPagedAsync(string search, int page, int pageSize)
        {
            var query = _cinemaRepository.GetQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(searchLower) 
                                      || c.City.ToLower().Contains(searchLower) 
                                      || c.Address.ToLower().Contains(searchLower));
            }

            int totalCount = await query.CountAsync();
            var cinemas = await query
                .OrderBy(c => c.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (cinemas, totalCount);
        }

        /// <inheritdoc />
        public async Task AddCinemaAsync(Cinema cinema)
        {
            if (cinema == null) throw new ArgumentNullException(nameof(cinema));
            await _cinemaRepository.AddAsync(cinema);
            await _cinemaRepository.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task UpdateCinemaAsync(Cinema cinema)
        {
            if (cinema == null) throw new ArgumentNullException(nameof(cinema));
            _cinemaRepository.Update(cinema);
            await _cinemaRepository.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task DeleteCinemaAsync(int id)
        {
            var cinema = await _cinemaRepository.GetByIdAsync(id);
            if (cinema != null)
            {
                _cinemaRepository.Delete(cinema);
                await _cinemaRepository.SaveChangesAsync();
            }
        }
    }
}
