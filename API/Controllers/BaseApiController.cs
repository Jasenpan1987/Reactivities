using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Extensions;
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

        protected IActionResult HandlePagedResult<T>(Result<PagedList<T>> result) {
            if (result == null) 
            {
                return NotFound();
            }

            if (result.IsSuccess && result.Value != null) 
            {
                Response.AddPaginationHeader(
                    result.Value.CurrentPage, 
                    result.Value.PageSize, 
                    result.Value.TotalCount, 
                    result.Value.TotalPages
                );
                return Ok(result.Value);
            }

            if (result.IsSuccess && result.Value == null) 
            {
                return NotFound();
            }

            return BadRequest(result.Error);
        }
    }
}