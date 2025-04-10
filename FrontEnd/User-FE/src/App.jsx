import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FarmHub from "./pages/FarmHub";
import ChatAI from "./pages/ChatAI";
import News from "./pages/News";
import AboutUs from './pages/AboutUs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/farmhub" element={<FarmHub />} />
        <Route path="/chat-ai" element={<ChatAI />} />
        <Route path="/news" element={<News />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;
