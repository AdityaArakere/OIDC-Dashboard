using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using System.Data;
using WebApplication3.Models;

namespace WebApplication3.Services
{
    public class TableService : ITableService
    {
        private readonly string _connectionString;

        public TableService(IOptions<ConnectionStrings> options)
        {
            _connectionString = options.Value.OidcConnection;
        }

        public List<string> GetAllowedHosts()
        {
            var allowedHosts = new List<string>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                using (SqlCommand cmd = new SqlCommand("[dbo].[GetAllowedHosts]", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            allowedHosts.Add(reader.GetString(0));
                        }
                    }
                }
            }

            return allowedHosts;
        }

        public List<Models.Application> GetApplications()
        {
            var applications = new List<Models.Application>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                string query = "SELECT DISTINCT DisplayName FROM [dbo].[OpenIddictApplications]";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var displayName = reader.GetString(0);
                            var application = new Models.Application { DisplayName = displayName, RedirectUris = new List<string>() };

                            applications.Add(application);
                        }
                    }
                }

                foreach (var application in applications)
                {
                    string redirectUriQuery = "SELECT DISTINCT RedirectUris FROM [dbo].[OpenIddictApplications] WHERE DisplayName = @DisplayName";

                    using (SqlCommand redirectCmd = new SqlCommand(redirectUriQuery, conn))
                    {
                        redirectCmd.Parameters.AddWithValue("@DisplayName", application.DisplayName);

                        using (SqlDataReader redirectReader = redirectCmd.ExecuteReader())
                        {
                            while (redirectReader.Read())
                            {
                                application.RedirectUris.Add(redirectReader.GetString(0));
                            }
                        }
                    }
                }
            }

            return applications;
        }

        public void AddRedirectUri(AddRedirectUriRequest request)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                string query = "INSERT INTO [dbo].[RedirectUriApproval] (RequestedBy, RedirectUri, OriginalRedirectUri, DisplayName, RequestedDate, ApprovalStatus, ApprovedBy, ApprovedDate) VALUES (@RequestedBy, @RedirectUri, @OriginalRedirectUri, @DisplayName, @RequestedDate, @ApprovalStatus, @ApprovedBy, @ApprovedDate)";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@RequestedBy", request.RequestedBy);
                    cmd.Parameters.AddWithValue("@RedirectUri", request.NewRedirectUri);
                    cmd.Parameters.AddWithValue("@OriginalRedirectUri", request.OriginalRedirectUri);
                    cmd.Parameters.AddWithValue("@DisplayName", request.displayName);
                    cmd.Parameters.AddWithValue("@RequestedDate", request.CurrentDate);
                    cmd.Parameters.AddWithValue("@ApprovalStatus", request.ApprovalStatus);
                    cmd.Parameters.AddWithValue("@ApprovedBy", DBNull.Value);
                    cmd.Parameters.AddWithValue("@ApprovedDate", DBNull.Value);

                    cmd.ExecuteNonQuery();
                }
            }
        }

        public void AddHostUri(AddHostUriRequest request)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                string query = "INSERT INTO [dbo].[HostUriApproval] (RequestedBy, HostUri, OriginalHostUri, RequestedDate, ApprovalStatus, ApprovedBy, ApprovedDate) VALUES (@RequestedBy, @HostUri, @OriginalHostUri, @RequestedDate, @ApprovalStatus, @ApprovedBy, @ApprovedDate)";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@RequestedBy", request.RequestedBy);
                    cmd.Parameters.AddWithValue("@HostUri", request.NewHostUri);
                    cmd.Parameters.AddWithValue("@OriginalHostUri", request.OriginalHostUri);
                    cmd.Parameters.AddWithValue("@RequestedDate", request.CurrentDate);
                    cmd.Parameters.AddWithValue("@ApprovalStatus", request.ApprovalStatus);
                    cmd.Parameters.AddWithValue("@ApprovedBy", DBNull.Value);
                    cmd.Parameters.AddWithValue("@ApprovedDate", DBNull.Value);

                    cmd.ExecuteNonQuery();
                }
            }
        }

        public List<ApprovalRequest> GetApprovalRequests()
        {
            var approvalRequests = new List<ApprovalRequest>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                // Fetch data from HostUriApproval table
                string hostUriQuery = "SELECT Id, RequestedBy, HostUri, OriginalHostUri, ApprovalStatus FROM [dbo].[HostUriApproval]";
                using (SqlCommand cmd = new SqlCommand(hostUriQuery, conn))
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            approvalRequests.Add(new ApprovalRequest
                            {
                                id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                Uri = reader.GetString(2),
                                OriginalUri = reader.GetString(3),
                                ApprovalStatus = reader.GetString(4),
                                Type = "HostUri",
                                DisplayName = null
                            });
                        }
                    }
                }

                // Fetch data from RedirectUriApproval table
                string redirectUriQuery = "SELECT Id, RequestedBy, RedirectUri, OriginalRedirectUri, ApprovalStatus, DisplayName FROM [dbo].[RedirectUriApproval]";
                using (SqlCommand cmd = new SqlCommand(redirectUriQuery, conn))
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            approvalRequests.Add(new ApprovalRequest
                            {
                                id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                Uri = reader.GetString(2),
                                OriginalUri = reader.GetString(3),
                                ApprovalStatus = reader.GetString(4),
                                Type = "RedirectUri",
                                DisplayName = reader.GetString(5)
                            });
                        }
                    }
                }
            }

            return approvalRequests;
        }

        public bool RejectHostUri(RejectHostUri request)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                string query = @"
                    UPDATE [dbo].[HostUriApproval] 
                    SET ApprovalStatus = @approvalStatus, 
                        ApprovedBy = @approvedBy, 
                        ApprovedDate = @approvedDate 
                    WHERE Id = @id";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@id", request.id);
                    cmd.Parameters.AddWithValue("@approvalStatus", request.approvalStatus);
                    cmd.Parameters.AddWithValue("@approvedBy", request.approvedBy);
                    cmd.Parameters.AddWithValue("@approvedDate", request.approvedDate);

                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
        }

        public void ApproveHostUri(ApproveHostUri request)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                if (request.originalUri == "NULL")
                {
                    // Add new host URI
                    string query = "INSERT INTO [dbo].[AllowedHosts] (Host) VALUES (@Host)";

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@Host", request.uri);
                        cmd.ExecuteNonQuery();
                    }
                }
                else
                {
                    // Update existing host URI
                    string query = "UPDATE [dbo].[AllowedHosts] SET Host = @NewHostUri WHERE Host = @OriginalHostUri";

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@NewHostUri", request.uri);
                        cmd.Parameters.AddWithValue("@OriginalHostUri", request.originalUri);
                        cmd.ExecuteNonQuery();
                    }
                }

                string updateQuery = @"
                    UPDATE [dbo].[HostUriApproval] 
                    SET ApprovalStatus = @approvalStatus, 
                        ApprovedBy = @approvedBy, 
                        ApprovedDate = @approvedDate 
                    WHERE Id = @id";

                using (SqlCommand updateCmd = new SqlCommand(updateQuery, conn))
                {
                    updateCmd.Parameters.AddWithValue("@id", request.id);
                    updateCmd.Parameters.AddWithValue("@approvalStatus", request.approvalStatus);
                    updateCmd.Parameters.AddWithValue("@approvedBy", request.approvedBy);
                    updateCmd.Parameters.AddWithValue("@approvedDate", request.approvedDate);

                    updateCmd.ExecuteNonQuery();
                }
            }
        }


        public bool RejectRedirectUri(RejectRedirectUri request)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                string query = @"
                    UPDATE [dbo].[RedirectUriApproval] 
                    SET ApprovalStatus = @approvalStatus, 
                        ApprovedBy = @approvedBy, 
                        ApprovedDate = @approvedDate 
                    WHERE Id = @id";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@id", request.id);
                    cmd.Parameters.AddWithValue("@approvalStatus", request.approvalStatus);
                    cmd.Parameters.AddWithValue("@approvedBy", request.approvedBy);
                    cmd.Parameters.AddWithValue("@approvedDate", request.approvedDate);

                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
        }

        public void ApproveRedirectUri(ApproveRedirectUri request)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                // Fetch the existing RedirectUris
                string fetchQuery = "SELECT RedirectUris FROM [dbo].[OpenIddictApplications] WHERE DisplayName = @DisplayName";
                string existingRedirectUrisJson = null;

                using (SqlCommand fetchCmd = new SqlCommand(fetchQuery, conn))
                {
                    fetchCmd.Parameters.AddWithValue("@DisplayName", request.displayName);
                    existingRedirectUrisJson = (string)fetchCmd.ExecuteScalar();
                }

                if (string.IsNullOrEmpty(existingRedirectUrisJson))
                {
                    throw new Exception("No application found with the provided display name.");
                }

                // Deserialize the JSON array
                var existingRedirectUris = Newtonsoft.Json.JsonConvert.DeserializeObject<List<string>>(existingRedirectUrisJson);

                if (request.originalUri == "NULL")
                {
                    // Add new URI
                    if (!existingRedirectUris.Contains(request.uri))
                    {
                        existingRedirectUris.Add(request.uri);
                    }
                }
                else
                {
                    // Update existing URI
                    var index = existingRedirectUris.IndexOf(request.originalUri);
                    if (index != -1)
                    {
                        existingRedirectUris[index] = request.uri;
                    }
                    else
                    {
                        throw new Exception("Original URI not found in the existing redirect URIs.");
                    }
                }

                // Serialize the updated list back to JSON
                string updatedRedirectUrisJson = Newtonsoft.Json.JsonConvert.SerializeObject(existingRedirectUris);

                // Update the database with the new JSON array
                string updateQuery = "UPDATE [dbo].[OpenIddictApplications] SET RedirectUris = @RedirectUris WHERE DisplayName = @DisplayName";

                using (SqlCommand updateCmd = new SqlCommand(updateQuery, conn))
                {
                    updateCmd.Parameters.AddWithValue("@RedirectUris", updatedRedirectUrisJson);
                    updateCmd.Parameters.AddWithValue("@DisplayName", request.displayName);
                    updateCmd.ExecuteNonQuery();
                }

                string updateTable = @"
                    UPDATE [dbo].[RedirectUriApproval] 
                    SET ApprovalStatus = @approvalStatus, 
                        ApprovedBy = @approvedBy, 
                        ApprovedDate = @approvedDate 
                    WHERE Id = @id";

                using (SqlCommand updateCmd = new SqlCommand(updateTable, conn))
                {
                    updateCmd.Parameters.AddWithValue("@id", request.id);
                    updateCmd.Parameters.AddWithValue("@approvalStatus", request.approvalStatus);
                    updateCmd.Parameters.AddWithValue("@approvedBy", request.approvedBy);
                    updateCmd.Parameters.AddWithValue("@approvedDate", request.approvedDate);

                    updateCmd.ExecuteNonQuery();
                }
            }
        }

        public List<string> GetAdminEmails()
        {
            var adminEmails = new List<string>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                string query = "SELECT email FROM [dbo].[OpenIddictAdmins]";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            adminEmails.Add(reader.GetString(0));
                        }
                    }
                }
            }

            return adminEmails;
        }
    }
}
