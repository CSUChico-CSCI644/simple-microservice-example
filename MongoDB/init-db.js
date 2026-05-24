db = db.getSiblingDB("quote_db");
db.quote_tb.createIndex({ "id": 1 }, { unique: true });

var quotes = [
    {
        "id": 1,
        "quote": "Nothing is impossible, the word itself says \"I'm possible\"!",
        "author": "Audrey Hepburn"
    },
    {
        "id": 2,
        "quote": "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.",
        "author": "Maya Angelou"
    },
    {
        "id": 3,
        "quote": "Whether you think you can or you think you can't, you're right.",
        "author": "Henry Ford"
    },
    {
        "id": 4,
        "quote": "Perfection is not attainable, but if we chase perfection we can catch excellence.",
        "author": "Vince Lombardi"
    },
    {
        "id": 5,
        "quote": "Life is 10% what happens to me and 90% of how I react to it.",
        "author": "Charles Swindoll"
    },
    {
        "id": 6,
        "quote": "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.",
        "author": "Oprah Winfrey"
    },
    {
        "id": 7,
        "quote": "Remember no one can make you feel inferior without your consent.",
        "author": "Eleanor Roosevelt"
    },
    {
        "id": 8,
        "quote": "I can't change the direction of the wind, but I can adjust my sails to always reach my destination.",
        "author": "Jimmy Dean"
    },
    {
        "id": 9,
        "quote": "Believe you can and you're halfway there.",
        "author": "Theodore Roosevelt"
    },
    {
        "id": 10,
        "quote": "To handle yourself, use your head; to handle others, use your heart.",
        "author": "Eleanor Roosevelt"
    },
    {
        "id": 11,
        "quote": "Too many of us are not living our dreams because we are living our fears.",
        "author": "Les Brown"
    },
    {
        "id": 12,
        "quote": "Do or do not. There is no try.",
        "author": "Yoda"
    },
    {
        "id": 13,
        "quote": "Whatever the mind of man can conceive and believe, it can achieve.",
        "author": "Napoleon Hill"
    },
    {
        "id": 14,
        "quote": "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do, so throw off the bowlines, sail away from safe harbor, catch the trade winds in your sails. Explore, Dream, Discover.",
        "author": "Mark Twain"
    },
    {
        "id": 15,
        "quote": "I've missed more than 9000 shots in my career. I've lost almost 300 games. 26 times I've been trusted to take the game winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed.",
        "author": "Michael Jordan"
    },
    {
        "id": 16,
        "quote": "Strive not to be a success, but rather to be of value.",
        "author": "Albert Einstein"
    },
    {
        "id": 17,
        "quote": "I am not a product of my circumstances. I am a product of my decisions.",
        "author": "Stephen Covey"
    },
    {
        "id": 18,
        "quote": "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it.",
        "author": "Henry Ford"
    },
    {
        "id": 19,
        "quote": "The most common way people give up their power is by thinking they don't have any.",
        "author": "Alice Walker"
    },
    {
        "id": 20,
        "quote": "The most difficult thing is the decision to act, the rest is merely tenacity.",
        "author": "Amelia Earhart"
    },
    {
        "id": 21,
        "quote": "It is during our darkest moments that we must focus to see the light.",
        "author": "Aristotle Onassis"
    },
    {
        "id": 22,
        "quote": "Don't judge each day by the harvest you reap but by the seeds that you plant.",
        "author": "Robert Louis Stevenson"
    },
    {
        "id": 23,
        "quote": "The only way to do great work is to love what you do.",
        "author": "Steve Jobs"
    },
    {
        "id": 24,
        "quote": "Change your thoughts and you change your world.",
        "author": "Norman Vincent Peale"
    },
    {
        "id": 25,
        "quote": "The question isn't who is going to let me; it's who is going to stop me.",
        "author": "Ayn Rand"
    },
    {
        "id": 26,
        "quote": "If you hear a voice within you say \"you cannot paint,\" then by all means paint and that voice will be silenced.",
        "author": "Vincent Van Gogh"
    },
    {
        "id": 27,
        "quote": "Build your own dreams, or someone else will hire you to build theirs.",
        "author": "Farrah Gray"
    },
    {
        "id": 28,
        "quote": "Remember that not getting what you want is sometimes a wonderful stroke of luck.",
        "author": "Dalai Lama"
    },
    {
        "id": 29,
        "quote": "You can't use up creativity. The more you use, the more you have.",
        "author": "Maya Angelou"
    },
    {
        "id": 30,
        "quote": "I have learned over the years that when one's mind is made up, this diminishes fear.",
        "author": "Rosa Parks"
    },
    {
        "id": 31,
        "quote": "I would rather die of passion than of boredom.",
        "author": "Vincent van Gogh"
    },
    {
        "id": 32,
        "quote": "A truly rich man is one whose children run into his arms when his hands are empty.",
        "author": "Unknown"
    },
    {
        "id": 33,
        "quote": "A person who never made a mistake never tried anything new.",
        "author": "Albert Einstein"
    },
    {
        "id": 34,
        "quote": "What's money? A man is a success if he gets up in the morning and goes to bed at night and in between does what he wants to do.",
        "author": "Bob Dylan"
    },
    {
        "id": 35,
        "quote": "I have been impressed with the urgency of doing. Knowing is not enough; we must apply. Being willing is not enough; we must do.",
        "author": "Leonardo da Vinci"
    },
    {
        "id": 36,
        "quote": "If you want to lift yourself up, lift up someone else.",
        "author": "Booker T. Washington"
    },
    {
        "id": 37,
        "quote": "Limitations live only in our minds. But if we use our imaginations, our possibilities become limitless.",
        "author": "Jamie Paolinetti"
    },
    {
        "id": 38,
        "quote": "If you're offered a seat on a rocket ship, don't ask what seat! Just get on.",
        "author": "Sheryl Sandberg"
    },
    {
        "id": 39,
        "quote": "Certain things catch your eye, but pursue only those that capture the heart.",
        "author": "Ancient Indian Proverb"
    },
    {
        "id": 40,
        "quote": "When one door of happiness closes, another opens, but often we look so long at the closed door that we do not see the one that has been opened for us.",
        "author": "Helen Keller"
    },
    {
        "id": 41,
        "quote": "Everything has beauty, but not everyone can see.",
        "author": "Confucius"
    },
    {
        "id": 42,
        "quote": "How wonderful it is that nobody need wait a single moment before starting to improve the world.",
        "author": "Anne Frank"
    },
    {
        "id": 43,
        "quote": "When I was 5 years old, my mother always told me that happiness was the key to life. When I went to school, they asked me what I wanted to be when I grew up. I wrote down \"happy\". They told me I didn't understand the assignment, and I told them they didn't understand life.",
        "author": "John Lennon"
    },
    {
        "id": 44,
        "quote": "The only person you are destined to become is the person you decide to be.",
        "author": "Ralph Waldo Emerson"
    },
    {
        "id": 45,
        "quote": "We can't help everyone, but everyone can help someone.",
        "author": "Ronald Reagan"
    },
    {
        "id": 46,
        "quote": "Everything you've ever wanted is on the other side of fear.",
        "author": "George Addair"
    },
    {
        "id": 47,
        "quote": "We can easily forgive a child who is afraid of the dark; the real tragedy of life is when men are afraid of the light.",
        "author": "Plato"
    },
    {
        "id": 48,
        "quote": "Nothing will work unless you do.",
        "author": "Maya Angelou"
    },
    {
        "id": 49,
        "quote": "I alone cannot change the world, but I can cast a stone across the water to create many ripples.",
        "author": "Mother Teresa"
    },
    {
        "id": 50,
        "quote": "What we achieve inwardly will change outer reality.",
        "author": "Plutarch"
    }
];

quotes.forEach(function(quote) {
    db.quote_tb.updateOne(
        { "id": quote.id },
        { "$set": quote },
        { "upsert": true }
    );
});
