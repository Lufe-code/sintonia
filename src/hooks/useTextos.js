import { useEffect, useState } from "react";
import { obtenerJson } from "../config/api.js";

const SECCIONES_TEXTO = [
  "navbar",
  "menuMovil",
  "footer",
  "cookies",
  "accesibilidad",
  "paginas",
  "componentes",
  "estados",
  "errores",
  "general",
].join(",");

function esTexto(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

function validarTextos(datos) {
  const textos = datos?.textos;
  const inicio = textos?.paginas?.inicioPublico;
  if (!textos || typeof textos !== "object") {
    throw new Error("La respuesta no contiene textos.");
  }
  if (
    !esTexto(textos?.navbar?.enlaces?.inicio)
    || !esTexto(textos?.navbar?.enlaces?.catalogo)
    || !esTexto(inicio?.hero?.titulo)
    || !esTexto(inicio?.hero?.subtitulo)
  ) {
    throw new Error("La respuesta no contiene los textos mínimos esperados.");
  }
  return textos;
}

export function useTextos(idioma) {
  const [textos, setTextos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 12000);
    let vigente = true;
    setCargando(true);
    setError(false);
    setTextos(null);

    async function cargarTextos() {
      try {
        const parametros = new URLSearchParams({ idioma, seccion: SECCIONES_TEXTO });
        const datos = await obtenerJson(`/textos?${parametros}`, {
          signal: controlador.signal,
        });
        if (vigente) setTextos(validarTextos(datos));
      } catch (errorCarga) {
        if (vigente) {
          console.error("Error al cargar los textos:", errorCarga);
          setError(true);
        }
      } finally {
        clearTimeout(limite);
        if (vigente) setCargando(false);
      }
    }

    cargarTextos();
    return () => {
      vigente = false;
      clearTimeout(limite);
      controlador.abort();
    };
  }, [idioma, intento]);

  return {
    textos,
    cargando,
    error,
    recargar: () => setIntento((valor) => valor + 1),
  };
}
