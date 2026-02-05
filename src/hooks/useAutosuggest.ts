import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import what3words, {
  ApiVersion,
  Transport,
  What3wordsService,
  axiosTransport,
  AutosuggestSuggestion
} from '@what3words/api';


const config: {
  host: string;
  apiVersion: ApiVersion;
} = {
  host: 'https://api.what3words.com',
  apiVersion: ApiVersion.Version3,
};

// Initialize the API client

  const transport: Transport = axiosTransport();
  const w3wServiceClient: What3wordsService = what3words('', config, { transport });

export const useAutosuggest = (userInput: string, apiKey: string) => {
  w3wServiceClient.setApiKey(apiKey);
  w3wServiceClient.setConfig(config);

  const [suggestions, setSuggestions] = useState<AutosuggestSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(
    debounce(async (input: string, signal: AbortSignal) => {
      // 1. Basic Validation: Only call API if it looks like a 3wa
      if (!input || input.length < 3) {
        setSuggestions([]);
        return;
      }
      if (!w3wServiceClient.clients.autosuggest.isPossible3wa(input)) {
        setSuggestions([])
        setError("Input is not a valid 3-word address.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Note: The official JS wrapper might not support AbortSignal directly
        const response = await w3wServiceClient.autosuggest({ input });

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
    [w3wServiceClient]
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
