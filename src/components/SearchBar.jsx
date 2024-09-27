import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

function SearchBar({ query, onSearchChange, onClear }) {
  return (
    <div className="container">
      <div className="field">
        <input
          type="text"
          value={query}
          onChange={onSearchChange}
          placeholder="Hunt for a standard"
          id="search"
        />
        {query && (
          <button
            onClick={onClear}
            className="clear-button"
            aria-label="Clear search"
          >
            <FontAwesomeIcon icon={faTimesCircle} />
          </button>
        )}
        <label className="pulse" htmlFor="search">
          Hunt for a standard
        </label>
      </div>
    </div>
  );
}

export default SearchBar;
