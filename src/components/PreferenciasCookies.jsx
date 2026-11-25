import { useEffect, useRef, useState } from "react";
import "../styles/PreferenciasCookies.css";

function leerAnaliticas(textos, analiticasGuardadas) {
  if (typeof analiticasGuardadas === "boolean") return analiticasGuardadas;
  return false;
}

export default function PreferenciasCookies({
  abierto,
  textos,
  analiticasGuardadas,
  onGuardar,
  onCerrar,
}) {
  const [analiticas, setAnaliticas] = useState(false);
  const dialogo = useRef(null);
  const focoAnterior = useRef(null);
  const preferencias = textos?.preferencias;
  const categorias = preferencias?.categorias || {};

  useEffect(() => {
    if (!abierto) return undefined;
    setAnaliticas(leerAnaliticas(textos, analiticasGuardadas));
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
  }, [abierto, analiticasGuardadas, onCerrar, textos]);

  if (!abierto || !preferencias) return null;

  const necesarias = categorias.necesarias;
  const analitica = categorias.analiticas;

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
          <h2 id="titulo-preferencias-cookies">{preferencias.titulo}</h2>
          <button type="button" onClick={onCerrar} aria-label={preferencias.aria?.cerrar || textos?.general?.acciones?.cerrar}>×</button>
        </header>
        <p>{preferencias.descripcion}</p>
        {necesarias && (
          <div className="cookies-preferencia">
            <span>
              <strong>{necesarias.nombre}</strong>
              <small>{necesarias.descripcion}</small>
            </span>
            <input type="checkbox" checked disabled aria-label={necesarias.nombre} />
          </div>
        )}
        {analitica && (
          <label className="cookies-preferencia">
            <span>
              <strong>{analitica.nombre}</strong>
              <small>{analitica.descripcion}</small>
            </span>
            <input
              type="checkbox"
              checked={analiticas}
              onChange={(evento) => setAnaliticas(evento.target.checked)}
            />
          </label>
        )}
        <div className="cookies-acciones">
          <button className="cookies-secundario" type="button" onClick={() => onGuardar(false)}>
            {preferencias.botones?.rechazar}
          </button>
          <button className="cookies-primario" type="button" onClick={() => onGuardar(analiticas)}>
            {preferencias.botones?.guardar || preferencias.botones?.aceptar}
          </button>
        </div>
      </section>
    </div>
  );
}
