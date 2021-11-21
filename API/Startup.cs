using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;
using MediatR;
using Application.Activities;
using Application.Core;
using FluentValidation.AspNetCore;
using API.Middleware;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Application.Profiles;

namespace API
{
  public class Startup
  {
    private readonly IConfiguration _config;
    public Startup(IConfiguration config)
    {
      _config = config;
    }


    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {

      services.AddControllers(opt =>
      {
        // every request will require authorization unless we tell the controller not required
        var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
        opt.Filters.Add(new AuthorizeFilter(policy));
      })
        .AddFluentValidation(config => 
        {
          config.RegisterValidatorsFromAssemblyContaining<Create>();
        });

      services.AddApplicationServices(_config);

      services.AddIdentityServices(_config);

    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
      app.UseMiddleware<ExceptionMiddleware>();

      app.UseXContentTypeOptions();
      app.UseReferrerPolicy(opt => opt.NoReferrer());
      app.UseXXssProtection(opt => opt.EnabledWithBlockMode());
      app.UseXfo(opt => opt.Deny());
      // app.UseCspReportOnly(opt => opt
      app.UseCsp(opt => opt
        .BlockAllMixedContent()
        .StyleSources(s => s.Self()
          .CustomSources(
            "https://fonts.googleapis.com", 
            "sha256-yChqzBduCCi4o4xdbXRXh4U/t1rP4UUUMJt+rB+ylUI="
          )
        )
        .FontSources(s => s.Self()
          .CustomSources("https://fonts.gstatic.com", "data:")
        )
        .FormActions(s => s.Self())
        .FrameAncestors(s => s.Self())
        .ImageSources(s => s.Self()
          .CustomSources(
            "https://res.cloudinary.com", 
            "https://www.facebook.com",
            "https://scontent.fsyd3-1.fna.fbcdn.net",
            "https://scontent-iad3-1.xx.fbcdn.net"
          )
        )
        .ScriptSources(s => s.Self()
          .CustomSources(
            "sha256-/oMyCnu+AeIBSaayhp5ao3aqH7iB/i0qbZ9lPRLB7Og=",
            "https://connect.facebook.net",
            "sha256-U/Q0S1XsbhTX4bq03uFoRv/xl8x/9Dh0dCFy5bxFj6o=",
            "https://fonts.googleapis.com/"
          )
        )
      );

      if (!env.IsDevelopment()) 
      {
        app.Use(async (ctx, next) => 
        {
          ctx.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000");
          await next.Invoke();
        });
      }
      
      if (env.IsDevelopment())
      {
        app.UseSwagger();
        app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1"));
      }

      // app.UseHttpsRedirection();

      app.UseHttpsRedirection();
      app.UseRouting();

      app.UseDefaultFiles();
      app.UseStaticFiles();

      app.UseCors("CorsPolicy");

      app.UseAuthentication(); // this has be run before app.UseAuthorization

      app.UseAuthorization();

      app.UseEndpoints(endpoints =>
      {
        endpoints.MapControllers();
        endpoints.MapHub<SignalR.ChatHub>("/chat");
        endpoints.MapFallbackToController("Index", "Fallback");
      });
    }
  }
}
