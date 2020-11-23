import React from "react";

export default function Header() {
  return (
    <header>
      <h1>OneGraph Relay Starter</h1>
      <div className="logo">
        <img
          src="https://www.onegraph.com/android-chrome-512x512.png"
          alt="OneGraph Relay Starter Logo"
        />
      </div>

      <img
        src="https://relay.dev/img/relay-white.svg"
        alt="Relay Logo"
        style={{
          width: "33%",
          right: "0px",
          position: "absolute",
          opacity: "0.1",
          transform: "rotate(-26deg)"
        }}
      />
    </header>
  );
}
