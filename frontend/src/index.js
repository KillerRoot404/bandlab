import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // StrictMode desativado em dev para facilitar reprodução de bugs que dependem de efeitos não idempotentes
  <App />,
);
