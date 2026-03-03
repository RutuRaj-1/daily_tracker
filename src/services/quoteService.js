// Curated motivational quotes for daily display
const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It is not enough to be busy. The question is: What are we busy about?", author: "Henry David Thoreau" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Productivity is never an accident. It is always the result of commitment to excellence.", author: "Paul J. Meyer" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "Well done is better than well said.", author: "Benjamin Franklin" },
    { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
    { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { text: "Your limitation — it's only your imagination.", author: "Unknown" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "Dream it. Wish it. Do it.", author: "Unknown" },
    { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
    { text: "Little things make big days.", author: "Unknown" },
    { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { text: "Hustle in silence. Let success make the noise.", author: "Unknown" },
    { text: "Work hard in silence, let your success be the noise.", author: "Frank Ocean" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Don't limit your challenges. Challenge your limits.", author: "Unknown" },
    { text: "Dream bigger. Do bigger.", author: "Unknown" },
    { text: "What seems impossible today will one day become your warm-up.", author: "Unknown" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Continuous improvement is better than delayed perfection.", author: "Mark Twain" },
    { text: "Stop doubting yourself. Work hard, and make it happen.", author: "Unknown" },
    { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
    { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
    { text: "Plans are nothing; planning is everything.", author: "Dwight D. Eisenhower" },
    { text: "Amateurs sit and wait for inspiration; the rest of us just get up and go to work.", author: "Stephen King" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "If you spend too much time thinking about a thing, you'll never get it done.", author: "Bruce Lee" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
    { text: "Be not afraid of going slowly, be afraid only of standing still.", author: "Chinese Proverb" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "One day or day one. You decide.", author: "Unknown" },
    { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale" },
    { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "You can't cross the sea merely by standing and staring at the water.", author: "Rabindranath Tagore" },
    { text: "People who are crazy enough to think they can change the world, are the ones who do.", author: "Steve Jobs" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss" },
    { text: "Perfection is the enemy of progress.", author: "Winston Churchill" },
    { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
];

export const quoteService = {
    getQuoteOfTheDay: () => {
        // Deterministic selection based on date so all users see the same quote each day
        const today = new Date();
        const dayOfYear = Math.floor(
            (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
        );
        const index = dayOfYear % quotes.length;
        return quotes[index];
    },

    getRandomQuote: () => {
        const index = Math.floor(Math.random() * quotes.length);
        return quotes[index];
    },

    getAllQuotes: () => quotes,
};

export default quoteService;
