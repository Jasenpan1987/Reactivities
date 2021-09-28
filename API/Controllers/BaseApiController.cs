using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class BaseAPIController : ControllerBase
    {
        private IMediator _mediator;
        
        protected IMediator Mediator {
            get {
                return _mediator ??= HttpContext.RequestServices.GetService<IMediator>();
            }
        }

        protected IActionResult HandleResult<T>(Result<T> result) {
            if (result == null) {
                return NotFound();
            }

            if (result.IsSuccess && result.Value != null) {
                return Ok(result.Value);
            }

            if (result.IsSuccess && result.Value == null) {
                return NotFound();
            }

            return BadRequest(result.Error);
        }
    }
}