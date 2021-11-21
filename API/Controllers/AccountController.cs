using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs;
using API.Services;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace API.Controllers
{
  [AllowAnonymous]
  [ApiController]
  [Route("api/[controller]")]
  public class AccountController : ControllerBase
  {
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly TokenService _tokenService;
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;

    public AccountController(
        UserManager<AppUser> userManager, 
        SignInManager<AppUser> signInManager,
        TokenService tokenService,
        IConfiguration config
    )
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _tokenService = tokenService;
        _config = config;
        _httpClient = new HttpClient
        {
            BaseAddress = new System.Uri("https://graph.facebook.com")
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDTO>> Login(LoginDTO loginTto) 
    {
        var user = await _userManager.Users
            .Include(p => p.Photos)
            .FirstOrDefaultAsync(x => x.Email == loginTto.Email);

        if (user == null) {
            return Unauthorized();
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, loginTto.Password, false);
        if (result.Succeeded) {
            return CreateUserObject(user);
        }

        return Unauthorized();
    }

    [HttpPost("Register")]
    public async Task<ActionResult<UserDTO>> Register(RegisterDTO registerDto)
    {
        if (await _userManager.Users.AnyAsync(user => user.Email == registerDto.Email)) 
        {
            ModelState.AddModelError("email", "Email taken.");
            return ValidationProblem(ModelState);
        }

        if (await _userManager.Users.AnyAsync(user => user.UserName == registerDto.Username)) 
        {
            ModelState.AddModelError("username", "User taken.");
            return ValidationProblem(ModelState);
        }

        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            UserName = registerDto.Username
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (result.Succeeded) 
        {
            return CreateUserObject(user);
        }

        return BadRequest("Unable to register user");
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<UserDTO>> GetCurrentUser()
    {
        try
        {
            var user = await _userManager.Users
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(
                    x => x.Email == User.FindFirstValue(ClaimTypes.Email)
                );
            return CreateUserObject(user);
        }
        catch (Exception ex)
        {
            System.Console.WriteLine(ex.Message);
            return Unauthorized();
        }
    }

    // [HttpPost("fbLogin")]
    // public async Task<ActionResult<UserDTO>> FacebookLogin(string accessToken)
    // {
    //     var fbVerifyKeys = _config["Facebook:AppId"] + "|" + _config["Facebook:AppSecret"];
    //     var verifyToken = await _httpClient
    //         .GetAsync($"debug_token?input_token={accessToken}&access_token={fbVerifyKeys}");
        
    //     if (!verifyToken.IsSuccessStatusCode)
    //     {
    //         return Unauthorized();
    //     }

    //     var fbUrl = $"me?access_token={accessToken}&fields=name,email,picture.width(100).height(100)";
    //     var response = await _httpClient.GetAsync(fbUrl);

    //     if (!response.IsSuccessStatusCode)
    //     {
    //         return Unauthorized();
    //     }

    //     var fbInfo = JsonConvert.DeserializeObject<dynamic>(await response.Content.ReadAsStringAsync());

    //     var username = (string) fbInfo.id;
    //     var user = await _userManager.Users.Include(user => user.Photos)
    //         .FirstOrDefaultAsync(user => user.UserName == username);

    //     if (user != null)
    //     {
    //         return CreateUserObject(user);
    //     }

    //     user = new AppUser
    //     {
    //         DisplayName = (string) fbInfo.name,
    //         Email = (string) fbInfo.email,
    //         UserName = (string) fbInfo.id,
    //         Photos = new List<Photo>
    //         {
    //             new Photo {
    //                 Id = "fb_" + (string) fbInfo.id, 
    //                 Url = (string) fbInfo.picture.data.url,
    //                 isMain = true
    //             }
    //         }
    //     }
    //     return new UserDTO();
    // }

    private UserDTO CreateUserObject(AppUser user) 
    {
        return new UserDTO
        {
            DisplayName = user.DisplayName,
            Image = user?.Photos?.FirstOrDefault(x => x.IsMain)?.Url,
            Username = user.UserName,
            Token = _tokenService.CreateToken(user)
        };
    }
  }
}