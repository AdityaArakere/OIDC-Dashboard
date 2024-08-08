using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication3.Services;

[ApiController]
[Route("api")]
[Authorize]
public class ApprovalrequestsController : ControllerBase
{
    private readonly ITableService _tableService;

    public ApprovalrequestsController(ITableService tableService)
    {
        _tableService = tableService;
    }

    [HttpGet("approval-requests")]
    public IActionResult GetApprovalRequests()
    {
        try
        {
            var approvalRequests = _tableService.GetApprovalRequests();
            return Ok(approvalRequests);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("admins")]
    public IActionResult GetAdminEmails()
    {
        try
        {
            var adminEmails = _tableService.GetAdminEmails();
            return Ok(adminEmails);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
