import AboutUs from "./pages/AboutUs";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./components/Home";
import FarmHub from "./components/FarmHub";
import ChatAI from "./components/ChatAI";
import New from "./components/New";
import ProductType from "./components/ProductType";
import Evaluation from "./components/Evaluation";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/aboutUs" element={<AboutUs />} />
            <Route path="/farmHub" element={<FarmHub />} />
            <Route path="/chatAI" element={<ChatAI />} />
            <Route path="/new" element={<New />} />
            <Route path="/farmHub/product/type" element={<ProductType />} />
            <Route path="/register" element={<Register />} />
            <Route path="/evaluation" element={<Evaluation />} />
          </Routes>
        </BrowserRouter>
      </div>
      <AboutUs /> 
      <Register />
      <Login />
    </>
  );
}

export default App;
