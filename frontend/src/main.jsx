import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Register from "./pages/Register";
import Login from "./pages/login"; // or "./pages/Login" if you renamed
import Me from "./pages/Me";

import HikesList from "./pages/HikesList";
import HikeCreate from "./pages/HikeCreate";
import HikeDetail from "./pages/HikeDetail";
import MyHikes from "./pages/MyHikes";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/me" element={<Me />} />

        <Route path="/hikes" element={<HikesList />} />
        <Route path="/hikes/new" element={<HikeCreate />} />
        <Route path="/hikes/:id" element={<HikeDetail />} />
        <Route path="/my-hikes" element={<MyHikes />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);