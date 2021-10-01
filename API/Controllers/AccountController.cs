using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs;
using API.Services;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    public AccountController(
        UserManager<AppUser> userManager, 
        SignInManager<AppUser> signInManager,
        TokenService tokenService
        )
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDTO>> Login(LoginDTO loginTto) 
    {
        var user = await _userManager.FindByEmailAsync(loginTto.Email);
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
            return BadRequest("Email taken");
        }

        if (await _userManager.Users.AnyAsync(user => user.UserName == registerDto.Username)) 
        {
            return BadRequest("User taken");
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
            var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));
            return CreateUserObject(user);
        }
        catch (Exception ex)
        {
            return Unauthorized();
        }
        
    }

    private UserDTO CreateUserObject(AppUser user) 
    {
        return new UserDTO
        {
            DisplayName = user.DisplayName,
            Image = null,
            Username = user.UserName,
            Token = _tokenService.CreateToken(user)
        };
    }
  }
}