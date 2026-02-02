"use client";

import { signOut, useSession } from "next-auth/react";
import { useRef, useEffect, useState } from "react";
import { useSearch, SearchResult } from "@/hooks/useSearch";

function ResultIcon({ type }: { type: SearchResult["type"] }) {
  const icons = {
    task: (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    course: (
      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    contact: (
      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    file: (
      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    budget: (
      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    interview: (
      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  };
  return icons[type];
}

function ResultTypeLabel({ type }: { type: SearchResult["type"] }) {
  const labels: Record<SearchResult["type"], string> = {
    task: "Task",
    course: "Course",
    contact: "Contact",
    file: "File",
    budget: "Budget",
    interview: "Interview",
  };
  return (
    <span className="text-xs text-gray-400 uppercase tracking-wide">
      {labels[type]}
    </span>
  );
}

interface HeaderProps {
  onNavigate?: (type: SearchResult["type"], id: string) => void;
}

export default function Header({ onNavigate }: HeaderProps) {
  const { data: session } = useSession();
  const { query, setQuery, results, isSearching, clearSearch } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show results when query changes
  useEffect(() => {
    if (query.length >= 2) {
      setShowResults(true);
    }
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    if (result.url) {
      window.open(result.url, "_blank");
    } else if (onNavigate) {
      onNavigate(result.type, result.id);
    }
    clearSearch();
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      clearSearch();
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-800">MAIL Dashboard</h1>

        {/* Search */}
        <div className="relative" ref={searchRef}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, courses, contacts, files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            onKeyDown={handleKeyDown}
            className="w-80 pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Clear button */}
          {query && (
            <button
              onClick={() => {
                clearSearch();
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="py-1">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-3 py-2 flex items-start gap-3 hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="mt-0.5">
                        <ResultIcon type={result.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-gray-900 truncate text-sm">
                            {result.title}
                          </span>
                          <ResultTypeLabel type={result.type} />
                        </div>
                        {result.subtitle && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.length > 0 && (
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                  {results.length} result{results.length !== 1 ? "s" : ""} · Press Esc to close
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {session?.user && (
          <>
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
