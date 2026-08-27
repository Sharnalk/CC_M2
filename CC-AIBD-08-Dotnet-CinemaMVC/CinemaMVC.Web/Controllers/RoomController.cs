using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using CinemaMVC.Web.Models.Entities;
using CinemaMVC.Web.Services;

namespace CinemaMVC.Web.Controllers
{
    /// <summary>
    /// Admin controller managing CRUD operations for Room entities.
    /// Secured with user authorization.
    /// </summary>
    [Authorize]
    public class RoomController : Controller
    {
        private readonly IRoomService _roomService;
        private readonly ICinemaService _cinemaService;

        public RoomController(IRoomService roomService, ICinemaService cinemaService)
        {
            _roomService = roomService;
            _cinemaService = cinemaService;
        }

        public async Task<IActionResult> Index(string? search, int page = 1)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            int pageSize = 5;
            var (rooms, totalCount) = await _roomService.GetRoomsPagedAsync(search ?? "", page, pageSize);

            ViewData["CurrentFilter"] = search;
            ViewData["CurrentPage"] = page;
            ViewData["TotalPages"] = (int)Math.Ceiling((double)totalCount / pageSize);

            return View(rooms);
        }

        public async Task<IActionResult> Details(int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var room = await _roomService.GetRoomByIdAsync(id);
            if (room == null)
            {
                return NotFound();
            }
            return View(room);
        }

        public async Task<IActionResult> Create()
        {
            var cinemas = await _cinemaService.GetAllCinemasAsync();
            ViewBag.CinemaId = new SelectList(cinemas, "Id", "Name");
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Room room)
        {
            if (ModelState.IsValid)
            {
                await _roomService.AddRoomAsync(room);
                return RedirectToAction(nameof(Index));
            }

            var cinemas = await _cinemaService.GetAllCinemasAsync();
            ViewBag.CinemaId = new SelectList(cinemas, "Id", "Name", room.CinemaId);
            return View(room);
        }

        public async Task<IActionResult> Edit(int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var room = await _roomService.GetRoomByIdAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            var cinemas = await _cinemaService.GetAllCinemasAsync();
            ViewBag.CinemaId = new SelectList(cinemas, "Id", "Name", room.CinemaId);
            return View(room);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Room room)
        {
            if (id != room.Id)
            {
                return BadRequest();
            }

            if (ModelState.IsValid)
            {
                await _roomService.UpdateRoomAsync(room);
                return RedirectToAction(nameof(Index));
            }

            var cinemas = await _cinemaService.GetAllCinemasAsync();
            ViewBag.CinemaId = new SelectList(cinemas, "Id", "Name", room.CinemaId);
            return View(room);
        }

        public async Task<IActionResult> Delete(int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var room = await _roomService.GetRoomByIdAsync(id);
            if (room == null)
            {
                return NotFound();
            }
            return View(room);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            await _roomService.DeleteRoomAsync(id);
            return RedirectToAction(nameof(Index));
        }
    }
}
