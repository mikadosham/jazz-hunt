"use client";

import React, { useState, useRef, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation"; // use useRouter for Next.js routing
import "./Login.module.css"; // Ensure this is globally imported in _app.js if using global styles

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter(); // Use useRouter from Next.js

  const emailInputRef = useRef(null);

  // Focus on email input when the component loads
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login attempt with email:", email);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed in:", userCredential.user);
      router.push("/"); // Redirect to the homepage after successful login
    } catch (error) {
      console.error("Error during sign-in:", error);
      setError(error.message);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleLogin}>
        <div className="field">
          <input
            ref={emailInputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            id="email"
          />
          <label className="login-label pulse" htmlFor="email">
            Email
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            id="password"
          />
          <label className="login-label" htmlFor="password">
            Password
          </label>
        </div>
        <button className="login-button" type="submit">
          Login
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Login;
