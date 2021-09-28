using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Persistence;

namespace Application.Activities
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activityToRemove = await _context.Activities.FindAsync(request.Id);

                if (activityToRemove == null) {
                    return null;
                }
                
                _context.Activities.Remove(activityToRemove);
                var result = await _context.SaveChangesAsync() > 0;
                if (!result) {
                    return Result<Unit>.Failure("Failed to delete activity");
                }
                return Result<Unit>.Success(Unit.Value);
            }
    }
  }
}