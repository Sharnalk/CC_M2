using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace CinemaMVC.Web.Middlewares
{
    /// <summary>
    /// Middleware for capturing and handling exceptions globally in the HTTP request pipeline.
    /// </summary>
    public class GlobalExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

        public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Une erreur non gérée est survenue lors de l'exécution de la requête : {Message}", ex.Message);
                context.Response.Redirect("/Home/Error");
            }
        }
    }
}
