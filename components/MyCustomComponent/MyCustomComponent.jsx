import React from "react";
import "./myCustomComponent.css";

function MyCustomComponent({ name }) {
  return (
    <div className="example-card">
      <h1 className="card-title">Hello, {name}!</h1>
      <p className="card-text">Welcome to our website.</p>
    </div>
  );
}

export default MyCustomComponent;
