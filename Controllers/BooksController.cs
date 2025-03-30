using BookStoreTesting.Models;
using Microsoft.AspNetCore.Mvc;
using BookStoreTesting.Services;

namespace BookStoreTesting.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController(ILogger<BooksController> logger) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Book>> GetBooks(
        [FromQuery] string region = "en-US",
        [FromQuery] int seed = 0,
        [FromQuery] double likes = 0,
        [FromQuery] double reviews = 0,
        [FromQuery] int page = 1,
        [FromQuery] int count = 20)
    {
        try
        {
            var generator = new BookGenerator(region, seed);
            var books = generator.GenerateBooks(count, page, likes, reviews);
            return Ok(books);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error generating books");
            return StatusCode(500, "Error generating book data");
        }
    }
}