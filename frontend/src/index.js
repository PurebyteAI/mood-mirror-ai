import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import "@/index.css";
import App from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} themes={["dark", "light", "romantic"]}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
