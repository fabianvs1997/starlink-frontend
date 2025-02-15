import { useEffect } from "react";

export default function ParticlesBackground() {
  useEffect(() => {
    // Solo si window.particlesJS existe (gracias al script en index.html)
    if (window.particlesJS) {
      window.particlesJS.load("particles-js", "/particles.json", () => {
        console.log("Particles.js config cargado correctamente");
      });
    }
  }, []);

  return (
      <div
  id="particles-js"
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    minHeight: "100vh",
    zIndex: -1,
  }}
/>

  );
}
