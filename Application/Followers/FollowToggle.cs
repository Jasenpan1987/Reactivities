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

namespace Application.Followers
{
    public class FollowToggle
    {
        public class Command : IRequest<Result<Unit>>
        {
            public string TargetUsername { get; set; }
        }

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
        private readonly DataContext _context;
        private readonly IUserAccessor _userAccessor;
        public Handler(DataContext context, IUserAccessor userAccessor)
        {
            _userAccessor = userAccessor;
            _context = context;
        }
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var target = await _context.Users.FirstOrDefaultAsync(x => x.UserName == request.TargetUsername);
            var observer = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
            
            if (target == null || observer == null) {
                return null;
            }

            var existingUserFollowing = await _context.UserFollowings.FindAsync(observer.Id, target.Id);
            if (existingUserFollowing != null) {
                _context.UserFollowings.Remove(existingUserFollowing);
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) {
                    return Result<Unit>.Failure("Failed to unfollow");
                }
                return Result<Unit>.Success(Unit.Value);
            } else {
                var newUserFollowing = new UserFollowing { TargetId = target.Id, ObserverId = observer.Id};
                _context.UserFollowings.Add(newUserFollowing);
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) {
                    return Result<Unit>.Failure("Failed to follow");
                }
                return Result<Unit>.Success(Unit.Value);
            }
            
        }
    }
  }
}