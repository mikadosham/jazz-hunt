import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize the useNavigate hook

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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            id="password"
          />
          <label className="pulse" htmlFor="password">
            password
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            id="email"
          />
          <label className="pulse" htmlFor="email">
            email
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
