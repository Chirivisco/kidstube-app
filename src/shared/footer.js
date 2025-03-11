// components/Footer.js
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-red-500 text-white text-center p-4 mt-8">
      <p className="text-sm">
        © Copyright {new Date().getFullYear()} • Todos los derechos reservados
      </p>
    </footer>
  );
}
