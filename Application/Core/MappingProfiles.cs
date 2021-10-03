using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Activities;
using AutoMapper;
using Domain;

namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Activity, Activity>();

            CreateMap<Activity, ActivityDTO>()
                .ForMember(
                    destination => destination.HostUsername, 
                    opt => opt.MapFrom(
                        source => source.Attendees.FirstOrDefault(x => x.IsHost)
                            .AppUser.UserName));
            CreateMap<ActivityAttendee, Profiles.Profile>()
                .ForMember(
                    destination => destination.DisplayName,
                    opt => opt.MapFrom(
                        source => source.AppUser.DisplayName
                    )
                )
                .ForMember(
                    destination => destination.Username,
                    opt => opt.MapFrom(
                        source => source.AppUser.UserName
                    )
                )
                .ForMember(
                    destination => destination.Bio,
                    opt => opt.MapFrom(
                        source => source.AppUser.Bio
                    )
                );
                
        }
    }
}