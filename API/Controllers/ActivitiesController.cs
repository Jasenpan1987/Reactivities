using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;
using MediatR;
using System.Threading;
using Microsoft.AspNetCore.Authorization;
using Application;
using Application.Activities;
using Application.Core;

namespace API.Controllers
{
  public class ActivitiesController : BaseAPIController
  {
    [HttpGet]
    public async Task<IActionResult> GetActivities([FromQuery] ActivityParams activityParams)
    {
      return HandlePagedResult(await Mediator.Send(new List.Query {ActivityParams = activityParams}));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetActivity(Guid id)
    {
      var result = await Mediator.Send(new Details.Query{Id = id});
      return HandleResult<ActivityDTO>(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateActivity([FromBody]Activity activity) {
      activity.Date = DateTime.SpecifyKind(activity.Date, DateTimeKind.Utc);
      return HandleResult<Unit>(await Mediator.Send(new Create.Command{Activity = activity}));
    }

    [Authorize(Policy = "IsActivityHost")]
    [HttpPut("{id}")]
    public async Task<IActionResult> EditActivity(Guid id, [FromBody]Activity activity) {
      activity.Id = id;
      activity.Date = DateTime.SpecifyKind(activity.Date, DateTimeKind.Utc);
      return HandleResult<Unit>(await Mediator.Send(new Edit.Command{Activity = activity}));
    }

    [Authorize(Policy = "IsActivityHost")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteActivity(Guid id) {
      return HandleResult<Unit>(await Mediator.Send(new Delete.Command{Id = id}));
    }

    [HttpPost("{id}/attend")]
    public async Task<IActionResult> Attend(Guid id) {
      return HandleResult<Unit>(await Mediator.Send(new UpdateAttendance.Command{Id = id}));
    }
  }
}