import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import logo from "./assets/logo.png";
import { auth } from "./firebase"; // Import auth directly
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import loadingGif from "./assets/loading.gif";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    // Set auth persistence to local storage
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Check if the user is already logged in
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false); // Set loading to false once the auth state is determined
        });

        // Clean up the subscription
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
        setLoading(false); // Stop loading if there's an error
      });
  }, []);

  if (loading) {
    // While loading, you could return a loading spinner or null
    return (
      <div className="loading-container">
        <img src={loadingGif} alt="Loading..." className="loading-animation" />
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <header className="header">
          <img className="logo" src={logo} alt="JazzHunt Logo" />
          <h1 className="hidden">JazzHunt</h1>
        </header>

        <Routes>
          <Route
            path="/"
            element={user ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
