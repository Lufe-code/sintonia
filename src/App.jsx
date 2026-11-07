import { useCallback, useEffect, useState } from "react";
import { useTextos } from "./hooks/useTextos.js";
import { useInicioPublico } from "./hooks/useInicioPublico.js";
import "./App.css";
import Navbar from "./components/Navbar";
import LogoSintonia from "./components/LogoSintonia.jsx";
import InicioPublico from "./components/InicioPublico.jsx";
import CatalogoPublico from "./components/CatalogoPublico.jsx";
import PanelAccesibilidad from "./components/PanelAccesibilidad.jsx";
import BannerCookies from "./components/BannerCookies.jsx";
import PreferenciasCookies from "./components/PreferenciasCookies.jsx";

const PREFERENCIAS_ACCESIBILIDAD_DEFAULT = {
  escalaTexto: 100,
  altoContraste: false,
  reducirMovimiento: false,
  subrayarEnlaces: false,
  espaciadoLectura: false,
};

function leerRuta() {
  return window.location.hash.slice(1) || "inicio";
}

function leerIdioma() {
  const guardado = localStorage.getItem("sintonia-idioma");
  return guardado === "en" ? "en" : "es";
}

function leerPreferenciasAccesibilidad() {
  try {
    const guardadas = JSON.parse(localStorage.getItem("sintonia-accesibilidad") || "{}");
    const escala = Number(guardadas.escalaTexto);
    return {
      ...PREFERENCIAS_ACCESIBILIDAD_DEFAULT,
      ...guardadas,
      escalaTexto: Number.isFinite(escala)
        ? Math.min(150, Math.max(80, escala))
        : PREFERENCIAS_ACCESIBILIDAD_DEFAULT.escalaTexto,
    };
  } catch (error) {
    console.error("No se pudieron leer las preferencias de accesibilidad:", error);
    return PREFERENCIAS_ACCESIBILIDAD_DEFAULT;
  }
}

function leerConsentimientoCookies() {
  try {
    const consentimiento = JSON.parse(localStorage.getItem("sintonia-cookies") || "null");
    return consentimiento?.necessary === true ? consentimiento : null;
  } catch (error) {
    console.error("No se pudo leer el consentimiento de cookies:", error);
    return null;
  }
}

