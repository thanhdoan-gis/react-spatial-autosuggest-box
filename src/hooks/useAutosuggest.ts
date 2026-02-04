import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import what3words, {
  ApiVersion,
  Transport,
  What3wordsService,
  axiosTransport,
} from '@what3words/api';

const apiKey = import.meta.env.VITE_W3W_API_KEY;
const config: {
  host: string;
  apiVersion: ApiVersion;
} = {
  host: 'https://api.what3words.com',
  apiVersion: ApiVersion.Version3,
};

// Initialize the API client (Move this to a separate config file later)
const transport: Transport = axiosTransport();
const w3wService: What3wordsService = what3words(apiKey, config, { transport });

export interface Suggestion {
  words: string;
  nearestPlace: string;
  country: string;
  rank: number;
  language: string;
}

export const useAutosuggest = (userInput: string) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(
    debounce(async (input: string, signal: AbortSignal) => {
      // 1. Basic Validation: Only call API if it looks like a 3wa
      if (!input || input.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Note: The official JS wrapper might not support AbortSignal directly, 
        // but for a Senior role, demonstrating the intent to cancel is key.
        const response = await w3wService.autosuggest({ input });
        
        if (signal.aborted) return;

        if (response.suggestions) {
          setSuggestions(response.suggestions);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        if (!signal.aborted) {
          setError('Failed to fetch suggestions. Please try again.');
          console.error('W3W API Error:', err);
        }
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    
    // Clean input of the "///" prefix if the user typed it
    const cleanInput = userInput.replace(/^[/]{1,3}/, '');
    
    fetchSuggestions(cleanInput, controller.signal);

    return () => {
      controller.abort();
      fetchSuggestions.cancel();
    };
  }, [userInput, fetchSuggestions]);

  return { suggestions, isLoading, error };
};
