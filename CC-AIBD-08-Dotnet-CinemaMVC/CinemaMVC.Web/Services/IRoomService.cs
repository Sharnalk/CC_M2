using CinemaMVC.Web.Models.Entities;

namespace CinemaMVC.Web.Services
{
    /// <summary>
    /// Service contract for managing Room entities.
    /// </summary>
    public interface IRoomService
    {
        /// <summary>
        /// Retrieves a room by its unique identifier.
        /// </summary>
        /// <param name="id">The room ID.</param>
        /// <returns>The room if found; otherwise, null.</returns>
        Task<Room?> GetRoomByIdAsync(int id);

        /// <summary>
        /// Retrieves all rooms belonging to a cinema.
        /// </summary>
        /// <param name="cinemaId">The cinema identifier.</param>
        /// <returns>A collection of rooms.</returns>
        Task<IEnumerable<Room>> GetRoomsByCinemaIdAsync(int cinemaId);

        /// <summary>
        /// Retrieves a paged and filtered list of rooms.
        /// </summary>
        /// <param name="search">The search term filter for room name or cinema name.</param>
        /// <param name="page">The 1-based page number.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>A tuple containing the rooms list and the total count of matching rooms.</returns>
        Task<(IEnumerable<Room> Rooms, int TotalCount)> GetRoomsPagedAsync(string search, int page, int pageSize);

        /// <summary>
        /// Adds a new room.
        /// </summary>
        /// <param name="room">The room to add.</param>
        Task AddRoomAsync(Room room);

        /// <summary>
        /// Updates an existing room.
        /// </summary>
        /// <param name="room">The room to update.</param>
        Task UpdateRoomAsync(Room room);

        /// <summary>
        /// Deletes a room by its identifier.
        /// </summary>
        /// <param name="id">The room ID to delete.</param>
        Task DeleteRoomAsync(int id);
    }
}
