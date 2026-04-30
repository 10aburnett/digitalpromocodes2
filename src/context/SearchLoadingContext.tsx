'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SearchLoadingContextType {
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
}

const SearchLoadingContext = createContext<SearchLoadingContextType>({
  isSearching: false,
  setIsSearching: () => {},
});

export function SearchLoadingProvider({ children }: { children: ReactNode }) {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <SearchLoadingContext.Provider value={{ isSearching, setIsSearching }}>
      {children}
    </SearchLoadingContext.Provider>
  );
}

export function useSearchLoading() {
  return useContext(SearchLoadingContext);
}
