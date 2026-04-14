import React, { useState } from 'react';
import { useAutosuggest } from '../../hooks/useAutosuggest';
import type { AutosuggestSuggestion } from '@what3words/api';

interface AutosuggestProps {
  onSelect: (value: string) => void;
  placeholder?: string;
  apiKey: string;
  debounceMs?: number
}

export default function Autosuggest({
  onSelect,
  placeholder = 'e.g. filled.count.soap',
  apiKey,
  debounceMs
}: AutosuggestProps) {
  const [input, setInput] = useState('');
  const { suggestions, isLoading, error } = useAutosuggest(input, apiKey, debounceMs);
  const [isOpen, setIsOpen] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setIsValidated(false);
    setIsOpen(true);
  };

  const onSelectAddress = (suggestion: AutosuggestSuggestion) => {
    setInput(suggestion.words);
    onSelect(suggestion.words);
    setIsValidated(true);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault(); // Prevent cursor moving in input
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          onSelectAddress(suggestions[selectedIndex]);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };
  const stateIcon = () => {
    if (isValidated) {
      return <span className={`w-5 h-5 bg-center bg-no-repeat bg-[url(./check.svg)]`} data-testid="confirmation-icon"></span>
    } else if (isLoading) {
      return <span className={`w-5 h-5 rounded-full border border-[#000_transparent_#000_transparent] animate-spin`}></span>

    }
  }
  return (
    <div className="autosuggest relative w-full max-w-md text-[#0a3049]">
      <div className="input-wrapper before:content-['///'] rounded before:font-bold border-2 focus-within:border-[#0a3049] p-1.5 text-[16px] w-full bg-white inline-flex">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className='focus:outline-none w-full bg-transparent font-bold'
          role='combobox'
          aria-autocomplete='list'
          aria-expanded={isOpen}
          aria-controls='results-list'
          aria-activedescendant={selectedIndex >= 0 ? `option-${selectedIndex}` : undefined}
        />
        {stateIcon()}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white shadow-lg overflow-hidden"
          role='listbox'
          id='results-list'>
          {!isLoading && suggestions.map((suggestion, index) => (
            <li
              key={index}
              role='option'
              id={`option-${index}`}
              onClick={() => onSelectAddress(suggestion)}
              aria-selected={index === selectedIndex}
              className={` cursor-pointpx-4 py-2er flex flex-col not-last:border-b not-last:border-[#c2c2c2] ${index === selectedIndex ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
            >
              <span className="font-bold text-blue-950"><span className='text-red-800'>///</span>{suggestion.words}</span>
              <span className="text-xs text-[#525252]">near {suggestion.nearestPlace}</span>
            </li>
          ))}
          {!isLoading && suggestions.length === 0 && !error && <p className="text-red-500 p-1.5">No valid what3words address found</p>}
          {error && <p className="text-red-500 p-1.5">{error}</p>}
        </ul>
      )}
    </div>
  );
};