using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Persistence;

namespace Application.Activities
{
  public class List
  {
    public class Query : IRequest<Result<PagedList<ActivityDTO>>>
    {
      public ActivityParams ActivityParams { get; set; }
    }

    public class Handler : IRequestHandler<Query, Result<PagedList<ActivityDTO>>>
    {
      private readonly DataContext _context;
      private readonly ILogger _logger;
      private readonly IMapper _mapper;
      private readonly IUserAccessor _accessor;

      public Handler(DataContext context, ILogger<List> logger, IMapper mapper, IUserAccessor accessor)
      {
        _accessor = accessor;
        _mapper = mapper;
        _logger = logger;
        _context = context;
      }
      public async Task<Result<PagedList<ActivityDTO>>> Handle(Query request, CancellationToken cancellationToken)
      {
        var query = _context.Activities
            .Where(d => d.Date >= request.ActivityParams.StartDate)
            .OrderBy(d => d.Date)
            .ProjectTo<ActivityDTO>(_mapper.ConfigurationProvider, new {currentUsername = _accessor.GetUsername()})
            .AsQueryable();

        if (request.ActivityParams.IsGoing && request.ActivityParams.IsHost)
        {
          return Result<PagedList<ActivityDTO>>.Success(null);
        }

        if (request.ActivityParams.IsGoing) {
          query = query.Where(
            act => act.HostUsername != _accessor.GetUsername() && 
            act.Attendees.Any(at => at.Username == _accessor.GetUsername())
          );
        }

        if (request.ActivityParams.IsHost) {
          query = query.Where(act => act.HostUsername == _accessor.GetUsername());
        }

        
        return Result<PagedList<ActivityDTO>>.Success(
          await PagedList<ActivityDTO>.CreateAsync(query, request.ActivityParams.PageNumber, request.ActivityParams.PageSize)
        );
      }
    }
  }
}