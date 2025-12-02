// src/components/MainContent.jsx
import React from "react";

const MainContent = ({ children }) => {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px",
        minHeight: "100vh",
        background: "#0D1B2A", // Main dark background
        color: "#E0E1DD",
        overflowX: "hidden",
      }}
    >
      {children}
    </div>
  );
};

export default MainContent;
