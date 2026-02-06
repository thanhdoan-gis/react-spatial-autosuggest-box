import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Autosuggest from './Autosuggest';
import what3words, * as w3wModule from '@what3words/api';

// 1. Mock the entire @what3words/api module
const { mockSetApiKey, mockAutosuggest, mockIsPossible3wa } = vi.hoisted(() => ({
  mockAutosuggest: vi.fn(),
  mockIsPossible3wa: vi.fn(),
  mockSetApiKey: vi.fn()
}))

vi.mock('@what3words/api', async (importOriginal) => {
  const actual = await importOriginal<typeof w3wModule>();
  return {
    ...actual,
    // Intercept the creation function to return our own spy object
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
  }

});

// Capture the mock instance to verify calls
const apiInstance = what3words();

describe('Autosuggest Component (Dynamic API Key), API key change', () => {
  const mockApiKey = 'test-api-key-123';
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock response
    (apiInstance.autosuggest as any).mockResolvedValue({ suggestions: [] });
  });

  it('should initialize the SDK using the provided apiKey prop', () => {
    render(<Autosuggest apiKey={mockApiKey} onSelect={onSelect} />);

    // Verify setApiKey was called with the prop value
    expect(apiInstance.setApiKey).toHaveBeenCalledWith(mockApiKey);
  });

  it('should update the SDK configuration when the apiKey prop changes', () => {
    const { rerender } = render(<Autosuggest apiKey={mockApiKey} onSelect={onSelect} />);
    expect(apiInstance.setApiKey).toHaveBeenCalledWith(mockApiKey);

    const newKey = 'new-api-key-456';
    rerender(<Autosuggest apiKey={newKey} onSelect={onSelect} />);

    // Verify the SDK re-initializes with the new key
    expect(apiInstance.setApiKey).toHaveBeenCalledWith(newKey);
  });
})

describe('Autosuggest Component (Dynamic API Key) behavior', () => {
  const mockApiKey = 'test-api-key-123';
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock response
    (apiInstance.autosuggest as any).mockResolvedValue({ suggestions: [] });
  });

  it('should trigger the autosuggest API call when user provides valid input', async () => {
    const user = userEvent.setup();
    (apiInstance.autosuggest as any).mockResolvedValue({
      suggestions: [{ words: 'filled.count.soap', nearestPlace: 'London' }]
    });
    (apiInstance.clients.autosuggest.isPossible3wa as any).mockResolvedValue(true);


    render(<Autosuggest apiKey={mockApiKey} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    // Simulate typing
    await user.type(input, 'filled.count.s');

    // Verify debounce and API call (checking the input parameter)
    await waitFor(() => {
      expect(apiInstance.autosuggest).toHaveBeenCalledWith(
        expect.objectContaining({ input: 'filled.count.s' })
      );
    }, { timeout: 1000 }); // Account for debounce time

    const suggestion = await screen.findByText(/filled.count.soap/i);
    expect(suggestion).toBeInTheDocument();
  });

  it('should display an error message when the API request fails', async () => {
    const user = userEvent.setup();
    (apiInstance.autosuggest as any).mockRejectedValue(new Error('Network Error'));

    render(<Autosuggest apiKey={mockApiKey} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    await user.type(input, 'test.test.test');

    const errorMessage = await screen.findByText(/Failed to fetch suggestions/i);
    expect(errorMessage).toBeInTheDocument();
  });
})

describe('Autosuggest Keyboard Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock response
    (apiInstance.autosuggest as any).mockResolvedValue({ suggestions: [] });
  });

  it('allows navigating suggestions using arrow keys and Enter', async () => {

    (apiInstance.autosuggest as any).mockResolvedValue({
      suggestions: [
        { words: 'filled.count.soap', nearestPlace: 'London' },
        { words: 'filled.count.sup', nearestPlace: 'London' }
      ]
    });
    (apiInstance.clients.autosuggest.isPossible3wa as any).mockResolvedValue(true);

    const onSelect = vi.fn();
    render(<Autosuggest apiKey='mockKey' onSelect={onSelect} debounceMs={0} />);
    const user = userEvent.setup();
    const input = screen.getByRole('combobox');

    // 1. Type to trigger suggestions (Mock API response here)
    await user.type(input, 'filled.count.soap');

    // 2. Wait for suggestions to appear
    await screen.findByRole('listbox');
    const options = await screen.getAllByRole('option');

    // 3. Press ArrowDown twice
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');

    // 4. Verify aria-activedescendant matches the second option
    expect(input).toHaveAttribute('aria-activedescendant', options[1].id);
    expect(options[1]).toHaveAttribute('aria-selected', 'true');

    // 5. Press Enter to select
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(expect.stringContaining('filled.count.sup'));
  });
});



