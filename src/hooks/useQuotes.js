import { useState, useEffect } from 'react';
import { quoteService } from '../services/quoteService';

export const useQuotes = () => {
    const [quote, setQuote] = useState({ text: '', author: '' });

    useEffect(() => {
        setQuote(quoteService.getQuoteOfTheDay());
    }, []);

    const refreshQuote = () => {
        setQuote(quoteService.getRandomQuote());
    };

    return { quote, refreshQuote };
};

export default useQuotes;