function App() {
  const [idioma, setIdioma] = useState(leerIdioma);
  const [ruta, setRuta] = useState(leerRuta);
  const [busqueda, setBusqueda] = useState("");
  const [panelAccesibilidadAbierto, setPanelAccesibilidadAbierto] = useState(false);
  const [preferenciasAccesibilidad, setPreferenciasAccesibilidad] = useState(
    leerPreferenciasAccesibilidad,
  );
  const [consentimiento, setConsentimiento] = useState(leerConsentimientoCookies);
  const [preferenciasCookiesAbiertas, setPreferenciasCookiesAbiertas] = useState(false);
  const [errorCookies, setErrorCookies] = useState(false);
  const datos = useTextos(idioma);
  const inicio = useInicioPublico();
  const textosInicio = datos.textos?.paginas?.inicioPublico;
  const pie = datos.textos?.footer;
  const rutaPrincipal = ruta.split("/")[0];
  const activo = rutaPrincipal === "genero" ? "catalogo" : rutaPrincipal;

  useEffect(() => {
    function actualizar() {
      setRuta(leerRuta());
    }
    window.addEventListener("hashchange", actualizar);
    return () => window.removeEventListener("hashchange", actualizar);
  }, []);

  useEffect(() => {
    document.documentElement.lang = idioma;
    localStorage.setItem("sintonia-idioma", idioma);
  }, [idioma]);

  useEffect(() => {
    if (rutaPrincipal === "catalogo" || rutaPrincipal === "genero") {
      document.title = idioma === "en"
        ? "Music catalogue | Sintonía"
        : "Catálogo musical | Sintonía";
      return;
    }
    if (textosInicio?.seo?.titulo) {
      document.title = textosInicio.seo.titulo;
    }
    if (textosInicio?.seo?.descripcion) {
      let descripcion = document.querySelector('meta[name="description"]');
      if (!descripcion) {
        descripcion = document.createElement("meta");
        descripcion.name = "description";
        document.head.append(descripcion);
      }
      descripcion.content = textosInicio.seo.descripcion;
    }
  }, [idioma, rutaPrincipal, textosInicio]);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.style.fontSize = `${preferenciasAccesibilidad.escalaTexto}%`;
    raiz.dataset.altoContraste = String(preferenciasAccesibilidad.altoContraste);
    raiz.dataset.reducirMovimiento = String(preferenciasAccesibilidad.reducirMovimiento);
    raiz.dataset.subrayarEnlaces = String(preferenciasAccesibilidad.subrayarEnlaces);
    raiz.dataset.espaciadoLectura = String(preferenciasAccesibilidad.espaciadoLectura);
    try {
      localStorage.setItem(
        "sintonia-accesibilidad",
        JSON.stringify(preferenciasAccesibilidad),
      );
    } catch (error) {
      console.error("No se pudieron guardar las preferencias de accesibilidad:", error);
    }
    return () => {
      raiz.style.fontSize = "";
      delete raiz.dataset.altoContraste;
      delete raiz.dataset.reducirMovimiento;
      delete raiz.dataset.subrayarEnlaces;
      delete raiz.dataset.espaciadoLectura;
    };
  }, [preferenciasAccesibilidad]);

  const cerrarPanelAccesibilidad = useCallback(
    () => setPanelAccesibilidadAbierto(false),
    [],
  );
  const cerrarPreferenciasCookies = useCallback(
    () => setPreferenciasCookiesAbiertas(false),
    [],
  );

  function buscar(valor) {
    setBusqueda(valor.trim());
    const siguienteRuta = "catalogo";
    window.history.replaceState(null, "", `#${siguienteRuta}`);
    setRuta(siguienteRuta);
  }

  function guardarConsentimientoCookies(analiticas) {
    const nuevoConsentimiento = {
      necessary: true,
      analytics: Boolean(analiticas),
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("sintonia-cookies", JSON.stringify(nuevoConsentimiento));
      setConsentimiento(nuevoConsentimiento);
      setErrorCookies(false);
      setPreferenciasCookiesAbiertas(false);
    } catch (error) {
      console.error("No se pudo guardar el consentimiento de cookies:", error);
      setErrorCookies(true);
    }
  }

  function cambiarPreferenciaAccesibilidad(clave, valor) {
    setPreferenciasAccesibilidad((actuales) => ({
      ...actuales,
      [clave]: valor,
    }));
  }

  const textosCookies = idioma === "en"
    ? {
        banner: "We use cookies",
        descripcion: "We use essential cookies to keep you signed in and remember your language. You can accept or reject optional cookies.",
        aceptar: "Accept",
        rechazar: "Reject",
      }
    : {
        banner: "Usamos cookies",
        descripcion: "Usamos cookies necesarias para mantener tu sesión y recordar tu idioma. Puedes aceptar o rechazar las opcionales.",
        aceptar: "Aceptar",
        rechazar: "Rechazar",
      };

  return (
    <div className="sitio">
      <Navbar
        {...datos}
        idioma={idioma}
        cambiarIdioma={setIdioma}
        activo={activo}
        onBuscar={buscar}
        accesibilidadAbierta={panelAccesibilidadAbierto}
        alternarTexto={() => setPanelAccesibilidadAbierto(true)}
      />
      {rutaPrincipal === "catalogo" || rutaPrincipal === "genero" ? (
        <CatalogoPublico
          idioma={idioma}
          generos={inicio.generos}
          albumes={inicio.albumesCatalogo}
          catalogo={inicio.catalogo}
          busqueda={busqueda}
          cargando={inicio.cargando}
          error={inicio.error}
          recargar={inicio.recargar}
        />
      ) : (
        <InicioPublico
          idioma={idioma}
          busqueda={busqueda}
          textos={textosInicio}
          cargandoTextos={datos.cargando}
          errorTextos={datos.error}
          recargarTextos={datos.recargar}
          {...inicio}
        />
      )}
      <footer className="pie-publico">
        <div className="pie-publico-interior">
          <LogoSintonia />
          <p>{pie?.lema || (idioma === "en"
            ? "Albums and artists from every genre, in one place."
            : "Álbumes y artistas de todos los géneros, en un solo lugar.")}</p>
          <div className="pie-publico-columnas">
            <div>
              <h2>{pie?.columnas?.explora?.titulo || (idioma === "en" ? "Explore" : "Explora")}</h2>
              <a href="#inicio">{pie?.columnas?.explora?.enlaces?.inicio || (idioma === "en" ? "Home" : "Inicio")}</a>
              <a href="#catalogo">{pie?.columnas?.explora?.enlaces?.catalogo || (idioma === "en" ? "Music catalogue" : "Catálogo musical")}</a>
            </div>
            <div>
              <h2>{pie?.columnas?.cuenta?.titulo || (idioma === "en" ? "Your account" : "Tu cuenta")}</h2>
              <a href="#ingresar">{pie?.columnas?.cuenta?.enlaces?.ingresar || (idioma === "en" ? "Log in" : "Iniciar sesión")}</a>
              <a href="#registro">{pie?.columnas?.cuenta?.enlaces?.crearCuenta || (idioma === "en" ? "Sign up" : "Crear cuenta")}</a>
            </div>
            <div>
              <h2>{pie?.columnas?.legal?.titulo || (idioma === "en" ? "Legal" : "Legal")}</h2>
              <a href="#terminos">{pie?.columnas?.legal?.enlaces?.terminos || (idioma === "en" ? "Terms of use" : "Términos de uso")}</a>
              <button type="button" onClick={() => setPanelAccesibilidadAbierto(true)}>
                {pie?.columnas?.legal?.enlaces?.accesibilidad || (idioma === "en" ? "Accessibility" : "Accesibilidad")}
              </button>
              <button type="button" onClick={() => setPreferenciasCookiesAbiertas(true)}>
                {idioma === "en" ? "Cookie preferences" : "Preferencias de cookies"}
              </button>
            </div>
          </div>
          <div className="pie-publico-legal">
            <span>{pie?.legal?.derechos?.replace("{anio}", String(new Date().getFullYear())) || `© ${new Date().getFullYear()} Sintonía · ${idioma === "en" ? "Academic project" : "Proyecto académico"}`}</span>
            <span>{pie?.legal?.nota || (idioma === "en" ? "Royalty-free sample audio. Fictional artists and titles." : "Audio de ejemplo de uso libre. Artistas y títulos ficticios.")}</span>
          </div>
        </div>
      </footer>

      <PanelAccesibilidad
        abierto={panelAccesibilidadAbierto}
        idioma={idioma}
        preferencias={preferenciasAccesibilidad}
        onCambiar={cambiarPreferenciaAccesibilidad}
        onCerrar={cerrarPanelAccesibilidad}
        onRestablecer={() => setPreferenciasAccesibilidad(PREFERENCIAS_ACCESIBILIDAD_DEFAULT)}
      />
      {!consentimiento && (
        <BannerCookies
          textos={textosCookies}
          onAceptar={() => guardarConsentimientoCookies(true)}
          onRechazar={() => guardarConsentimientoCookies(false)}
        />
      )}
      {errorCookies && (
        <p className="cookies-error" role="alert">
          {idioma === "en"
            ? "Your cookie preferences could not be saved."
            : "No se pudieron guardar tus preferencias de cookies."}
        </p>
      )}
      <PreferenciasCookies
        abierto={preferenciasCookiesAbiertas}
        idioma={idioma}
        analiticasGuardadas={consentimiento?.analytics}
        onGuardar={guardarConsentimientoCookies}
        onCerrar={cerrarPreferenciasCookies}
      />
    </div>
  );
}

export default App;
