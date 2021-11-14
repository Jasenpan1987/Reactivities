using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class UserFollowing
    {
        public string ObserverId { get; set; } // follower
        public AppUser Observer { get; set; }
        public string TargetId { get; set; } // followe
        public AppUser Target { get; set; }
    }
}