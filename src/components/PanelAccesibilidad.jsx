import { useEffect, useRef } from "react";
import "../styles/PanelAccesibilidad.css";

const OPCIONES = [
  ["altoContraste", "Alto contraste", "Más diferencia entre el texto y el fondo"],
  ["reducirMovimiento", "Reducir movimiento", "Sin animaciones ni transiciones"],
  ["subrayarEnlaces", "Subrayar enlaces", "Los enlaces se distinguen sin depender del color"],
  ["espaciadoLectura", "Espaciado de lectura", "Más espacio entre líneas y entre letras"],
];

export default function PanelAccesibilidad({
  abierto,
  idioma,
  preferencias,
  onCambiar,
  onCerrar,
  onRestablecer,
}) {
  const panel = useRef(null);
  const ingles = idioma === "en";

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

  if (!abierto) return null;

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
        <h2 id="titulo-accesibilidad">{ingles ? "Accessibility" : "Accesibilidad"}</h2>
        <button type="button" onClick={onCerrar} aria-label={ingles ? "Close" : "Cerrar"}>
          ×
        </button>
      </header>

      <div className="accesibilidad-texto">
        <strong>{ingles ? "Text size" : "Tamaño del texto"}</strong>
        <div className="accesibilidad-control-tamano">
          <button
            type="button"
            onClick={() => onCambiar("escalaTexto", Math.max(80, preferencias.escalaTexto - 10))}
            aria-label={ingles ? "Decrease text size" : "Reducir tamaño del texto"}
          >
            −
          </button>
          <output>{preferencias.escalaTexto} %</output>
          <button
            type="button"
            onClick={() => onCambiar("escalaTexto", Math.min(150, preferencias.escalaTexto + 10))}
            aria-label={ingles ? "Increase text size" : "Aumentar tamaño del texto"}
          >
            +
          </button>
        </div>
      </div>

      <div className="accesibilidad-opciones">
        {OPCIONES.map(([clave, titulo, descripcion]) => (
          <label className="accesibilidad-opcion" key={clave}>
            <span>
              <strong>{ingles
                ? {
                    altoContraste: "High contrast",
                    reducirMovimiento: "Reduce motion",
                    subrayarEnlaces: "Underline links",
                    espaciadoLectura: "Reading spacing",
                  }[clave]
                : titulo}</strong>
              <small>{ingles
                ? {
                    altoContraste: "Increase contrast between text and background",
                    reducirMovimiento: "Disable animations and transitions",
                    subrayarEnlaces: "Distinguish links without relying on color",
                    espaciadoLectura: "Add space between lines and letters",
                  }[clave]
                : descripcion}</small>
            </span>
            <input
              type="checkbox"
              checked={preferencias[clave]}
              onChange={(evento) => onCambiar(clave, evento.target.checked)}
            />
          </label>
        ))}
      </div>

      <p className="accesibilidad-nota">
        {ingles
          ? "Preferences are saved on this device. Initial values follow your system settings."
          : "Se guarda en este dispositivo. Los valores iniciales salen de lo que ya definiste en tu sistema."}
      </p>
      <footer>
        <a href="#accesibilidad">{ingles ? "Accessibility statement" : "Declaración de accesibilidad"}</a>
        <button type="button" onClick={onRestablecer}>
          {ingles ? "Reset" : "Restablecer"}
        </button>
      </footer>
      </section>
    </div>
  );
}
