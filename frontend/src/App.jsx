import { Routes, Route } from "react-router-dom";

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

// IMPORTANT: use the exact filename/case you created
import ExploreTrails from "./pages/ExploreTrails";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/trails" element={<ExploreTrails />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/me" element={<Me />} />

      <Route path="/hikes" element={<HikesList />} />
      <Route path="/hikes/:id" element={<HikeDetail />} />
      <Route path="/hikes/new" element={<HikeCreate />} />
      <Route path="/my-hikes" element={<MyHikes />} />
    </Routes>
  );
}