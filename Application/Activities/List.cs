using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
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
    public class Query : IRequest<Result<List<ActivityDTO>>>
    {
    }

    public class Handler : IRequestHandler<Query, Result<List<ActivityDTO>>>
    {
      private readonly DataContext _context;
      private readonly ILogger _logger;
      private readonly IMapper _mapper;

      public Handler(DataContext context, ILogger<List> logger, IMapper mapper)
      {
        _mapper = mapper;
        _logger = logger;
        _context = context;
      }
      public async Task<Result<List<ActivityDTO>>> Handle(Query request, CancellationToken cancellationToken)
      {
        // try
        // {
        //     for (var i = 0; i < 10; i += 1)
        //     {
        //         cancellationToken.ThrowIfCancellationRequested();
        //         await Task.Delay(1000, cancellationToken);
        //         _logger.LogInformation($"Task {i} has completed");
        //     }
        // }
        // catch (Exception ex) when (ex is TaskCanceledException)
        // {
        //   _logger.LogInformation("Task was cancelled.");
        // }
        var activities = await _context.Activities
            .ProjectTo<ActivityDTO>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
        return Result<List<ActivityDTO>>.Success(activities);
      }
    }
  }
}