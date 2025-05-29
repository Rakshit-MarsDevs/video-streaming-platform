import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SearchIcon } from '../assets/icons/index.tsx';
import '../css/components/SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearchRef = useRef('');

  // Optimized debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      // Clear previous timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Don't search if query hasn't changed
      if (lastSearchRef.current === searchQuery.trim()) {
        return;
      }

      debounceRef.current = setTimeout(() => {
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery.length >= 3 || trimmedQuery.length === 0) {
          lastSearchRef.current = trimmedQuery;
          onSearch(trimmedQuery);
        }
      }, 300); // 300ms delay
    },
    [onSearch]
  );

  // Effect to trigger search when query changes
  useEffect(() => {
    debouncedSearch(query);

    // Cleanup function
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debouncedSearch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Clear debounce and search immediately
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const trimmedQuery = query.trim();
    lastSearchRef.current = trimmedQuery;
    onSearch(trimmedQuery);
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    lastSearchRef.current = '';
    // Clear any pending debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // Immediately trigger empty search
    onSearch('');
  }, [onSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-container">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search videos..."
            className="search-input"
            aria-label="Search videos"
          />
          <div className="search-actions">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className={`clear-button ${query ? 'visible' : ''}`}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
            <button type="submit" className="search-button" aria-label="Search">
              <SearchIcon />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
