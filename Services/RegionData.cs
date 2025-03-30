using Bogus;

namespace BookStoreTesting.Services;

public class RegionData
{
    private readonly Faker _faker;
    private readonly string _locale;

    public RegionData(string bogusLocale)
    {
        _faker = new Faker(bogusLocale);
        _locale = bogusLocale;
    }

    public string GenerateTitle()
    {
        string[] patterns = GetTitlePatternsForLocale();
        string pattern = _faker.PickRandom(patterns);
        
        return string.Format(
            pattern,
            _faker.Lorem.Word().CapitalizeFirst(),
            _faker.Lorem.Word().CapitalizeFirst()
        );
    }

    private string[] GetTitlePatternsForLocale()
    {
        return _locale switch
        {
            "fr" => new[]
            {
                "Le {0} et le {1}",
                "La {0} de {1}",
                "{0} : L'histoire de {1}",
                "Les {0} oubliés",
                "Un {0} pour {1}"
            },
            "de" => new[]
            {
                "Der {0} von {1}",
                "Die {0} und die {1}",
                "{0}: Ein {1}-Roman",
                "Das Geheimnis des {0}",
                "{0} und {1}"
            },
            _ => new[]
            {
                "The {0} of {1}",
                "{0} and {1}",
                "A {0} for {1}",
                "{0}: The {1} Chronicles",
                "The Secret of {0}"
            }
        };
    }


    public string GenerateAuthor()
    {
        return _faker.Random.Bool(0.3f) 
            ? $"{_faker.Name.FullName()} & {_faker.Name.FullName()}" 
            : _faker.Name.FullName();
    }

    public string GeneratePublisher()
    {
        return $"{_faker.Name.LastName()} {_faker.Company.CompanySuffix()}";
    }

    public string GenerateReviewerName()
    {
        return _faker.Name.FullName();
    }

    public string GenerateReviewText()
    {
        string[] patterns = GetReviewPatternsForLocale();
        string pattern = _faker.PickRandom(patterns);
        
        return string.Format(
            pattern,
            _faker.Lorem.Word(),
            _faker.Lorem.Word(),
            _faker.Random.Int(1, 5)
        );
    }

    private string[] GetReviewPatternsForLocale()
    {
        return _locale switch
        {
            "fr" => new[]
            {
                "Un chef-d'œuvre ! J'ai adoré {0}.",
                "{0} est incroyable, mais {1} m'a déçu.",
                "Je donne {2} étoiles pour {0}.",
                "Lecture obligatoire pour les fans de {0}.",
                "J'ai dévoré ce livre en une nuit."
            },
            "de" => new[]
            {
                "Ein Meisterwerk! {0} hat mich begeistert.",
                "{0} war gut, aber {1} war enttäuschend.",
                "Ich vergebe {2} Sterne für {0}.",
                "Pflichtlektüre für {0}-Fans.",
                "Ich konnte das Buch nicht weglegen."
            },
            _ => new[]
            {
                "A masterpiece! I loved {0}.",
                "{0} was great, but {1} disappointed me.",
                "I give {2} stars for {0}.",
                "Must-read for fans of {0}.",
                "I couldn't put this book down."
            }
        };
    }
}