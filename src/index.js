import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Create the root element for the React app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker if supported
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
      console.log(
        "ServiceWorker registration successful with scope: ",
        registration.scope
      );
    })
    .catch((error) => {
      console.error("ServiceWorker registration failed: ", error);
    });
}
