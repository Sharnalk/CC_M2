using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using CinemaMVC.Web.Models.Entities;
using CinemaMVC.Web.Services;

namespace CinemaMVC.Web.Controllers
{
    /// <summary>
    /// Admin controller managing CRUD operations for Session entities.
    /// Secured with user authorization.
    /// </summary>
    [Authorize]
    public class SessionController : Controller
    {
        private readonly ISessionService _sessionService;
        private readonly IMovieService _movieService;
        private readonly IRoomService _roomService;

        public SessionController(
            ISessionService sessionService,
            IMovieService movieService,
            IRoomService roomService)
        {
            _sessionService = sessionService;
            _movieService = movieService;
            _roomService = roomService;
        }

        public async Task<IActionResult> Index(string? search, int page = 1)
        {
            int pageSize = 5;
            var (sessions, totalCount) = await _sessionService.GetSessionsPagedAsync(search ?? "", page, pageSize);

            ViewData["CurrentFilter"] = search;
            ViewData["CurrentPage"] = page;
            ViewData["TotalPages"] = (int)Math.Ceiling((double)totalCount / pageSize);

            return View(sessions);
        }

        public async Task<IActionResult> Details(int id)
        {
            var session = await _sessionService.GetSessionByIdAsync(id);
            if (session == null)
            {
                return NotFound();
            }
            return View(session);
        }

        public async Task<IActionResult> Create()
        {
            await PopulateDropdownsAsync();
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Session session)
        {
            if (ModelState.IsValid)
            {
                await _sessionService.AddSessionAsync(session);
                return RedirectToAction(nameof(Index));
            }

            await PopulateDropdownsAsync(session.MovieId, session.RoomId);
            return View(session);
        }

        public async Task<IActionResult> Edit(int id)
        {
            var session = await _sessionService.GetSessionByIdAsync(id);
            if (session == null)
            {
                return NotFound();
            }

            await PopulateDropdownsAsync(session.MovieId, session.RoomId);
            return View(session);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Session session)
        {
            if (id != session.Id)
            {
                return BadRequest();
            }

            if (ModelState.IsValid)
            {
                await _sessionService.UpdateSessionAsync(session);
                return RedirectToAction(nameof(Index));
            }

            await PopulateDropdownsAsync(session.MovieId, session.RoomId);
            return View(session);
        }

        public async Task<IActionResult> Delete(int id)
        {
            var session = await _sessionService.GetSessionByIdAsync(id);
            if (session == null)
            {
                return NotFound();
            }
            return View(session);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _sessionService.DeleteSessionAsync(id);
            return RedirectToAction(nameof(Index));
        }

        private async Task PopulateDropdownsAsync(int? selectedMovieId = null, int? selectedRoomId = null)
        {
            var movies = await _movieService.GetAllMoviesAsync();
            ViewBag.MovieId = new SelectList(movies, "Id", "Title", selectedMovieId);

            var (rooms, _) = await _roomService.GetRoomsPagedAsync("", 1, 500);
            var roomItems = rooms.Select(r => new {
                Id = r.Id,
                DisplayName = r.Cinema != null ? $"{r.Cinema.Name} - {r.Name} (Cap. {r.Capacity})" : r.Name
            }).ToList();

            ViewBag.RoomId = new SelectList(roomItems, "Id", "DisplayName", selectedRoomId);
        }
    }
}
