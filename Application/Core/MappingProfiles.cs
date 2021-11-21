using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Activities;
using Application.Comments;
using AutoMapper;
using Domain;

namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            string currentUsername = null;

            CreateMap<Activity, Activity>();

            CreateMap<Activity, ActivityDTO>()
                .ForMember(
                    destination => destination.HostUsername, 
                    opt => opt.MapFrom(
                        source => source.Attendees.FirstOrDefault(x => x.IsHost)
                            .AppUser.UserName));

            CreateMap<Activity, Profiles.UserActivityDTO>()
                .ForMember(
                    destination => destination.HostUsername,
                    opt => opt.MapFrom(
                        source => source.Attendees.FirstOrDefault(x => x.IsHost)
                            .AppUser.UserName));

            CreateMap<AppUser, Profiles.Profile>()
                .ForMember(
                    destination => destination.Image,
                    opt => opt.MapFrom(s => s.Photos.FirstOrDefault(x => x.IsMain).Url)
                )
                .ForMember(
                    destination => destination.FollowerCount,
                    opt => opt.MapFrom(s => s.Followers.Count)
                )
                .ForMember(
                    destination => destination.FollowingCount,
                    opt => opt.MapFrom(s => s.Followings.Count)
                )
                .ForMember(
                    destination => destination.Following,
                    opt => opt.MapFrom(s => s.Followers.Any(x => x.Observer.UserName == currentUsername))
                );
                

            CreateMap<ActivityAttendee, AttendeeDTO>()
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
                )
                .ForMember(
                    destination => destination.Image,
                    opt => opt.MapFrom(
                        source => source.AppUser.Photos.FirstOrDefault(x => x.IsMain).Url
                    )
                )
                .ForMember(
                    destination => destination.FollowerCount,
                    opt => opt.MapFrom(s => s.AppUser.Followers.Count)
                )
                .ForMember(
                    destination => destination.FollowingCount,
                    opt => opt.MapFrom(s => s.AppUser.Followings.Count)
                )
                .ForMember(
                    destination => destination.Following,
                    opt => opt.MapFrom(s => s.AppUser.Followers.Any(x => x.Observer.UserName == currentUsername))
                );

                CreateMap<Comment, CommentDTO>()
                    .ForMember(
                        destination => destination.DisplayName,
                        opt => opt.MapFrom(
                            source => source.Author.DisplayName
                        )
                    )
                    .ForMember(
                        destination => destination.Username,
                        opt => opt.MapFrom(
                            source => source.Author.UserName
                        )
                    )
                    .ForMember(
                        destination => destination.Image,
                        opt => opt.MapFrom(
                            source => source.Author.Photos.FirstOrDefault(x => x.IsMain).Url
                        )
                    );
                
        }
    }
}