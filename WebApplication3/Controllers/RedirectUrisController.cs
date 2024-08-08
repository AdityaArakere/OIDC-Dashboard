using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication3.Models;
using WebApplication3.Services;

[ApiController]
[Route("api")]
[Authorize]
public class RedirectUrisController : ControllerBase
{
    private readonly ITableService _tableService;

    public RedirectUrisController(ITableService tableService)
    {
        _tableService = tableService;
    }

    [HttpGet("applications")]
    public IActionResult GetApplications()
    {
        try
        {
            var applications = _tableService.GetApplications();
            return Ok(applications);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("add-redirect-uri")]
    public IActionResult AddRedirectUri([FromBody] AddRedirectUriRequest request)
    {
        try
        {
            _tableService.AddRedirectUri(request);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("reject-redirect-uri")]
    [Authorize(Policy = "AdminOnly")]
    public IActionResult RejectRedirectUri([FromBody] RejectRedirectUri request)
    {
        try
        {
            var result = _tableService.RejectRedirectUri(request);
            return result ? Ok() : NotFound("No record found with the provided id.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("approve-redirect-uri")]
    [Authorize(Policy = "AdminOnly")]
    public IActionResult AddOrUpdateRedirectUri([FromBody] ApproveRedirectUri request)
    {
        try
        {
            _tableService.ApproveRedirectUri(request);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
