using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ProfilesController : BaseAPIController
    {
        [HttpGet("{userName}")]
        public async Task<IActionResult> GetProfile(string userName)
        {
            return HandleResult(await Mediator.Send(new Details.Query
            {
                Username = userName
            }));
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody]Update.Command command)
        {
            return HandleResult(await Mediator.Send(command));
        }

        [HttpGet("{userName}/activities")]
        public async Task<IActionResult> GetActivities([FromRoute] string username, [FromQuery] string predicate)
        {
            System.Console.WriteLine("Hi========");
            return HandleResult(await Mediator.Send(new ListActivities.Query {
                Username = username,
                Predicate = predicate
            }));
        }
    }
}