using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CinemaMVC.Web.Filters
{
    /// <summary>
    /// Rejects a request with 400 before the action body runs if model binding
    /// produced an invalid ModelState (e.g. a non-numeric "id" route segment).
    /// Applied globally so every action is covered without repeating the same
    /// check in each controller (see Program.cs).
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class ValidateModelStateAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                context.Result = new BadRequestResult();
            }
        }
    }
}
