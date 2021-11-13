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

namespace Application.Comments
{
    public class List
    {
        public class Query : IRequest<Result<List<CommentDTO>>>
        {
            public Guid ActivityId {get; set;}
        }

    public class Handler : IRequestHandler<Query, Result<List<CommentDTO>>>
    {
        private readonly DataContext _dataContext;
        private readonly IMapper _mapper;
        public Handler(DataContext dataContext, IMapper mapper)
        {
            _mapper = mapper;
            _dataContext = dataContext;
        }
        public async Task<Result<List<CommentDTO>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var commnets = await _dataContext.Comments
                .Where(x => x.Activity.Id == request.ActivityId)
                .OrderByDescending(x => x.CreatedAt)
                .ProjectTo<CommentDTO>(_mapper.ConfigurationProvider)
                .ToListAsync();
            
            return Result<List<CommentDTO>>.Success(commnets);
        }
    }
  }
}