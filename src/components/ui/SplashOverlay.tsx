"use client";
import { useState, useEffect } from "react";

export function SplashOverlay() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2300);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div
      id="app-splash"
      style={{
        position: "fixed", inset: 0, zIndex: 99999, background: "#191919",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}
    >
      <object
        type="image/svg+xml"
        data="/splash_botilyx.svg"
        style={{ width: 'min(70vw,420px)', height: "auto" }}
        aria-label="Animación splash Botilyx"
      />
    </div>
  );
}
