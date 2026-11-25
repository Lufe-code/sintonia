import { useEffect } from "react";
import { obtenerJson } from "../config/api.js";

const RUTAS_TEMA = ["/tema", "/configuracion", "/tokens"];

function obtenerMapaTokens(respuesta) {
  if (!respuesta || typeof respuesta !== "object") {
    return null;
  }

  const candidatos = [
    respuesta.tokens,
    respuesta.tema?.tokens,
    respuesta.tema,
    respuesta.configuracion?.tokens,
    respuesta.configuracion?.tema,
    respuesta.datos?.tokens,
    respuesta.datos?.tema,
    respuesta.datos,
    respuesta,
  ];

  for (const candidato of candidatos) {
    if (candidato && typeof candidato === "object" && !Array.isArray(candidato)) {
      return candidato;
    }
  }

  return null;
}

function aplicarTokens(tokens) {
  if (!tokens || typeof tokens !== "object") {
    return;
  }

  const raiz = document.documentElement;

  Object.entries(tokens).forEach(([clave, valor]) => {
    if (valor == null || typeof valor === "object") {
      return;
    }

    const nombreVariable = clave.startsWith("--") ? clave : `--${clave}`;
    raiz.style.setProperty(nombreVariable, String(valor));
  });
}

export function useTema() {
  useEffect(() => {
    const controlador = new AbortController();
    let solicitudVigente = true;

    async function cargarTema() {
      for (const ruta of RUTAS_TEMA) {
        try {
          const respuesta = await obtenerJson(ruta, {
            signal: controlador.signal,
          });

          if (!solicitudVigente) {
            return;
          }

          const tokens = obtenerMapaTokens(respuesta);
          if (tokens) {
            aplicarTokens(tokens);
            return;
          }
        } catch {
          if (controlador.signal.aborted) {
            return;
          }
        }
      }
    }

    cargarTema();

    return () => {
      solicitudVigente = false;
      controlador.abort();
    };
  }, []);
}
