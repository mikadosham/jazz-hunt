import React, { useState } from "react";
import "../CustomSelector.css";

const CustomSelector = ({ availableKeys, selectedKey, onKeyChange }) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState(selectedKey.toUpperCase());

  const toggleList = () => {
    setIsListOpen(!isListOpen);
  };

  const handleSelection = (key) => {
    setPlaceholder(key.toUpperCase());
    onKeyChange(key);
    setIsListOpen(false);
  };

  return (
    <div className="wrapper typo">
      Key:
      <div className="list">
        <span className="placeholder" onClick={toggleList}>
          {placeholder}
        </span>
        <ul className={`list__ul ${isListOpen ? "active" : ""}`}>
          {availableKeys.map((key) => (
            <li key={key}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelection(key);
                }}
              >
                {key.toLowerCase()}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomSelector;
