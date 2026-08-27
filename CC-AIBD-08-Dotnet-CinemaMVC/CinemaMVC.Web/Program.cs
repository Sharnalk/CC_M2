using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CinemaMVC.Web.Data;
using CinemaMVC.Web.Middlewares;
using CinemaMVC.Web.Repositories;
using CinemaMVC.Web.Services;
using System.Globalization;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// L'application est entièrement en français : sans cela, les dates formatées dans les
// vues ("dddd dd MMMM yyyy") sortent en anglais, la culture par défaut étant celle du
// système hôte.
var frenchCulture = new CultureInfo("fr-FR");
CultureInfo.DefaultThreadCurrentCulture = frenchCulture;
CultureInfo.DefaultThreadCurrentUICulture = frenchCulture;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// 1. Configure EF Core with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Configure ASP.NET Core Identity with ApplicationDbContext
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 1;

    // User settings
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure Application Cookie Settings
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.LogoutPath = "/Account/Logout";
    options.AccessDeniedPath = "/Account/AccessDenied";
});

// 3. Inject Repository and Services
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ICinemaService, CinemaService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IMovieService, MovieService>();
builder.Services.AddScoped<ISessionService, SessionService>();

var app = builder.Build();

// 4. Use Global Exception Handling Middleware
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

// 5. Enable Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

// 6. Seed Database on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<IdentityUser>>();
        await DbInitializer.SeedAsync(context, userManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

await app.RunAsync();
