import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAutosuggest } from './useAutosuggest';

// 1. Mock the entire @what3words/api module
const { mockSetApiKey, mockAutosuggest, mockIsPossible3wa } = vi.hoisted(() => ({
 mockAutosuggest : vi.fn(),
 mockIsPossible3wa : vi.fn(),
 mockSetApiKey : vi.fn()
}))

vi.mock('@what3words/api', async () => {
  const actual = await vi.importActual('@what3words/api');
  return {
    ...actual,
    default: vi.fn(() => ({
      setApiKey: mockSetApiKey,
      autosuggest: mockAutosuggest,
      clients: {
        autosuggest: {
          isPossible3wa: mockIsPossible3wa,
        },
      },
    })),
    axiosTransport: vi.fn(),
  };
});

describe('useAutosuggest', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return suggestions for a valid 3-word address', async () => {
    const mockSuggestions = [{ words: 'filled.count.soap', rank: 1 }];
    mockIsPossible3wa.mockReturnValue(true);
    mockAutosuggest.mockResolvedValue({ suggestions: mockSuggestions });

    const { result } = renderHook(() => useAutosuggest('filled.count.soap', 'YOUR_API_KEY'));

    // Fast-forward the 300ms debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Wait for the async state updates
    await act(async () => {
      await Promise.resolve(); 
    });

    expect(result.current.suggestions).toEqual(mockSuggestions);
    expect(result.current.error).toBeNull();
  });

  it('should set an error if the input is not a possible 3wa', async () => {
    mockIsPossible3wa.mockReturnValue(false);

    const { result } = renderHook(() => useAutosuggest('not-a-3wa', 'API_KEY'));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.error).toBe('Input is not a valid 3-word address.');
    expect(result.current.suggestions).toEqual([]);
  });

  it('should handle API errors gracefully', async () => {
    mockIsPossible3wa.mockReturnValue(true);
    mockAutosuggest.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAutosuggest('filled.count.soap', 'API_KEY'));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe('Failed to fetch suggestions. Please try again.');
    expect(result.current.isLoading).toBe(false);
  });
});
