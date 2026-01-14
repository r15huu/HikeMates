import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Home from "./pages/Home"; // ✅ NEW

import Register from "./pages/Register";
import Login from "./pages/login"; // keep as-is
import Me from "./pages/Me";

import HikesList from "./pages/HikesList";
import HikeCreate from "./pages/HikeCreate";
import HikeDetail from "./pages/HikeDetail";
import MyHikes from "./pages/MyHikes";

// Forgot/Reset
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ✅ Home page */}
        <Route path="/" element={<Home />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* ✅ Forgot/Reset */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/me" element={<Me />} />

        {/* ✅ Public browsing */}
        <Route path="/hikes" element={<HikesList />} />
        <Route path="/hikes/:id" element={<HikeDetail />} />

        {/* 🔒 You’ll restrict these in the pages (or later with a ProtectedRoute) */}
        <Route path="/hikes/new" element={<HikeCreate />} />
        <Route path="/my-hikes" element={<MyHikes />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);