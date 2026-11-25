import { useEffect, useRef } from "react";
import "../styles/PanelAccesibilidad.css";

const OPCIONES = [
  { clave: "altoContraste", texto: "altoContraste" },
  { clave: "reducirMovimiento", texto: "reducirMovimiento" },
  { clave: "subrayarEnlaces", texto: "subrayarEnlaces" },
  { clave: "espaciadoLectura", texto: "espaciado" },
];

export default function PanelAccesibilidad({
  abierto,
  textos,
  preferencias,
  onCambiar,
  onCerrar,
  onRestablecer,
}) {
  const panel = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    function cerrarConEscape(evento) {
      if (evento.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", cerrarConEscape);
    panel.current?.querySelector("button")?.focus();
    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.querySelector(".control-texto")?.focus();
    };
  }, [abierto, onCerrar]);

  if (!abierto || !textos) return null;

  const tamano = textos.tamanoTexto;

  return (
    <div
      className="accesibilidad-capa"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <section
        className="panel-accesibilidad"
        id="panel-accesibilidad"
        ref={panel}
        role="dialog"
        aria-modal="false"
        aria-labelledby="titulo-accesibilidad"
      >
        <header>
          <h2 id="titulo-accesibilidad">{textos.titulo}</h2>
          <button type="button" onClick={onCerrar} aria-label={textos.aria?.cerrar}>
            ×
          </button>
        </header>

        <div className="accesibilidad-texto">
          <strong>{tamano?.etiqueta}</strong>
          <div className="accesibilidad-control-tamano">
            <button
              type="button"
              onClick={() => onCambiar("escalaTexto", Math.max(80, preferencias.escalaTexto - 10))}
              aria-label={tamano?.reducir}
            >
              −
            </button>
            <output>{tamano?.valor?.replace("{valor}", String(preferencias.escalaTexto)) || `${preferencias.escalaTexto}%`}</output>
            <button
              type="button"
              onClick={() => onCambiar("escalaTexto", Math.min(150, preferencias.escalaTexto + 10))}
              aria-label={tamano?.aumentar}
            >
              +
            </button>
          </div>
        </div>

        <div className="accesibilidad-opciones">
          {OPCIONES.map(({ clave, texto }) => {
            const opcion = textos[texto];
            if (!opcion) return null;
            return (
              <label className="accesibilidad-opcion" key={clave}>
                <span>
                  <strong>{opcion.etiqueta}</strong>
                  <small>{opcion.ayuda}</small>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(preferencias[clave])}
                  onChange={(evento) => onCambiar(clave, evento.target.checked)}
                />
              </label>
            );
          })}
        </div>

        <p className="accesibilidad-nota">{textos.mensajes?.nota}</p>
        <footer>
          <a href="#accesibilidad">{textos.enlaces?.declaracion}</a>
          <button type="button" onClick={onRestablecer}>
            {textos.botones?.restablecer}
          </button>
        </footer>
      </section>
    </div>
  );
}
