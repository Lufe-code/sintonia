import { useEffect, useId, useState } from "react";
import { API_BASE_URL } from "../config/api.js";
import AvisoEstado from "./AvisoEstado.jsx";
import Icono from "./Icono.jsx";
import LogoSintonia from "./LogoSintonia.jsx";
import imagenPresentacion from "../assets/icono portada/Collage.png";
import portadaCantoDeGuadua from "../assets/portada tarjetas/album-canto-de-guadua.png";
import portadaFrailejonAcustico from "../assets/portada tarjetas/album-frailejon-acustico.png";
import portadaMareaViva from "../assets/portada tarjetas/album-marea-viva.png";
import portadaPleamar from "../assets/portada tarjetas/album-pleamar.png";
import portadaUno from "../assets/portada tarjetas/1.png";
import portadaDos from "../assets/portada tarjetas/2.png";
import portadaTres from "../assets/portada tarjetas/3.png";
import portadaCuatro from "../assets/portada tarjetas/4.png";
import "../styles/InicioSesionPublico.css";

const PORTADAS_PRESENTACION = [
  portadaCantoDeGuadua,
  portadaDos,
  portadaUno,
  portadaCuatro,
  portadaTres,
  portadaPleamar,
  portadaMareaViva,
  portadaFrailejonAcustico,
];

function obtenerMensajeError(textos, codigo, respuesta) {
  const pagina = textos?.paginas?.ingresar;
  const errores = pagina?.errores;

  if (codigo === "credenciales_invalidas") {
    return errores?.credenciales;
  }
  if (codigo === "demasiadas_peticiones") {
    const espera = respuesta?.headers?.get("Retry-After");
    const plantilla = errores?.demasiadosIntentos?.texto
      || textos?.errores?.demasiadas_peticiones;
    return {
      titulo: errores?.demasiadosIntentos?.titulo,
      texto: plantilla?.replace(/\{segundos\}/g, espera || ""),
    };
  }
  return {
    titulo: textos?.estados?.error?.titulo,
    texto: textos?.errores?.error_interno,
  };
}

function MensajeFormulario({ titulo, texto, accion, textoAccion }) {
  if (!titulo && !texto) {
    return null;
  }

  return (
    <div className="inicio-sesion-aviso" role="alert">
      {titulo && <strong>{titulo}</strong>}
      {texto && <p>{texto}</p>}
      {accion && textoAccion && (
        <button type="button" onClick={accion}>
          {textoAccion}
        </button>
      )}
    </div>
  );
}

