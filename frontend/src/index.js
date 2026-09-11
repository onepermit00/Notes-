import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { BrowserRouter } from "react-router-dom";
import { AuthSessionProvider } from "./context/AuthSessionContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthSessionProvider>
          <App />
        </AuthSessionProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
