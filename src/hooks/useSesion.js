import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config/api.js";

const TOKEN_ALMACENADO = "sintonia-token";

function leerTokenAlmacenado() {
  try {
    return localStorage.getItem(TOKEN_ALMACENADO)
      || sessionStorage.getItem(TOKEN_ALMACENADO)
      || "";
  } catch (error) {
    console.error("No se pudo leer la sesión guardada:", error);
    return "";
  }
}

function borrarTokenAlmacenado() {
  try {
    localStorage.removeItem(TOKEN_ALMACENADO);
    sessionStorage.removeItem(TOKEN_ALMACENADO);
  } catch (error) {
    console.error("No se pudo borrar el token guardado:", error);
  }
}

export function useSesion() {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState("");
  const [cargando, setCargando] = useState(Boolean(leerTokenAlmacenado()));
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const revision = useRef(0);

  useEffect(() => {
    const tokenGuardado = leerTokenAlmacenado();
    if (!tokenGuardado) {
      setCargando(false);
      return undefined;
    }

    const controlador = new AbortController();
    let vigente = true;
    const revisionActual = ++revision.current;

    async function cargarSesion() {
      setCargando(true);
      setError(false);

      try {
        const respuesta = await fetch(`${API_BASE_URL}/sesion`, {
          signal: controlador.signal,
          headers: { Authorization: `Bearer ${tokenGuardado}` },
        });

        if (respuesta.status === 401) {
          if (vigente && revisionActual === revision.current) {
            borrarTokenAlmacenado();
            setUsuario(null);
            setToken("");
          }
          return;
        }

        if (!respuesta.ok) {
          throw new Error(`La API rechazó la consulta de sesión (${respuesta.status}).`);
        }

        const cuenta = await respuesta.json();
        if (!cuenta?.id || !cuenta?.nombre) {
          throw new Error("La respuesta de sesión no contiene una cuenta válida.");
        }

        if (vigente && revisionActual === revision.current) {
          setUsuario(cuenta);
          setToken(tokenGuardado);
        }
      } catch (errorCarga) {
        if (!controlador.signal.aborted && vigente && revisionActual === revision.current) {
          console.error("No se pudo recuperar la sesión:", errorCarga);
          setError(true);
        }
      } finally {
        if (vigente && revisionActual === revision.current) {
          setCargando(false);
        }
      }
    }

    cargarSesion();

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [intento]);

  function iniciarSesion(cuenta, nuevoToken, mantenerSesion) {
    revision.current += 1;
    setUsuario(cuenta);
    setToken(nuevoToken);
    setCargando(false);
    setError(false);

    try {
      const almacen = mantenerSesion ? localStorage : sessionStorage;
      almacen.setItem(TOKEN_ALMACENADO, nuevoToken);
      (mantenerSesion ? sessionStorage : localStorage).removeItem(TOKEN_ALMACENADO);
    } catch (errorAlmacenamiento) {
      console.error("No se pudo guardar la sesión en este navegador:", errorAlmacenamiento);
    }
  }

  async function cerrarSesion() {
    try {
      const respuesta = await fetch(`${API_BASE_URL}/sesion`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!respuesta.ok && respuesta.status !== 401) {
        throw new Error(`La API rechazó el cierre de sesión (${respuesta.status}).`);
      }

      borrarTokenAlmacenado();
      revision.current += 1;
      setUsuario(null);
      setToken("");
      setError(false);
      return true;
    } catch (errorCierre) {
      console.error("No se pudo cerrar la sesión:", errorCierre);
      setError(true);
      return false;
    }
  }

  return {
    usuario,
    cargando,
    error,
    iniciarSesion,
    cerrarSesion,
    recargar: () => setIntento((valor) => valor + 1),
  };
}
