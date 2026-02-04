import React, { useState } from 'react';
import { useAutosuggest, type Suggestion } from '../../hooks/useAutosuggest';
import { DropdownItem } from './DropdownItem';

interface AutosuggestProps {
  onSelect: (value: string) => void;
  placeholder?: string;
}

export const Autosuggest = ({
  onSelect,
  placeholder = 'Search...',
} : AutosuggestProps) => {
  const [input, setInput] = useState('');
  const { suggestions, isLoading } = useAutosuggest(input);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (suggestion: Suggestion) => {
    setInput(suggestion.words);
    onSelect(suggestion.words);
    setIsOpen(false);
  };

  return (
    <div className="autosuggest">
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className='border rounded border-amber-50 p-1.5' 
      />
      {isOpen && (
        <div className="dropdown">
          {isLoading && <p>Loading...</p>}
          {!isLoading && suggestions.map((suggestion, index) => (
            <DropdownItem
              key={index}
              label={suggestion.words }
              onClick={() => handleSelect(suggestion)}
            />
          ))}
          {!isLoading && suggestions.length === 0 && <p>No results</p>}
        </div>
      )}
    </div>
  );
};