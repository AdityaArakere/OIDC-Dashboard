using WebApplication3.Models;
using WebApplication3.Security;

namespace WebApplication3.Security
{
    internal static class KeyVaultStartup
    {
        internal static IServiceCollection ConfigureKeyVault(this IServiceCollection services, string keyVaultUrl)
        {
            services.Configure<ConnectionStrings>(options => options.OidcConnection = KeyVault.GetConfiguration(KeyVaultSecret.OidcConnectionString, keyVaultUrl));
            return services;
        }
    }
}