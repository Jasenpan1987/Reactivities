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
  public class Delete
  {
    public class Command : IRequest<Result<Unit>>
    {
      public string Id { get; set; }
    }

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
      private readonly DataContext _dataContext;
      private readonly IUserAccessor _userAccessor;
      private readonly IPhotoAccessor _photoAccessor;
      public Handler(DataContext dataContext, IUserAccessor userAccessor, IPhotoAccessor photoAccessor)
      {
        _photoAccessor = photoAccessor;
        _userAccessor = userAccessor;
        _dataContext = dataContext;
      }
      public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
      {
          var user = await _dataContext.Users
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
        
          if (user == null) {
              return null;
          }

          var photo = user.Photos.FirstOrDefault(x => x.Id == request.Id);

          if (photo == null)
          {
              return null;
          }

          if (photo.IsMain) {
              return Result<Unit>.Failure("Can not delete the main photo");
          }

          var deleteResult = _photoAccessor.DeletePhoto(photo.Id);

          if (deleteResult == null) {
              return Result<Unit>.Failure("Problem deleting photo from cloudinary");
          }

          _dataContext.Photos.Remove(photo);
          
        //   user.Photos.Remove(photo);
          
          var success = await _dataContext.SaveChangesAsync() > 0;
          if (success)
          {
              return Result<Unit>.Success(Unit.Value);
          }

          return Result<Unit>.Failure("Unable to delete photo");
      }
    }
  }
}