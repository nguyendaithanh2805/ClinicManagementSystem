using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/staff/doctor-dashboards")]
    [ApiController]
    [Authorize(Roles = "Doctor")]
    public class DoctocDashboardController : ControllerBase
    {
    }
}
