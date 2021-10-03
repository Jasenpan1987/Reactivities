using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Infrastructure.Security
{
  public class IsHostRequirement : IAuthorizationRequirement
  {

  }

  public class IsHostRequirementHandler : AuthorizationHandler<IsHostRequirement>
  {
    private readonly DataContext _dataContext;
    private readonly IHttpContextAccessor _httpAccessor;
    public IsHostRequirementHandler(DataContext dataContext, IHttpContextAccessor httpAccessor)
    {
      _httpAccessor = httpAccessor;
      _dataContext = dataContext;
    }
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, 
        IsHostRequirement requirement)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) {
            return Task.CompletedTask;
        }

        var activityId = Guid.Parse(
            _httpAccessor.HttpContext?.Request.RouteValues
                .SingleOrDefault(x => x.Key == "id").Value?.ToString());

        var attendee = _dataContext.ActivityAttendees
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.AppUserId == userId && x.ActivityId == activityId)
            .Result;
        
        if (attendee == null) {
            return Task.CompletedTask;
        }

        if (attendee.IsHost) {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
  }
}