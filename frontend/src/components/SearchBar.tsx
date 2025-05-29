import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../css/components/SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
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
      <form onSubmit={handleSubmit}>
        <div className="search-container">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search videos... (auto-search after 3 chars)"
            className="search-input"
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
            <button type="submit" className="search-button">
              🔍
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
