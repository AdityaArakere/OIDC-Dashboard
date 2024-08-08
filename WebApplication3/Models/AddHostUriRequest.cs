namespace WebApplication3.Models
{
    public class AddHostUriRequest
    {
        public string RequestedBy { get; set; }
        public string NewHostUri { get; set; }
        public string OriginalHostUri { get; set; }
        public DateTime CurrentDate { get; set; }
        public string ApprovalStatus { get; set; }
    }
}
