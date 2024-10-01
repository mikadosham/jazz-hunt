import React, { useState, useRef, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      navigate("/"); // Redirect to the homepage after successful login
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
          <label class="login-label" className="pulse" htmlFor="email">
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
