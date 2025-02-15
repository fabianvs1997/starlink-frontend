// src/components/ParticlesBackground.jsx

import { useEffect } from "react";
import { tsParticles } from "tsparticles-engine"; // OJO: te explico luego
// Si prefieres la librería original de "particles.js", verás que no hay import por default
// y tendrías que usar el script global. Abajo te muestro otra forma.

export default function ParticlesBackground() {
  useEffect(() => {
    // Si usas la librería "particles.js" original, podrías cargarla así:
    // window.particlesJS.load('particles-js', '/particles.json', function() {
    //   console.log('Particles.js config cargado');
    // });

    // *** Sin embargo, la librería "particles.js" original no es tan amigable con ESModules/React.
    // *** Es más fácil usar "tsparticles" o "react-tsparticles".
    // *** Aun así, te doy un ejemplo abajo con el script global.
  }, []);

  // Le damos estilo para que ocupe toda la pantalla detrás del contenido
  return (
    <div
      id="particles-js"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1, // Para que quede detrás de todo
        background: "transparent",
      }}
    ></div>
  );
}
