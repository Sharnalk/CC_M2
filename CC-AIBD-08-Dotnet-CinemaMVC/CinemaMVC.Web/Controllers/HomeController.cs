using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CinemaMVC.Web.Models;
using CinemaMVC.Web.Services;
using CinemaMVC.Web.Models.Entities;

namespace CinemaMVC.Web.Controllers
{
    /// <summary>
    /// Serves public pages including cinema listing, movie/session search, and cinema daily programs.
    /// </summary>
    public class HomeController : Controller
    {
        private readonly ICinemaService _cinemaService;
        private readonly ISessionService _sessionService;
        private readonly ILogger<HomeController> _logger;

        public HomeController(
            ICinemaService cinemaService, 
            ISessionService sessionService,
            ILogger<HomeController> logger)
        {
            _cinemaService = cinemaService;
            _sessionService = sessionService;
            _logger = logger;
        }

        public async Task<IActionResult> Index(string? searchCinema, string? searchMovie)
        {
            ViewData["SearchCinema"] = searchCinema;
            ViewData["SearchMovie"] = searchMovie;

            // 1. Get Cinemas (filtered if searchCinema is provided)
            var (cinemas, _) = await _cinemaService.GetCinemasPagedAsync(searchCinema ?? "", 1, 100);

            // 2. If movie search is requested, get matching sessions
            IEnumerable<Session> movieSessions = new List<Session>();
            if (!string.IsNullOrWhiteSpace(searchMovie))
            {
                movieSessions = await _sessionService.SearchSessionsAsync(searchMovie);
            }

            var model = new HomeViewModel
            {
                Cinemas = cinemas,
                MovieSessions = movieSessions
            };

            return View(model);
        }

        public async Task<IActionResult> CinemaDetails(int id, DateTime? date)
        {
            var cinema = await _cinemaService.GetCinemaByIdAsync(id);
            if (cinema == null)
            {
                _logger.LogWarning("Le cinéma avec l'ID {CinemaId} n'a pas été trouvé.", id);
                return NotFound();
            }

            var targetDate = date ?? DateTime.Today;
            ViewData["TargetDate"] = targetDate;

            // Get sessions for this cinema on the target date
            var sessions = await _sessionService.GetSessionsForCinemaAndDayAsync(id, targetDate);

            // Group sessions by Movie
            var groupedSessions = sessions
                .Where(s => s.Movie != null)
                .GroupBy(s => s.Movie!)
                .ToDictionary(g => g.Key, g => g.OrderBy(s => s.ShowTime).AsEnumerable());

            var model = new CinemaDetailsViewModel
            {
                Cinema = cinema,
                MoviesWithSessions = groupedSessions
            };

            return View(model);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }

    /// <summary>
    /// View model for the public home page.
    /// </summary>
    public class HomeViewModel
    {
        public IEnumerable<Cinema> Cinemas { get; set; } = new List<Cinema>();

        public IEnumerable<Session> MovieSessions { get; set; } = new List<Session>();
    }

    /// <summary>
    /// View model for a specific cinema's details and schedule.
    /// </summary>
    public class CinemaDetailsViewModel
    {
        public Cinema Cinema { get; set; } = null!;

        public Dictionary<Movie, IEnumerable<Session>> MoviesWithSessions { get; set; } = new();
    }
}
