import { useCallback, useEffect, useState } from "react";
import { useTextos } from "./hooks/useTextos.js";
import { useInicioPublico } from "./hooks/useInicioPublico.js";
import { useDetalleAlbum } from "./hooks/useDetalleAlbum.js";
import { useSesion } from "./hooks/useSesion.js";
import { useTokensDisenoApi } from "./hooks/useTokensDisenoApi.js";
import { useTema } from "./hooks/useTema.js";
import "./App.css";
import Navbar from "./components/Navbar";
import InicioPublico from "./components/InicioPublico.jsx";
import InicioSesionPublico from "./components/InicioSesionPublico.jsx";
import CatalogoPublico from "./components/CatalogoPublico.jsx";
import DetalleAlbumPublico from "./components/DetalleAlbumPublico.jsx";
import PanelAccesibilidad from "./components/PanelAccesibilidad.jsx";
import BannerCookies from "./components/BannerCookies.jsx";
import PreferenciasCookies from "./components/PreferenciasCookies.jsx";
import PiePublico from "./components/PiePublico.jsx";
import AvisoEstado from "./components/AvisoEstado.jsx";

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

function leerIdAlbum(ruta) {
  const coincidencia = ruta.match(/^album\/(.+)$/);
  if (!coincidencia) {
    return null;
  }

  try {
    return decodeURIComponent(coincidencia[1]);
  } catch (error) {
    console.error("No se pudo leer el álbum desde la URL:", error);
    return coincidencia[1];
  }
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
  const sesion = useSesion();
  useTokensDisenoApi();
  useTema();
  const rutaPrincipal = ruta.split("/")[0];
  const albumId = rutaPrincipal === "album" ? leerIdAlbum(ruta) : null;
  const esInicioSesion = rutaPrincipal === "ingresar";
  const detalleAlbum = useDetalleAlbum(albumId);
  const textos = datos.textos;
  const textosInicio = textos?.paginas?.inicioPublico;
  const textosCatalogo = textos?.paginas?.catalogo;
  const pie = textos?.footer;
  const paginaInicioAutenticado = textos?.paginas?.inicio;
  const activo = rutaPrincipal === "genero" || rutaPrincipal === "album"
    ? "catalogo"
    : rutaPrincipal;

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
    if (sesion.usuario && esInicioSesion) {
      window.history.replaceState(null, "", "#inicio");
      setRuta("inicio");
    }
  }, [sesion.usuario, esInicioSesion]);

  useEffect(() => {
    const esCatalogo = rutaPrincipal === "catalogo" || rutaPrincipal === "genero";
    const paginaDetalle = textos?.paginas?.album;
    const seo = esCatalogo
      ? textosCatalogo?.seo
      : rutaPrincipal === "album"
        ? paginaDetalle?.seo
        : esInicioSesion
          ? textos?.paginas?.ingresar?.seo
          : sesion.usuario
            ? paginaInicioAutenticado?.seo
            : textosInicio?.seo;
    const tituloAlbum = detalleAlbum.album?.titulo;
    const titulo = rutaPrincipal === "album"
      ? tituloAlbum
        ? paginaDetalle?.seo?.titulo?.replace(/\{titulo\}/g, tituloAlbum) || tituloAlbum
        : paginaDetalle?.noEncontrado?.titulo || ""
      : seo?.titulo;
    if (titulo) document.title = titulo;
    if (seo?.descripcion) {
      let descripcion = document.querySelector('meta[name="description"]');
      if (!descripcion) {
        descripcion = document.createElement("meta");
        descripcion.name = "description";
        document.head.append(descripcion);
      }
      descripcion.content = seo.descripcion;
    }
  }, [
    rutaPrincipal,
    textos,
    textosCatalogo,
    textosInicio,
    paginaInicioAutenticado,
    sesion.usuario,
    detalleAlbum.album,
  ]);

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

  async function cerrarSesion() {
    const cerrada = await sesion.cerrarSesion();
    if (cerrada) {
      window.history.replaceState(null, "", "#inicio");
      setRuta("inicio");
    }
  }

  const textosCookies = textos?.cookies;
  const textosAccesibilidad = textos?.accesibilidad;
  const errorGuardarCookies = textos?.errores?.cookies?.guardar
    || textos?.errores?.general?.error_interno;

  return (
    <div className={`sitio${esInicioSesion ? " sitio-inicio-sesion" : ""}`}>
      {!esInicioSesion && (
        <Navbar
          textos={textos}
          idioma={idioma}
          cambiarIdioma={setIdioma}
          activo={activo}
          onBuscar={buscar}
          usuario={sesion.usuario}
          sesionCargando={sesion.cargando}
          onCerrarSesion={cerrarSesion}
          accesibilidadAbierta={panelAccesibilidadAbierto}
          alternarTexto={() => setPanelAccesibilidadAbierto(true)}
        />
      )}
      {!esInicioSesion && sesion.error && (
        <AvisoEstado
          mensaje={textos?.errores?.general?.error_interno || textos?.errores?.error_interno}
          accion={sesion.usuario ? cerrarSesion : sesion.recargar}
          textoAccion={textos?.general?.acciones?.reintentar}
          tipo="alert"
        />
      )}
      {rutaPrincipal === "album" ? (
        <DetalleAlbumPublico
          album={detalleAlbum.album}
          albumes={inicio.albumesCatalogo}
          idioma={idioma}
          textos={textos}
          estados={textos?.estados}
          errores={textos?.errores}
          general={textos?.general}
          cargando={detalleAlbum.cargando}
          error={detalleAlbum.error}
          noEncontrado={detalleAlbum.noEncontrado}
          recargar={detalleAlbum.recargar}
        />
      ) : rutaPrincipal === "ingresar" ? (
        <InicioSesionPublico
          idioma={idioma}
          textos={textos}
          estados={textos?.estados}
          errores={textos?.errores}
          cargandoTextos={datos.cargando}
          errorTextos={datos.error}
          recargarTextos={datos.recargar}
          onIniciarSesion={(usuario, token, mantenerSesion) => {
            sesion.iniciarSesion(usuario, token, mantenerSesion);
            window.history.replaceState(null, "", "#inicio");
            setRuta("inicio");
          }}
          pie={pie}
        />
      ) : rutaPrincipal === "catalogo" || rutaPrincipal === "genero" ? (
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
          autenticado={Boolean(sesion.usuario)}
          estados={textos?.estados}
          errores={textos?.errores}
          general={textos?.general}
          {...inicio}
        />
      )}
      {!esInicioSesion && (
        <PiePublico
          textos={pie}
          onAbrirAccesibilidad={() => setPanelAccesibilidadAbierto(true)}
          onAbrirCookies={() => setPreferenciasCookiesAbiertas(true)}
        />
      )}

      {!esInicioSesion && (
        <PanelAccesibilidad
          abierto={panelAccesibilidadAbierto}
          textos={textosAccesibilidad}
          preferencias={preferenciasAccesibilidad}
          onCambiar={cambiarPreferenciaAccesibilidad}
          onCerrar={cerrarPanelAccesibilidad}
          onRestablecer={() => setPreferenciasAccesibilidad(PREFERENCIAS_ACCESIBILIDAD_DEFAULT)}
        />
      )}
      {!esInicioSesion && !consentimiento && textosCookies && (
        <BannerCookies
          textos={textosCookies}
          onAceptar={() => guardarConsentimientoCookies(true)}
          onRechazar={() => guardarConsentimientoCookies(false)}
          onConfigurar={() => setPreferenciasCookiesAbiertas(true)}
        />
      )}
      {!esInicioSesion && errorCookies && errorGuardarCookies && (
        <p className="cookies-error" role="alert">
          {errorGuardarCookies}
        </p>
      )}
      {!esInicioSesion && (
        <PreferenciasCookies
          abierto={preferenciasCookiesAbiertas}
          textos={textosCookies}
          analiticasGuardadas={consentimiento?.analytics}
          onGuardar={guardarConsentimientoCookies}
          onCerrar={cerrarPreferenciasCookies}
        />
      )}
    </div>
  );
}

export default App;
