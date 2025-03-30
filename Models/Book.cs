namespace BookStoreTesting.Models;

public class Book
{
    public int Index { get; set; }
    public string ISBN { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    public string Publisher { get; set; }
    public int LikeCount { get; set; }
    public int ReviewCount { get; set; }
    public List<string> Reviews { get; set; }
    public string CoverImageUrl { get; set; }
}