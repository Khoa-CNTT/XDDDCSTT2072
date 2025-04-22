import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FarmHub from "./pages/FarmHub";
import ChatAI from "./pages/ChatAI";
import News from "./pages/News";
import AboutUs from "./pages/AboutUs";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Main from "./pages/Main";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />

          <Route path="/home" element={<Home />} />
          <Route path="/farmhub" element={<FarmHub />} />
          <Route path="/chat-ai" element={<ChatAI />} />
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<AboutUs />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
