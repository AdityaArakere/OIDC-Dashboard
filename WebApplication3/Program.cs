using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using WebApplication3.Security;
using WebApplication3.Services;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var environment = builder.Environment.EnvironmentName;
        Console.WriteLine($"Current Environment: {environment}");

        builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables();

        IdentityModelEventSource.ShowPII = true;

        builder.Services.ConfigureKeyVault(builder.Configuration.GetSection("KeyVaultUrl").Value);
        builder.Services.AddScoped<ITableService, TableService>();

        // Other services
        builder.Services.AddControllers();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowSpecificOrigins",
                builder =>
                {
                    builder.WithOrigins("https://localhost:4200")
                           .AllowAnyHeader()
                           .AllowAnyMethod();
                });
        });

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = $"https://login.microsoftonline.com/{builder.Configuration["AzureAd:TenantId"]}";
                options.Audience = builder.Configuration["AzureAd:Audience"];

                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    },
                    OnChallenge = context =>
                    {
                        Console.WriteLine("Authorization challenge triggered.");
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("Token successfully validated.");
                        return Task.CompletedTask;
                    }
                };

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = $"https://login.microsoftonline.com/{builder.Configuration["AzureAd:TenantId"]}/v2.0",
                    ValidAudience = builder.Configuration["AzureAd:Audience"]
                };
            });

        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy =>
            {
                policy.Requirements.Add(new AdminRequirement());
            });
        });

        builder.Services.AddSingleton<IAuthorizationHandler, AdminHandler>();
        builder.Services.AddHealthChecks();
        builder.Services.AddControllers();

        var app = builder.Build();

        app.MapHealthChecks("/health");

        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseHttpsRedirection();
        app.UseCors("AllowSpecificOrigins");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.Run();
    }
}

public class AdminRequirement : IAuthorizationRequirement { }

public class AdminHandler : AuthorizationHandler<AdminRequirement>
{
    private readonly IConfiguration _configuration;

    public AdminHandler(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, AdminRequirement requirement)
    {
        // Extract email from the 'upn' claim
        var email = context.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn")?.Value;

        if (string.IsNullOrEmpty(email))
        {
            Console.WriteLine("Email claim is missing.");
            return;
        }

        Console.WriteLine($"Email extracted: {email}");

        if (await IsAdminAsync(email))
        {
            context.Succeed(requirement);
        }
        else
        {
            Console.WriteLine($"Email {email} is not an admin.");
        }
    }

    private async Task<bool> IsAdminAsync(string email)
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();

            var lowerCaseEmail = email.ToLower();

            var command = new SqlCommand("SELECT COUNT(1) FROM [dbo].[OpenIddictAdmins] WHERE LOWER(Email) = @Email", connection);
            command.Parameters.AddWithValue("@Email", lowerCaseEmail);

            var count = (int)await command.ExecuteScalarAsync();
            Console.WriteLine($"Admin check for {lowerCaseEmail}: {count} found.");
            return count > 0;
        }
    }
}