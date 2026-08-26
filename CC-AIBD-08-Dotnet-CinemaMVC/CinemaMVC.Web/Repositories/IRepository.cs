using System.Linq.Expressions;

namespace CinemaMVC.Web.Repositories
{
    /// <summary>
    /// Generic Repository interface representing standard CRUD operations on database entities.
    /// </summary>
    /// <typeparam name="T">The type of database entity.</typeparam>
    public interface IRepository<T> where T : class
    {
        /// <summary>
        /// Retrieves an entity by its unique identifier asynchronously.
        /// </summary>
        /// <param name="id">The entity unique identifier.</param>
        /// <returns>A task representing the asynchronous operation, containing the entity if found; otherwise, null.</returns>
        Task<T?> GetByIdAsync(int id);

        /// <summary>
        /// Retrieves all entities asynchronously.
        /// </summary>
        /// <returns>A task representing the list of all entities.</returns>
        Task<IEnumerable<T>> GetAllAsync();

        /// <summary>
        /// Retrieves all entities matching a predicate asynchronously.
        /// </summary>
        /// <param name="predicate">The filter criteria expression.</param>
        /// <returns>A task representing the list of filtered entities.</returns>
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);

        /// <summary>
        /// Obtains an IQueryable query for the entity to allow custom query composition and filtering.
        /// </summary>
        /// <returns>An IQueryable for the entity type.</returns>
        IQueryable<T> GetQueryable();

        /// <summary>
        /// Adds a new entity asynchronously.
        /// </summary>
        /// <param name="entity">The entity to insert.</param>
        /// <returns>A task representing the insertion operation.</returns>
        Task AddAsync(T entity);

        /// <summary>
        /// Updates an existing entity.
        /// </summary>
        /// <param name="entity">The entity to update.</param>
        void Update(T entity);

        /// <summary>
        /// Deletes an existing entity.
        /// </summary>
        /// <param name="entity">The entity to delete.</param>
        void Delete(T entity);

        /// <summary>
        /// Persists all tracked changes to the database asynchronously.
        /// </summary>
        /// <returns>A task representing the saving operation, returning true if changes were written; otherwise, false.</returns>
        Task<bool> SaveChangesAsync();
    }
}
