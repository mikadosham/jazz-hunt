import React from "react";

function SearchBar({ query, onSearchChange }) {
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={onSearchChange}
        placeholder="Enter song title"
        style={{ padding: "10px", width: "300px" }}
      />
    </div>
  );
}
export default SearchBar;
