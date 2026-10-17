import { useEffect, useRef, useState } from "react";
import Icono from "./Icono.jsx";
import "./Navbar.css";

const DESTINOS = {
  descubrir: "#inicio",
  planes: "#planes",
  paraArtistas: "#artistas",
  ayuda: "#ayuda",
};

export default function Navbar({
  textos,
  cargando,
  error,
  recargar,
  idioma,
  cambiarIdioma,
  activo,
  onBuscar,
  textoGrande,
  alternarTexto,
}) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const botonMenu = useRef(null);
  const campoBusqueda = useRef(null);
  const nav = textos?.navbar;
  const menuMovil = textos?.menuMovil;
  const ingles = idioma === "en";
  const abrir =
    menuMovil?.abrir ?? (ingles ? "Open menu" : "Abrir menú");
  const cerrar =
    menuMovil?.cerrar ?? (ingles ? "Close menu" : "Cerrar menú");
  const etiquetaBusqueda =
    nav?.buscador?.placeholder ?? (ingles ? "Search" : "Buscar");
  const enlaces = Object.entries(nav?.enlaces?.invitado ?? {}).filter(
    ([clave]) => DESTINOS[clave],
  );

  useEffect(() => {
    function cerrarConEscape(evento) {
      if (evento.key === "Escape" && abierto) {
        setAbierto(false);
        botonMenu.current?.focus();
      }
    }
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [abierto]);

  function abrirBusqueda() {
    setAbierto(true);
    requestAnimationFrame(() => campoBusqueda.current?.focus());
  }

  function buscar(evento) {
    evento.preventDefault();
    const consulta = busqueda.trim();
    if (!consulta) return;
    onBuscar(consulta);
    setAbierto(false);
  }

  return (
    <header className="navbar">
      <nav
        className="navbar-interior"
        aria-label={nav?.aria.navegacion ?? "Navegación principal"}
      >
        <a
          className="navbar-marca"
          href="#inicio"
          aria-label={nav?.logo.aria ?? "Inicio"}
          onClick={() => setAbierto(false)}
        >
          <span className="navbar-simbolo" aria-hidden="true">
            S
          </span>
          <span>{nav?.logo.texto ?? "Héroes"}</span>
        </a>

        <div className="navbar-movil-acciones">
          <button
            type="button"
            className="navbar-icono"
            aria-label={etiquetaBusqueda}
            disabled={!nav}
            onClick={abrirBusqueda}
          >
            <Icono nombre="buscar" />
          </button>
          {nav && (
            <a
              className="navbar-icono"
                href="#ingresar"
                aria-label={nav.botones.invitado.ingresar}
              onClick={() => setAbierto(false)}
            >
                <Icono nombre="usuario" />
            </a>
          )}
          <button
            ref={botonMenu}
            type="button"
            className="navbar-icono"
            aria-label={abierto ? cerrar : abrir}
            aria-expanded={abierto}
            aria-controls="navbar-panel"
            onClick={() => setAbierto((valor) => !valor)}
          >
            <Icono nombre={abierto ? "cerrar" : "menu"} />
          </button>
        </div>

        <div
          id="navbar-panel"
          className={`navbar-panel${abierto ? " is-abierto" : ""}`}
          aria-busy={cargando}
        >
          {cargando && (
            <p className="navbar-estado" role="status">
              {ingles ? "Loading navigation…" : "Cargando navegación…"}
            </p>
          )}
          {error && (
            <div className="navbar-estado" role="alert">
              <p>
                {ingles
                  ? "Navigation could not be loaded."
                  : "No pudimos cargar el menú."}
              </p>
              <button type="button" onClick={recargar}>
                {ingles ? "Try again" : "Reintentar"}
              </button>
            </div>
          )}
          {nav && (
            <>
              <ul className="navbar-enlaces">
                {enlaces.map(([clave, etiqueta]) => (
                  <li key={clave}>
                    <a
                      href={DESTINOS[clave]}
                      aria-current={activo === clave ? "page" : undefined}
                      onClick={() => setAbierto(false)}
                    >
                      {etiqueta}
                    </a>
                  </li>
                ))}
              </ul>
              <form
                className="navbar-buscador"
                role="search"
                aria-label={etiquetaBusqueda}
                onSubmit={buscar}
              >
                <button type="submit" aria-label={etiquetaBusqueda}>
                  <Icono nombre="buscar" />
                </button>
                <input
                  ref={campoBusqueda}
                  type="search"
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                  placeholder={nav.buscador.placeholder}
                  aria-label={etiquetaBusqueda}
                  required
                />
              </form>
            </>
          )}
          <div className="navbar-utilidades">
            <label className="navbar-idioma">
              <Icono nombre="idioma" />
              <select
                value={idioma}
                onChange={(evento) => cambiarIdioma(evento.target.value)}
                aria-label={nav?.aria.idioma ?? "Cambiar idioma"}
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </label>
            <button
              className="navbar-icono navbar-accesibilidad"
              type="button"
              aria-label={ingles ? "Enlarge text" : "Aumentar texto"}
              aria-pressed={textoGrande}
              onClick={alternarTexto}
            >
              <Icono nombre="accesibilidad" />
            </button>
            {nav && (
              <a
                className="navbar-accion"
                href="#registro"
                onClick={() => setAbierto(false)}
              >
                {nav.botones.invitado.crearCuenta}
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
