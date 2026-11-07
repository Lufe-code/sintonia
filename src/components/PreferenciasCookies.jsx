import { useEffect, useRef, useState } from "react";
import "../styles/PreferenciasCookies.css";

export default function PreferenciasCookies({
  abierto,
  idioma,
  analiticasGuardadas,
  onGuardar,
  onCerrar,
}) {
  const [analiticas, setAnaliticas] = useState(false);
  const dialogo = useRef(null);
  const focoAnterior = useRef(null);
  const ingles = idioma === "en";

  useEffect(() => {
    if (!abierto) return undefined;
    setAnaliticas(Boolean(analiticasGuardadas));
    focoAnterior.current = document.activeElement;
    const sitio = document.querySelector(".sitio");
    const fondo = Array.from(sitio?.children || [])
      .filter((elemento) => !elemento.contains(dialogo.current))
      .map((elemento) => ({ elemento, inerte: elemento.inert }));
    fondo.forEach(({ elemento }) => {
      elemento.inert = true;
    });

    function gestionarTeclado(evento) {
      if (evento.key === "Escape") {
        onCerrar();
        return;
      }
      if (evento.key !== "Tab" || !dialogo.current) return;

      const enfocables = Array.from(
        dialogo.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((elemento) => elemento.getClientRects().length > 0);
      if (enfocables.length === 0) {
        evento.preventDefault();
        dialogo.current.focus();
        return;
      }

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }
    document.addEventListener("keydown", gestionarTeclado);
    dialogo.current?.querySelector("button")?.focus();
    return () => {
      document.removeEventListener("keydown", gestionarTeclado);
      fondo.forEach(({ elemento, inerte }) => {
        elemento.inert = inerte;
      });
      if (focoAnterior.current?.isConnected) focoAnterior.current.focus();
    };
  }, [abierto, analiticasGuardadas, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="cookies-capa" onMouseDown={(evento) => {
      if (evento.target === evento.currentTarget) onCerrar();
    }}>
      <section
        className="cookies-dialogo"
        ref={dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-preferencias-cookies"
        tabIndex={-1}
      >
        <header>
          <h2 id="titulo-preferencias-cookies">
            {ingles ? "Cookie preferences" : "Preferencias de cookies"}
          </h2>
          <button type="button" onClick={onCerrar} aria-label={ingles ? "Close" : "Cerrar"}>×</button>
        </header>
        <p>
          {ingles
            ? "Choose which optional cookies Sintonía may store on this device."
            : "Elige qué cookies opcionales puede guardar Sintonía en este dispositivo."}
        </p>
        <div className="cookies-preferencia">
          <span>
            <strong>{ingles ? "Essential" : "Necesarias"}</strong>
            <small>{ingles ? "Required for the site to work." : "Necesarias para que el sitio funcione."}</small>
          </span>
          <input type="checkbox" checked disabled aria-label={ingles ? "Essential cookies enabled" : "Cookies necesarias activadas"} />
        </div>
        <label className="cookies-preferencia">
          <span>
            <strong>{ingles ? "Analytics" : "Analíticas"}</strong>
            <small>{ingles ? "Help us understand how the site is used." : "Nos ayudan a entender cómo se usa el sitio."}</small>
          </span>
          <input
            type="checkbox"
            checked={analiticas}
            onChange={(evento) => setAnaliticas(evento.target.checked)}
          />
        </label>
        <div className="cookies-acciones">
          <button className="cookies-secundario" type="button" onClick={() => onGuardar(false)}>
            {ingles ? "Reject optional" : "Rechazar opcionales"}
          </button>
          <button className="cookies-primario" type="button" onClick={() => onGuardar(analiticas)}>
            {ingles ? "Save preferences" : "Guardar preferencias"}
          </button>
        </div>
      </section>
    </div>
  );
}
