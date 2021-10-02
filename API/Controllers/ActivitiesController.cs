using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;
using MediatR;
using Application.Activities;
using System.Threading;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
  [AllowAnonymous]
  public class ActivitiesController : BaseAPIController
  {
    [HttpGet]
    public async Task<IActionResult> GetActivities(CancellationToken token)
    {
      return HandleResult<List<Activity>>(await Mediator.Send(new List.Query(), token));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetActivity(Guid id)
    {
      var result = await Mediator.Send(new Details.Query{Id = id});
      return HandleResult<Activity>(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateActivity([FromBody]Activity activity) {
      activity.Date = DateTime.SpecifyKind(activity.Date, DateTimeKind.Utc);
      return HandleResult<Unit>(await Mediator.Send(new Create.Command{Activity = activity}));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> EditActivity(Guid id, [FromBody]Activity activity) {
      activity.Id = id;
      activity.Date = DateTime.SpecifyKind(activity.Date, DateTimeKind.Utc);
      return HandleResult<Unit>(await Mediator.Send(new Edit.Command{Activity = activity}));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteActivity(Guid id) {
      return HandleResult<Unit>(await Mediator.Send(new Delete.Command{Id = id}));
    }
  }
}