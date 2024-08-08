using WebApplication3.Models;

namespace WebApplication3.Services
{
    public interface ITableService
    {
        List<string> GetAllowedHosts();
        List<WebApplication3.Models.Application> GetApplications();
        void AddRedirectUri(AddRedirectUriRequest request);
        void AddHostUri(AddHostUriRequest request);
        List<ApprovalRequest> GetApprovalRequests();
        bool RejectHostUri(RejectHostUri request);
        void ApproveHostUri(ApproveHostUri request);
        bool RejectRedirectUri(RejectRedirectUri request);
        void ApproveRedirectUri(ApproveRedirectUri request);
        List<string> GetAdminEmails();
    }
}
