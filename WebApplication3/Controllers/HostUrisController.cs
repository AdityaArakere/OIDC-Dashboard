using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication3.Models;
using WebApplication3.Services;

[ApiController]
[Route("api")]
[Authorize]
public class HostUrisController : ControllerBase
{
    private readonly ITableService _tableService;

    public HostUrisController(ITableService tableService)
    {
        _tableService = tableService;
    }

    [HttpGet("allowed-hosts")]
    public IActionResult GetAllowedHosts()
    {
        try
        {
            var allowedHosts = _tableService.GetAllowedHosts();
            return Ok(allowedHosts);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("add-host-uri")]
    public IActionResult AddHostUri([FromBody] AddHostUriRequest request)
    {
        try
        {
            _tableService.AddHostUri(request);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("reject-host-uri")]
    [Authorize(Policy = "AdminOnly")]
    public IActionResult RejectHostUri([FromBody] RejectHostUri request)
    {
        try
        {
            var result = _tableService.RejectHostUri(request);
            return result ? Ok() : NotFound("No record found with the provided id.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("approve-host-uri")]
    [Authorize(Policy = "AdminOnly")]
    public IActionResult AddOrUpdateHostUri([FromBody] ApproveHostUri request)
    {
        try
        {
            _tableService.ApproveHostUri(request);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

}
