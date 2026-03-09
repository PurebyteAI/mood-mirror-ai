import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MoodMirror from "@/pages/MoodMirror";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MoodMirror />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
