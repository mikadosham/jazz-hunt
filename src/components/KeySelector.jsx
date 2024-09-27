import React, { useState } from "react";

const CustomSelector = ({ availableKeys, selectedKey, onKeyChange }) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState(selectedKey.toUpperCase());

  const toggleList = () => {
    setIsListOpen(!isListOpen);
  };

  const handleSelection = (key) => {
    setPlaceholder(key);
    onKeyChange(key);
    setIsListOpen(false);
  };

  return (
    <div className="wrapper typo">
      <div className="list">
        <span className="placeholder" onClick={toggleList}>
          {placeholder === "BASS" ? `Bass clef` : `${placeholder} instruments`}
        </span>
        <ul className={`list__ul ${isListOpen ? "active" : ""}`}>
          {availableKeys.map((key) => (
            <li key={key}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleSelection(key);
                }}
                className="list-button"
              >
                {key === "BASS" ? `Bass clef` : `${key} instruments`}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomSelector;
