import React from "react";

function SearchBar({ query, onSearchChange }) {
  return (
    <div class="container">
      <div className="field">
        <input
          type="text"
          value={query}
          onChange={onSearchChange}
          placeholder="Hunt for a standard"
          id="search"
        />
        <label className="pulse" htmlFor="search">
          Hunt for a standard
        </label>
      </div>
    </div>
  );
}
export default SearchBar;
