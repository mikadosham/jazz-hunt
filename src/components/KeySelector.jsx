import React from "react";

function KeySelector({ availableKeys, selectedKey, onKeyChange }) {
  if (availableKeys.length === 0) return null;

  return (
    <div style={{ marginTop: "10px" }}>
      <label>Select a Key:</label>
      <select
        value={selectedKey}
        onChange={(e) => onKeyChange(e.target.value)}
        style={{ marginLeft: "10px" }}
      >
        {availableKeys.map((key) => (
          <option key={key} value={key}>
            {key.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

export default KeySelector;
