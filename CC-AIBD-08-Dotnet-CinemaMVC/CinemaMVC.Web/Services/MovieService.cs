using Microsoft.EntityFrameworkCore;
using CinemaMVC.Web.Models.Entities;
using CinemaMVC.Web.Repositories;

namespace CinemaMVC.Web.Services
{
    /// <summary>
    /// Service implementation for managing Movie entities.
    /// </summary>
    public class MovieService : IMovieService
    {
        private readonly IRepository<Movie> _movieRepository;

        public MovieService(IRepository<Movie> movieRepository)
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
        public async Task AddMovieAsync(Movie movie)
        {
            if (movie == null) throw new ArgumentNullException(nameof(movie));
            await _movieRepository.AddAsync(movie);
            await _movieRepository.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task UpdateMovieAsync(Movie movie)
        {
            if (movie == null) throw new ArgumentNullException(nameof(movie));
            _movieRepository.Update(movie);
            await _movieRepository.SaveChangesAsync();
        }

        /// <inheritdoc />
        public async Task DeleteMovieAsync(int id)
        {
            var movie = await _movieRepository.GetByIdAsync(id);
            if (movie != null)
            {
                _movieRepository.Delete(movie);
                await _movieRepository.SaveChangesAsync();
            }
        }
    }
}
