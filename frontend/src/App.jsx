import { Routes, Route } from "react-router-dom";

// pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/login"; 
import Me from "./pages/Me";
import HikesList from "./pages/HikesList";
import HikeCreate from "./pages/HikeCreate";
import HikeDetail from "./pages/HikeDetail";
import MyHikes from "./pages/MyHikes";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/me" element={<Me />} />

      {/* Public browsing */}
      <Route path="/hikes" element={<HikesList />} />
      <Route path="/hikes/:id" element={<HikeDetail />} />

      {/* Restricted later */}
      <Route path="/hikes/new" element={<HikeCreate />} />
      <Route path="/my-hikes" element={<MyHikes />} />

      {/* fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}