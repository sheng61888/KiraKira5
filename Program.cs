// Program.cs
using Microsoft.Extensions.FileProviders;
using System.Text.Json;
using KiraKira5.Services;
<<<<<<< HEAD
using MySql.Data.MySqlClient; 
=======
>>>>>>> parent of 0154d7b (Merge branch 'main' of https://github.com/sheng61888/KiraKira5)

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
});
builder.Services.AddScoped<ILearnerService, LearnerService>();
<<<<<<< HEAD
// --- ADD '!' TO FIX CS8604 WARNING ---
builder.Services.AddScoped<CourseService>(sp => new CourseService(connectionString!));
builder.Services.AddScoped<TeacherService>(sp => new TeacherService(connectionString!)); 

// --- 3. Add CORS ---
=======
builder.Services.AddScoped<CourseService>(sp => 
    new CourseService(builder.Configuration.GetConnectionString("KiraKiraDB")));
>>>>>>> parent of 0154d7b (Merge branch 'main' of https://github.com/sheng61888/KiraKira5)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();
<<<<<<< HEAD

// This tells .NET to serve files from a "wwwroot" folder
app.UseDefaultFiles(); 
app.UseStaticFiles(); 

// This (from your file) serves from the root. Let's keep both.
=======
>>>>>>> parent of 0154d7b (Merge branch 'main' of https://github.com/sheng61888/KiraKira5)
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath)),
    RequestPath = ""
});
app.UseRouting();
app.MapControllers();

app.Run();
