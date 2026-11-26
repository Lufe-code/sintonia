import { useEffect, useState } from "react";
import { obtenerJson } from "../config/api.js";

const TIEMPO_LIMITE_CARGA_MS = 12000;

export function useDetalleAlbum(albumId) {
  const [estado, setEstado] = useState({
    albumId,
    album: null,
    cargando: Boolean(albumId),
    error: false,
    noEncontrado: false,
  });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!albumId) {
      setEstado({
        albumId: null,
        album: null,
        cargando: false,
        error: false,
        noEncontrado: false,
      });
      return undefined;
    }

    const controlador = new AbortController();
    let solicitudVigente = true;
    const temporizadorLimite = setTimeout(
      () => controlador.abort(),
      TIEMPO_LIMITE_CARGA_MS,
    );

    async function cargarAlbum() {
      setEstado({
        albumId,
        album: null,
        cargando: true,
        error: false,
        noEncontrado: false,
      });

      try {
        const respuesta = await obtenerJson(`/albumes/${encodeURIComponent(albumId)}`, {
          signal: controlador.signal,
        });
        const detalle = respuesta?.datos ?? respuesta?.data ?? respuesta?.album ?? respuesta;

        if (!detalle || typeof detalle !== "object" || Array.isArray(detalle)) {
          throw new Error("The album endpoint returned an invalid response.");
        }

        if (solicitudVigente) {
          setEstado({
            albumId,
            album: detalle,
            cargando: false,
            error: false,
            noEncontrado: false,
          });
        }
      } catch (errorCarga) {
        if (solicitudVigente) {
          console.error("Error al cargar el detalle del álbum:", errorCarga);
          setEstado({
            albumId,
            album: null,
            cargando: false,
            error: true,
            noEncontrado: errorCarga?.message === "HTTP 404",
          });
        }
      } finally {
        clearTimeout(temporizadorLimite);
      }
    }

    cargarAlbum();

    return () => {
      solicitudVigente = false;
      clearTimeout(temporizadorLimite);
      controlador.abort();
    };
  }, [albumId, intento]);

  const estadoActual = estado.albumId === albumId
    ? estado
    : {
        albumId,
        album: null,
        cargando: Boolean(albumId),
        error: false,
        noEncontrado: false,
      };

  return {
    ...estadoActual,
    recargar: () => setIntento((valorAnterior) => valorAnterior + 1),
  };
}
