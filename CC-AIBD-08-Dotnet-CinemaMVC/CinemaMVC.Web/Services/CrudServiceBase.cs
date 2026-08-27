using CinemaMVC.Web.Repositories;

namespace CinemaMVC.Web.Services
{
    /// <summary>
    /// Factors out the Add/Update/Delete orchestration shared by every entity service
    /// (validate, delegate to the repository, save). Cinema/Movie/Room/Session services
    /// had this exact sequence duplicated four times, differing only by entity type —
    /// their public, entity-named methods (AddCinemaAsync, AddMovieAsync...) now delegate
    /// here, keeping each service's public interface unchanged.
    /// </summary>
    /// <typeparam name="T">The entity type.</typeparam>
    public abstract class CrudServiceBase<T> where T : class
    {
        protected readonly IRepository<T> Repository;

        protected CrudServiceBase(IRepository<T> repository)
        {
            Repository = repository;
        }

        protected async Task AddEntityAsync(T entity)
        {
            ArgumentNullException.ThrowIfNull(entity);
            await Repository.AddAsync(entity);
            await Repository.SaveChangesAsync();
        }

        protected async Task UpdateEntityAsync(T entity)
        {
            ArgumentNullException.ThrowIfNull(entity);
            Repository.Update(entity);
            await Repository.SaveChangesAsync();
        }

        protected async Task DeleteEntityAsync(int id)
        {
            var entity = await Repository.GetByIdAsync(id);
            if (entity != null)
            {
                Repository.Delete(entity);
                await Repository.SaveChangesAsync();
            }
        }
    }
}
