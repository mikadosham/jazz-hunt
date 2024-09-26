import React from "react";
import HomePage from "./pages/HomePage";
import logo from "./assets/logo.png";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <img className="logo" src={logo} alt="JazzHunt Logo" className="logo" />
        <h1 className="hidden">JazzHunt</h1>
      </header>
      <HomePage />
    </div>
  );
}

export default App;
