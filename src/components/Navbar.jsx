import { useEffect, useId, useRef, useState } from "react";
import Icono from "./Icono.jsx";
import LogoSintonia from "./LogoSintonia.jsx";
import MenuMovil from "./MenuMovil.jsx";
import "../styles/Navbar.css";

export default function Navbar({
  textos,
  idioma,
  cambiarIdioma,
  activo,
  accesibilidadAbierta,
  alternarTexto,
  onBuscar,
}) {
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const boton = useRef(null);
  const id = useId();
  const nav = textos?.navbar;
  const menuMovil = textos?.menuMovil;

  useEffect(() => {
    if (!abierto) return undefined;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto]);

  function enviarBusqueda(evento) {
    evento.preventDefault();
    onBuscar(consulta);
    setAbierto(false);
  }

  return (
    <header
      className={`cabecera-home${abierto ? " menu-movil-abierto" : ""}`}
      onKeyDown={(evento) => {
        if (evento.key === "Escape" && abierto) {
          setAbierto(false);
          boton.current?.focus();
        }
      }}
    >
      <div className="ancho-home fila-cabecera">
        <LogoSintonia ariaLabel={nav?.logo?.aria} />
        <MenuMovil
          abierto={abierto}
          onAlternar={() => setAbierto((valor) => !valor)}
          menuId={id}
          botonRef={boton}
          textos={{
            abrirMenu: menuMovil?.abrir || "Abrir menú",
            cerrarMenu: menuMovil?.cerrar || "Cerrar menú",
          }}
        />
        <nav
          id={id}
          className={`menu-home ${abierto ? "abierto" : ""}`}
          aria-label={nav?.aria?.navegacion || "Navegación principal"}
        >
          <a
            href="#inicio"
            aria-current={activo === "inicio" ? "page" : undefined}
            onClick={() => setAbierto(false)}
          >
            {nav?.enlaces?.inicio || "Inicio"}
          </a>
          <a
            href="#catalogo"
            aria-current={activo === "catalogo" ? "page" : undefined}
            onClick={() => setAbierto(false)}
          >
            {nav?.enlaces?.catalogo || "Catálogo"}
          </a>
          <div className="acciones-home">
            <form className="busqueda-home" role="search" onSubmit={enviarBusqueda}>
              <input
                type="search"
                aria-label={nav?.buscador?.placeholder || "Buscar álbumes"}
                placeholder={nav?.buscador?.placeholder || "Buscar álbumes"}
                value={consulta}
                onChange={(evento) => setConsulta(evento.target.value)}
              />
              <button type="submit" aria-label={idioma === "es" ? "Buscar" : "Search"}>
                <Icono nombre="buscar" />
              </button>
            </form>
            <button
              className="control-home control-texto"
              type="button"
              aria-label={nav?.aria?.accesibilidad || "Cambiar tamaño del texto"}
              aria-expanded={accesibilidadAbierta}
              aria-controls="panel-accesibilidad"
              onClick={() => {
                setAbierto(false);
                alternarTexto();
              }}
            >
              <span className="control-texto-etiqueta">
                {idioma === "en" ? "Accessibility" : "Accesibilidad"}
              </span>
              <Icono nombre="accesibilidad" />
            </button>
            <div className="idioma-home">
              <span className="idioma-home-etiqueta">
                {idioma === "en" ? "Language" : "Idioma"}
              </span>
              <div className="selector-idioma" role="group" aria-label={nav?.aria?.idioma || "Idioma"}>
                <button
                  type="button"
                  aria-label={idioma === "es" ? "Español" : "Spanish"}
                  aria-pressed={idioma === "es"}
                  onClick={() => {
                    cambiarIdioma("es");
                    setAbierto(false);
                  }}
                >
                  ES
                </button>
                <button
                  type="button"
                  aria-label={idioma === "en" ? "English" : "Inglés"}
                  aria-pressed={idioma === "en"}
                  onClick={() => {
                    cambiarIdioma("en");
                    setAbierto(false);
                  }}
                >
                  EN
                </button>
              </div>
            </div>
            <a className="ingresar-home" href="#ingresar" onClick={() => setAbierto(false)}>
              {nav?.botones?.invitado?.ingresar || "Ingresar"}
            </a>
            <a className="boton-home primario" href="#registro" onClick={() => setAbierto(false)}>
              {nav?.botones?.invitado?.crearCuenta || "Crear cuenta"}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
