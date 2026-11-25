import { useCallback, useEffect, useState } from "react";
import { useTextos } from "./hooks/useTextos.js";
import { useInicioPublico } from "./hooks/useInicioPublico.js";
import { useTema } from "./hooks/useTema.js";
import "./App.css";
import Navbar from "./components/Navbar";
import InicioPublico from "./components/InicioPublico.jsx";
import CatalogoPublico from "./components/CatalogoPublico.jsx";
import PanelAccesibilidad from "./components/PanelAccesibilidad.jsx";
import BannerCookies from "./components/BannerCookies.jsx";
import PreferenciasCookies from "./components/PreferenciasCookies.jsx";
import PiePublico from "./components/PiePublico.jsx";

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
  useTema();
  const textos = datos.textos;
  const textosInicio = textos?.paginas?.inicioPublico;
  const textosCatalogo = textos?.paginas?.catalogo;
  const pie = textos?.footer;
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
    const esCatalogo = rutaPrincipal === "catalogo" || rutaPrincipal === "genero";
    const seo = esCatalogo ? textosCatalogo?.seo : textosInicio?.seo;
    if (seo?.titulo) document.title = seo.titulo;
    if (seo?.descripcion) {
      let descripcion = document.querySelector('meta[name="description"]');
      if (!descripcion) {
        descripcion = document.createElement("meta");
        descripcion.name = "description";
        document.head.append(descripcion);
      }
      descripcion.content = seo.descripcion;
    }
  }, [rutaPrincipal, textosCatalogo, textosInicio]);

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
    window.history.replaceState(null, "", "#catalogo");
    setRuta("catalogo");
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

  const textosCookies = textos?.cookies;
  const textosAccesibilidad = textos?.accesibilidad;
  const errorGuardarCookies = textos?.errores?.cookies?.guardar
    || textos?.errores?.general?.error_interno;

  return (
    <div className="sitio">
      <Navbar
        textos={textos}
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
          textos={textosCatalogo}
          estados={textos?.estados}
          errores={textos?.errores}
          general={textos?.general}
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
          estados={textos?.estados}
          errores={textos?.errores}
          general={textos?.general}
          {...inicio}
        />
      )}
      <PiePublico
        textos={pie}
        onAbrirAccesibilidad={() => setPanelAccesibilidadAbierto(true)}
        onAbrirCookies={() => setPreferenciasCookiesAbiertas(true)}
      />

      <PanelAccesibilidad
        abierto={panelAccesibilidadAbierto}
        textos={textosAccesibilidad}
        preferencias={preferenciasAccesibilidad}
        onCambiar={cambiarPreferenciaAccesibilidad}
        onCerrar={cerrarPanelAccesibilidad}
        onRestablecer={() => setPreferenciasAccesibilidad(PREFERENCIAS_ACCESIBILIDAD_DEFAULT)}
      />
      {!consentimiento && textosCookies && (
        <BannerCookies
          textos={textosCookies}
          onAceptar={() => guardarConsentimientoCookies(true)}
          onRechazar={() => guardarConsentimientoCookies(false)}
          onConfigurar={() => setPreferenciasCookiesAbiertas(true)}
        />
      )}
      {errorCookies && errorGuardarCookies && (
        <p className="cookies-error" role="alert">
          {errorGuardarCookies}
        </p>
      )}
      <PreferenciasCookies
        abierto={preferenciasCookiesAbiertas}
        textos={textosCookies}
        analiticasGuardadas={consentimiento?.analytics}
        onGuardar={guardarConsentimientoCookies}
        onCerrar={cerrarPreferenciasCookies}
      />
    </div>
  );
}

export default App;
