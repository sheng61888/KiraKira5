// Program.cs
using Microsoft.Extensions.FileProviders;
using System.Text.Json;
using KiraKira5.Services;
using MySql.Data.MySqlClient; 

var builder = WebApplication.CreateBuilder(args);

// --- 1. Get your connection string ---
var connectionString = builder.Configuration.GetConnectionString("KiraKiraDB");

// --- 2. Add your services to the container ---
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
});

// Add your database connection
builder.Services.AddTransient<MySqlConnection>(_ => new MySqlConnection(connectionString));

// Add your custom services
builder.Services.AddScoped<ILearnerService, LearnerService>();
// --- ADD '!' TO FIX CS8604 WARNING ---
builder.Services.AddScoped<CourseService>(sp => new CourseService(connectionString!));
builder.Services.AddScoped<TeacherService>(sp => new TeacherService(connectionString!)); 

// --- 3. Add CORS ---
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// --- 4. Build the app ---
var app = builder.Build();

// --- 5. Configure the HTTP request pipeline ---
app.UseCors();

// This tells .NET to serve files from a "wwwroot" folder
app.UseDefaultFiles(); 
app.UseStaticFiles(); 

// This (from your file) serves from the root. Let's keep both.
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath)),
    RequestPath = ""
});

app.UseRouting();
app.MapControllers();

// --- 6. Run the app ---
app.Run();