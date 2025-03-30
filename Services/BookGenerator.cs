using Bogus;
using BookStoreTesting.Models;
using System;
using System.Collections.Generic;

namespace BookStoreTesting.Services;

public class BookGenerator
{
    private readonly int _baseSeed;
    private readonly RegionData _regionData;

    public BookGenerator(string region = "en-US", int seed = 123456)
    {
        _baseSeed = seed;
        var locale = MapToBogusLocale(region);
        _regionData = new RegionData(locale);
    }

    public List<Book> GenerateBooks(int count, int page, double avgLikes, double avgReviews)
    {
        var books = new List<Book>();
        var masterRandom = new Random(_baseSeed + page);

        for (int i = 0; i < count; i++)
        {
            int bookSeed = masterRandom.Next();
            var bookRandom = new Random(bookSeed);

            Randomizer.Seed = new Random(bookSeed);
            var book = new Faker<Book>()
                .RuleFor(b => b.ISBN, f => f.Commerce.Ean13())
                .RuleFor(b => b.Title, _ => _regionData.GenerateTitle())
                .RuleFor(b => b.Author, _ => _regionData.GenerateAuthor())
                .RuleFor(b => b.Publisher, _ => _regionData.GeneratePublisher())
                .RuleFor(b => b.CoverImageUrl, (_, b) => GenerateCoverUrl(b.Index, b.Title, b.Author))
                .Generate();

            book.Index = (page - 1) * count + i + 1;
                
            book.LikeCount = GenerateCount(bookRandom, avgLikes);
                
            book.ReviewCount = GenerateCount(bookRandom, avgReviews);
            book.Reviews = GenerateReviews(bookSeed, book.ReviewCount);

            books.Add(book);
        }

        return books;
    }

    private int GenerateCount(Random random, double average)
    {
        if (average <= 0)
            return 0;

        if (average < 1.0)
            return random.NextDouble() < average ? 1 : 0;

        if (Math.Abs(average % 1) < double.Epsilon)
            return (int)average;

        int baseCount = (int)Math.Floor(average);
        double fractionalPart = average % 1;
        return baseCount + (random.NextDouble() < fractionalPart ? 1 : 0);
    }

    private List<string> GenerateReviews(int bookSeed, int count)
    {
        if (count <= 0)
            return new List<string>();

        var reviews = new List<string>();
        for (int i = 0; i < count; i++)
        {
            Randomizer.Seed = new Random(bookSeed + 1 + i);
            reviews.Add($"{_regionData.GenerateReviewText()} —{_regionData.GenerateReviewerName()}");
        }
        return reviews;
    }

    private string GenerateCoverUrl(int index, string title, string author)
    {
        return $"https://fakeimg.pl/250x350/?text={Uri.EscapeDataString($"{title}\n{author}")}";
    }
        
    private string MapToBogusLocale(string region)
    {
        return region switch
        {
            "en-US" => "en_US",
            "fr-FR" => "fr",
            "de-DE" => "de",
            _ => "en_US"
        };
    }
}