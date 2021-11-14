using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Followers;
using Application.Profiles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
    public class FollowController : BaseAPIController
    {
        [HttpPost("{TargetUsername}")]
        public async Task<IActionResult> ToggleFollowing(string targetUsername) 
        {
            return HandleResult(await Mediator.Send(new FollowToggle.Command { TargetUsername = targetUsername}));
        }

        [HttpGet("{username}")]
        public async Task<IActionResult> GetFollowData([FromRoute] string username, [FromQuery] string predicate)
        {
            return HandleResult<List<Profile>>(await Mediator.Send(new List.Query {Predicate = predicate, Username = username}));
        }
    }
}