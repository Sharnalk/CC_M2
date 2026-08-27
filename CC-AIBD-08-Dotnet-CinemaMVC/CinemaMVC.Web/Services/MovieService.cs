using Microsoft.EntityFrameworkCore;
using CinemaMVC.Web.Models.Entities;
using CinemaMVC.Web.Repositories;

namespace CinemaMVC.Web.Services
{
    /// <summary>
    /// Service implementation for managing Movie entities.
    /// </summary>
    public class MovieService : CrudServiceBase<Movie>, IMovieService
    {
        private readonly IRepository<Movie> _movieRepository;

        public MovieService(IRepository<Movie> movieRepository) : base(movieRepository)
        {
            _movieRepository = movieRepository;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<Movie>> GetAllMoviesAsync()
        {
            return await _movieRepository.GetAllAsync();
        }

        /// <inheritdoc />
        public async Task<Movie?> GetMovieByIdAsync(int id)
        {
            return await _movieRepository.GetByIdAsync(id);
        }

        /// <inheritdoc />
        public async Task<(IEnumerable<Movie> Movies, int TotalCount)> GetMoviesPagedAsync(string search, int page, int pageSize)
        {
            var query = _movieRepository.GetQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                // ToLower()+Contains() : seul motif compatible a la fois avec PostgreSQL
                // (Npgsql) et le provider InMemory des tests (voir CinemaService).
                var searchLower = search.ToLower();
                query = query.Where(m => m.Title.ToLower().Contains(searchLower)
                                      || m.Genre.ToLower().Contains(searchLower)
                                      || m.Description.ToLower().Contains(searchLower));
            }

            int totalCount = await query.CountAsync();
            var movies = await query
                .OrderBy(m => m.Title)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (movies, totalCount);
        }

        /// <inheritdoc />
        public Task AddMovieAsync(Movie movie) => AddEntityAsync(movie);

        /// <inheritdoc />
        public Task UpdateMovieAsync(Movie movie) => UpdateEntityAsync(movie);

        /// <inheritdoc />
        public Task DeleteMovieAsync(int id) => DeleteEntityAsync(id);
    }
}
