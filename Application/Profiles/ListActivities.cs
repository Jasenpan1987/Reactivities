using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class ListActivities
    {
        public class Query: IRequest<Result<List<UserActivityDTO>>>
        {
            public string Predicate { get; set; }
            public string Username { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<UserActivityDTO>>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _mapper = mapper;
                _context = context;
            }

            public async Task<Result<List<UserActivityDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var query = _context.Activities
                    .Where(a => a.Attendees.Any(att => att.AppUser.UserName == request.Username))
                    .ProjectTo<UserActivityDTO>(_mapper.ConfigurationProvider)
                    .OrderBy(a => a.Date)
                    .AsQueryable();

                if (request.Predicate == "hosting") 
                {
                    query = query.Where(a => a.HostUsername == request.Username);
                }

                if (request.Predicate == "past") 
                {
                    query = query.Where(a => a.Date < DateTime.UtcNow);
                }

                if (request.Predicate == "future") 
                {
                    query = query.Where(a => a.Date > DateTime.UtcNow);
                }

                return Result<List<UserActivityDTO>>.Success(await query.ToListAsync());
            }
    }
    }
}