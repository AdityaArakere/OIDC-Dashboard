using System.IdentityModel.Tokens.Jwt;
using Azure;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

namespace WebApplication3.Security
{
    internal class KeyVault
    {
        public static string GetConfiguration(KeyVaultSecret keyVaultSecret, string keyVaultUrl)
        {
            LogOnConsole($"Loading Keyvault configuration from {keyVaultUrl}");
            if (!string.IsNullOrEmpty(keyVaultUrl))
            {
                try
                {
                    var client = new SecretClient(vaultUri: new Uri(keyVaultUrl), credential: new DefaultAzureCredential());

                    string? secretName = Enum.GetName(typeof(KeyVaultSecret), keyVaultSecret);
                    LogOnConsole($"Fetch Keyvault details for {secretName}");

                    Azure.Security.KeyVault.Secrets.KeyVaultSecret secret = client.GetSecret(secretName);
                    LogOnConsole($"Successfully fetch keyvault details for {secretName} - {Mask(secret.Value)}");
                    return secret.Value;
                }
                catch (RequestFailedException ex)
                {
                    if (ex.Message.Contains("Forbidden", StringComparison.InvariantCultureIgnoreCase))
                    {
                        LogOnConsole($"You do not have access to the {keyVaultUrl}. {ex.Message} - {GetApplicationUser()}", true);
                        throw new UnauthorizedAccessException($"You do not have access to the {keyVaultUrl}. {ex.Message}");
                    }
                    else
                    {
                        LogOnConsole($"Key Vault secret not found. {ex.Message}", true);
                        throw new KeyNotFoundException($"Key Vault secret not found. {ex.Message}");
                    }
                }
                catch (AuthenticationFailedException ex)
                {
                    LogOnConsole($"No azure account is associated with this application/system. {ex.Message}", true);
                    throw new UnauthorizedAccessException($"No azure account is associated with this application/system.  {keyVaultUrl}. {ex.Message}");
                }
            }
            else
            {
                LogOnConsole("Key vault settings missing or empty", true);
                throw new NotImplementedException("Key Vault setting missing");
            }
        }

        private static string Mask(string source)
        {
            string mask = new string('*', source.Length - 1);
            string unMaskStart = source.First().ToString();
            string unMaskEnd = source.Last().ToString();

            return unMaskStart + mask + unMaskEnd;
        }

        private static void LogOnConsole(string message, bool isError = false)
        {
            Console.ForegroundColor = isError ? ConsoleColor.Red : ConsoleColor.Gray;
            Console.WriteLine(message);
            Console.ResetColor();
        }

        private static string GetApplicationUser()
        {
            try
            {
                var credential = new DefaultAzureCredential();
                string[] scopes = new string[] { "https://graph.microsoft.com/.default" };
                var token = credential.GetToken(new Azure.Core.TokenRequestContext(scopes));
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token.Token) as JwtSecurityToken;
                return jsonToken != null ? jsonToken.RawData : string.Empty;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
    }
}