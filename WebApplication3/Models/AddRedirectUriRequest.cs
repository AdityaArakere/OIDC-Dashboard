namespace WebApplication3.Models
{
    public class AddRedirectUriRequest
    {
        public string RequestedBy { get; set; }
        public string NewRedirectUri { get; set; }
        public string OriginalRedirectUri { get; set; }
        public string displayName { get; set; }
        public DateTime CurrentDate { get; set; }
        public string ApprovalStatus { get; set; }
    }
}
