import React, { useState, useEffect, useRef } from 'react';

export const CityAutocomplete = ({ value, onChange, className, placeholder = "Search city..." }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const searchCities = async (searchText) => {
    if (searchText.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      // Free geocoding API. We ask for JSON, in India, and limit results.
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&countrycodes=IN&limit=10`);
      const data = await res.json();
      
      // Filter unique display names, usually the first part of the comma separated string is the locality name.
      const uniqueCities = Array.from(new Set(data.map(item => {
          const parts = item.display_name.split(',');
          // Return City, State format for better clarity
          if (parts.length >= 2) {
              return `${parts[0].trim()}, ${parts[parts.length - 2].trim()}`;
          }
          return parts[0].trim();
      }))).filter(Boolean).slice(0, 6);
      
      setSuggestions(uniqueCities);
      setShowDropdown(true);
    } catch (e) {
      console.error('Error fetching cities:', e);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // pass raw text up
    
    clearTimeout(window.citySearchTimeout);
    window.citySearchTimeout = setTimeout(() => {
      searchCities(val);
    }, 400);
  };

  const handleSelect = (city) => {
    const cityName = city.split(',')[0]; // Extract just the city name for DB saving
    setQuery(cityName);
    onChange(cityName);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', textAlign: 'left' }}>
      <input
        type="text"
        className={className}
        value={query}
        onChange={handleInputChange}
        onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 50,
          maxHeight: '200px',
          overflowY: 'auto',
          marginTop: '4px'
        }}>
          {loading && <div style={{ padding: '0.5rem 1rem', color: 'var(--slate-500)', fontSize: '0.9rem' }}>Searching...</div>}
          {!loading && suggestions.length === 0 && query.length >= 2 && (
            <div style={{ padding: '0.5rem 1rem', color: 'var(--slate-500)', fontSize: '0.9rem' }}>Type to search anywhere in India...</div>
          )}
          {!loading && suggestions.map((city, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(city)}
              style={{
                padding: '0.7rem 1rem',
                cursor: 'pointer',
                fontSize: '0.95rem',
                borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--slate-100)',
                color: 'var(--slate-800)'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--slate-50)'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
