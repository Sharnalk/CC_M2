using Microsoft.EntityFrameworkCore;
using CinemaMVC.Web.Models.Entities;
using CinemaMVC.Web.Repositories;

namespace CinemaMVC.Web.Services
{
    /// <summary>
    /// Service implementation for managing Room entities.
    /// </summary>
    public class RoomService : CrudServiceBase<Room>, IRoomService
    {
        private readonly IRepository<Room> _roomRepository;

        public RoomService(IRepository<Room> roomRepository) : base(roomRepository)
        {
            _roomRepository = roomRepository;
        }

        /// <inheritdoc />
        public async Task<Room?> GetRoomByIdAsync(int id)
        {
            return await _roomRepository.GetQueryable()
                .Include(r => r.Cinema)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<Room>> GetRoomsByCinemaIdAsync(int cinemaId)
        {
            return await _roomRepository.GetQueryable()
                .Where(r => r.CinemaId == cinemaId)
                .OrderBy(r => r.Name)
                .ToListAsync();
        }

        /// <inheritdoc />
        public async Task<(IEnumerable<Room> Rooms, int TotalCount)> GetRoomsPagedAsync(string search, int page, int pageSize)
        {
            var query = _roomRepository.GetQueryable()
                .Include(r => r.Cinema)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                // ToLower()+Contains() : seul motif compatible a la fois avec PostgreSQL
                // (Npgsql) et le provider InMemory des tests (voir CinemaService).
                var searchLower = search.ToLower();
                query = query.Where(r => r.Name.ToLower().Contains(searchLower)
                                      || (r.Cinema != null && r.Cinema.Name.ToLower().Contains(searchLower)));
            }

            int totalCount = await query.CountAsync();
            var rooms = await query
                .OrderBy(r => r.Cinema != null ? r.Cinema.Name : "")
                .ThenBy(r => r.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (rooms, totalCount);
        }

        /// <inheritdoc />
        public Task AddRoomAsync(Room room) => AddEntityAsync(room);

        /// <inheritdoc />
        public Task UpdateRoomAsync(Room room) => UpdateEntityAsync(room);

        /// <inheritdoc />
        public Task DeleteRoomAsync(int id) => DeleteEntityAsync(id);
    }
}
