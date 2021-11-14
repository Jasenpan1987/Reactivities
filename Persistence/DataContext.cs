using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace Persistence
{
  public class DataContext : IdentityDbContext<AppUser>
  {
    public DataContext(DbContextOptions options) : base(options)
    {
    }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<ActivityAttendee> ActivityAttendees { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<UserFollowing> UserFollowings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
      base.OnModelCreating(builder);

      builder.Entity<ActivityAttendee>(x => x.HasKey(aa => new {aa.AppUserId, aa.ActivityId}));

      builder.Entity<ActivityAttendee>()
        .HasOne(u => u.AppUser)
        .WithMany(a => a.Activities)
        .HasForeignKey(aa => aa.AppUserId);

      builder.Entity<ActivityAttendee>()
        .HasOne(a => a.Activity)
        .WithMany(u => u.Attendees)
        .HasForeignKey(aa => aa.ActivityId);

      builder.Entity<Comment>()
        .HasOne(a => a.Activity)
        .WithMany(c => c.Comments)
        .OnDelete(DeleteBehavior.Cascade);

      builder.Entity<UserFollowing>(b => 
      {
        b.HasKey(k => new {k.ObserverId, k.TargetId}); // config compound primary key

        b.HasOne(userFollowing => userFollowing.Observer) 
          .WithMany(appUser => appUser.Followings)
          .HasForeignKey(userFollowing => userFollowing.ObserverId)
          .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(userFollowing => userFollowing.Target) 
          .WithMany(appUser => appUser.Followers)
          .HasForeignKey(userFollowing => userFollowing.TargetId)
          .OnDelete(DeleteBehavior.Cascade);
      });
    }
  }
}