export default function InicioSesionPublico({
  idioma,
  textos,
  estados,
  errores,
  cargandoTextos,
  errorTextos,
  recargarTextos,
  onIniciarSesion,
  pie,
}) {
  const id = useId();
  const pagina = textos?.paginas?.ingresar;
  const formulario = pagina?.formulario;
  const erroresFormulario = pagina?.errores;
  const logo = textos?.navbar?.logo;
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [mantenerSesion, setMantenerSesion] = useState(false);
  const [mostrarClave, setMostrarClave] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [erroresCampos, setErroresCampos] = useState({});

  useEffect(() => {
    setAviso(null);
    setErroresCampos({});
  }, [idioma]);

  if (!pagina || !formulario) {
    return (
      <main className="inicio-sesion inicio-sesion-sin-textos" lang={idioma}>
        {cargandoTextos ? (
          <p role="status">{estados?.cargando?.titulo}</p>
        ) : errorTextos ? (
          <AvisoEstado
            mensaje={errores?.error_interno}
            accion={recargarTextos}
            textoAccion={textos?.general?.acciones?.reintentar}
            tipo="alert"
            className="inicio-sesion-aviso"
          />
        ) : null}
      </main>
    );
  }

  async function autenticar() {
    setCargando(true);
    setAviso(null);
    setErroresCampos({});

    try {
      const respuesta = await fetch(`${API_BASE_URL}/sesion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: mantenerSesion ? "include" : "omit",
        body: JSON.stringify({ correo: correo.trim(), clave }),
      });
      const datos = await respuesta.json();

      if (respuesta.status === 401) {
        setAviso(erroresFormulario.credenciales);
        return;
      }

      if (respuesta.status === 422) {
        const campos = datos?.error?.campos;
        if (campos && typeof campos === "object") {
          setErroresCampos(campos);
        } else {
          setAviso({
            titulo: erroresFormulario.camposObligatorios?.titulo,
            texto: datos?.error?.mensaje || errores?.validacion,
          });
        }
        return;
      }

      if (respuesta.status === 429) {
        setAviso(obtenerMensajeError(textos, "demasiadas_peticiones", respuesta));
        return;
      }

      if (!respuesta.ok) {
        setAviso(obtenerMensajeError(textos, datos?.error?.codigo, respuesta));
        return;
      }

      if (!datos?.usuario || typeof datos?.token !== "string") {
        throw new Error("La respuesta de sesión no contiene los datos esperados.");
      }

      onIniciarSesion(datos.usuario, datos.token, mantenerSesion);
    } catch (error) {
      if (error instanceof TypeError || error?.name === "AbortError") {
        setAviso(erroresFormulario.conexion);
      } else {
        console.error("No se pudo completar el inicio de sesión:", error);
        setAviso({
          titulo: estados?.error?.titulo,
          texto: errores?.error_interno,
        });
      }
    } finally {
      setCargando(false);
    }
  }

  function enviarFormulario(evento) {
    evento.preventDefault();
    const campos = {};
    if (!correo.trim()) {
      campos.correo = erroresFormulario.correoObligatorio;
    }
    if (!clave) {
      campos.clave = erroresFormulario.claveObligatoria;
    }

    if (Object.keys(campos).length > 0) {
      setErroresCampos(campos);
      setAviso(erroresFormulario.camposObligatorios);
      return;
    }

    autenticar();
  }

  function actualizarCorreo(valor) {
    setCorreo(valor);
    setErroresCampos((anteriores) => ({ ...anteriores, correo: undefined }));
    setAviso(null);
  }

  function actualizarClave(valor) {
    setClave(valor);
    setErroresCampos((anteriores) => ({ ...anteriores, clave: undefined }));
    setAviso(null);
  }

  return (
    <main className="inicio-sesion" lang={idioma}>
      <section className="inicio-sesion-columna-formulario">
        <div className="inicio-sesion-logo-escritorio">
          <LogoSintonia ariaLabel={logo?.aria} nombre={logo?.nombre} />
        </div>
        <div className="inicio-sesion-contenido">
          <div className="inicio-sesion-presentacion-movil">
            <div className="inicio-sesion-ilustracion-movil">
              <img src={imagenPresentacion} alt="" decoding="async" />
            </div>
            <LogoSintonia ariaLabel={logo?.aria} nombre={logo?.nombre} />
          </div>
          <section className="inicio-sesion-panel" aria-labelledby={`${id}-titulo`}>
            <header className="inicio-sesion-cabecera">
              <h2 id={`${id}-titulo`}>{formulario.titulo}</h2>
              <p>{formulario.subtitulo}</p>
            </header>

            <MensajeFormulario
              titulo={aviso?.titulo}
              texto={aviso?.texto}
              accion={
                aviso === erroresFormulario.conexion
                  ? autenticar
                  : undefined
              }
              textoAccion={erroresFormulario.conexion?.botones?.reintentar}
            />

            <form
              className="inicio-sesion-formulario"
              onSubmit={enviarFormulario}
              noValidate
              aria-busy={cargando}
            >
              <div className="inicio-sesion-campo">
                <label htmlFor={`${id}-correo`}>{formulario.etiquetas?.correo}</label>
                <input
                  id={`${id}-correo`}
                  name="correo"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder={formulario.placeholders?.correo}
                  value={correo}
                  onChange={(evento) => actualizarCorreo(evento.target.value)}
                  aria-invalid={Boolean(erroresCampos.correo)}
                  aria-describedby={erroresCampos.correo ? `${id}-error-correo` : undefined}
                  required
                  disabled={cargando}
                />
                {erroresCampos.correo && (
                  <span className="inicio-sesion-error-campo" id={`${id}-error-correo`}>
                    {erroresCampos.correo}
                  </span>
                )}
              </div>

              <div className="inicio-sesion-campo">
                <label htmlFor={`${id}-clave`}>{formulario.etiquetas?.clave}</label>
                <div className="inicio-sesion-clave">
                  <input
                    id={`${id}-clave`}
                    name="clave"
                    type={mostrarClave ? "text" : "password"}
                    autoComplete="current-password"
                    value={clave}
                    onChange={(evento) => actualizarClave(evento.target.value)}
                    aria-invalid={Boolean(erroresCampos.clave)}
                    aria-describedby={erroresCampos.clave ? `${id}-error-clave` : undefined}
                    required
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    className="inicio-sesion-ver-clave"
                    aria-label={
                      mostrarClave
                        ? formulario.botones?.ocultarClave
                        : formulario.botones?.mostrarClave
                    }
                    aria-pressed={mostrarClave}
                    onClick={() => setMostrarClave((valor) => !valor)}
                  >
                    <Icono nombre={mostrarClave ? "ocultarClave" : "mostrarClave"} />
                  </button>
                </div>
                {erroresCampos.clave && (
                  <span className="inicio-sesion-error-campo" id={`${id}-error-clave`}>
                    {erroresCampos.clave}
                  </span>
                )}
              </div>

              <div className="inicio-sesion-opciones">
                <label className="inicio-sesion-mantener">
                  <input
                    type="checkbox"
                    checked={mantenerSesion}
                    onChange={(evento) => setMantenerSesion(evento.target.checked)}
                  />
                  <span>{formulario.etiquetas?.mantenerSesion}</span>
                </label>
                <a href="#recuperar-clave">{formulario.enlaces?.olvidasteClave}</a>
              </div>

              <button className="inicio-sesion-enviar" type="submit" disabled={cargando}>
                {cargando ? formulario.mensajes?.ingresando : formulario.botones?.ingresar}
              </button>
            </form>

            <p className="inicio-sesion-registro">
              <span>{formulario.mensajes?.sinCuenta}</span>{" "}
              <a href="#registro">{formulario.enlaces?.crearCuenta}</a>
            </p>
          </section>
        </div>
        <small className="inicio-sesion-legal">
          {pie?.legal?.derechos?.replace(/\{anio\}/g, String(new Date().getFullYear()))}
        </small>
      </section>

      <section
        className="inicio-sesion-presentacion-escritorio"
        aria-label={pagina.presentacion?.titulo}
      >
        <div className="inicio-sesion-mosaico" aria-hidden="true">
          {PORTADAS_PRESENTACION.map((portada, indice) => (
            <img src={portada} alt="" key={`${portada}-${indice}`} decoding="async" />
          ))}
        </div>
        <div className="inicio-sesion-presentacion-texto">
          <h1>{pagina.presentacion?.titulo}</h1>
          <p>{pagina.presentacion?.texto}</p>
        </div>
      </section>
    </main>
  );
}
