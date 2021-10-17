using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class Update
    {

        public class CommandValidator : AbstractValidator<Command>
        {
        public CommandValidator()
        {
            RuleFor(x => x.DisplayName).NotEmpty();
        }

        }
        public class Command : IRequest<Result<Unit>>
        {
            public string DisplayName { get; set; }
            public string Bio { get; set; }
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

        if (request.DisplayName != null) {
            user.DisplayName = request.DisplayName;
        }

        if (request.Bio != null) {
            user.Bio = request.Bio;
        }

        _dataContext.Entry(user).State = EntityState.Modified;

        var success = await _dataContext.SaveChangesAsync() > 0;
        if (success) {
            return Result<Unit>.Success(Unit.Value);
        } else {
            return Result<Unit>.Failure("Unable to save");
        }
      }
    }
  }
}