﻿namespace WebApplication3.Models
{
    public class RejectRedirectUri
    {
        public int id { get; set; }
        public string name { get; set; }
        public string uri { get; set; }
        public string originalUri { get; set; }
        public string displayName { get; set; }
        public string approvalStatus { get; set; }
        public string approvedBy { get; set; }
        public string approvedDate { get; set; }
    }
}
