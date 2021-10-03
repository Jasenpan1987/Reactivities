using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
  public class UpdateAttendance
  {
    public class Command : IRequest<Result<Unit>>
    {
      public Guid Id { get; set; }
    }

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
      private readonly IUserAccessor _accessor;
      private readonly DataContext _context;
      public Handler(DataContext context, IUserAccessor accessor)
      {
            _context = context;
            _accessor = accessor;
      }
      public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
      {
        var activity = await _context.Activities
            .Include(a => a.Attendees)
            .ThenInclude(u => u.AppUser)
            .FirstOrDefaultAsync(x => x.Id == request.Id);
        
        if (activity == null) {
            return null;
        }

        var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _accessor.GetUsername());

        if (user == null) {
            return null;
        }

        var activityHostName = activity.Attendees.FirstOrDefault(x => x.IsHost)?.AppUser?.UserName;

        var currentUserInActivity = activity.Attendees.FirstOrDefault(x => x.AppUser.UserName == user.UserName);
        
        if (currentUserInActivity != null && activityHostName == user.UserName) {
        // current user in the attendance list and he is the host of the activity
            activity.IsCancelled = !activity.IsCancelled;
        } else if (currentUserInActivity != null && activityHostName != user.UserName) {
        // current user is in the attendance list but he is not the host of the activity
            activity.Attendees.Remove(currentUserInActivity);
        } else {
        // current user is not in the attendance list (which means he can not be the host)
            activity.Attendees.Add(new ActivityAttendee
            {
                ActivityId = activity.Id,
                AppUserId = user.Id,
                IsHost = false
            });
        }
        
        var result = await _context.SaveChangesAsync() > 0;

        if (!result)
        {
          return Result<Unit>.Failure("Failed to update attendees");
        }
        
        return Result<Unit>.Success(Unit.Value); // return empty unit
      }
    }
  }
}