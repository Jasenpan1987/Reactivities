using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Photos
{
  public class SetMain
  {
    public class Command : IRequest<Result<Unit>>
    {
      public string Id { get; set; }
    }

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
      private readonly DataContext _dataContext;
      private readonly IUserAccessor _userAccessor;
      public Handler(DataContext dataContext, IUserAccessor userAccessor)
      {
        _userAccessor = userAccessor;
        _dataContext = dataContext;
      }
      public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
      {
          var user = await _dataContext.Users.Include(u => u.Photos).FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
          if (user == null) {
              return null;
          }

          var photo = user.Photos.FirstOrDefault(p => p.Id == request.Id);
          if (photo == null)
          {
              return null;
          }

          var userMainPhoto = user.Photos.FirstOrDefault(p => p.IsMain);
          if (userMainPhoto != null) {
              userMainPhoto.IsMain = false;
          }
          
          photo.IsMain = true;

          var success = await _dataContext.SaveChangesAsync() > 0;

          if (success) {
              return Result<Unit>.Success(Unit.Value);
          }

          return Result<Unit>.Failure("Unable to set main photo");
      }
    }
  }
}