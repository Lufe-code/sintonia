import { useEffect, useState } from "react";
import { obtenerJson } from "../config/api.js";

const LIMITE_ALBUMES_DESTACADOS = 6;
const TIEMPO_LIMITE_CARGA_MS = 12000;

function asegurarLista(valor) {
  return Array.isArray(valor) ? valor : [];
}

function obtenerMarcaTiempo(fechaPublicacion) {
  const marcaTiempo = new Date(fechaPublicacion).getTime();
  return Number.isNaN(marcaTiempo) ? 0 : marcaTiempo;
}

function compararPorFechaDescendente(albumActual, albumComparado) {
  return (
    obtenerMarcaTiempo(albumComparado.fechaPublicacion) -
    obtenerMarcaTiempo(albumActual.fechaPublicacion)
  );
}

function obtenerAlbumesConGenero(detalle) {
  const nombreGenero = detalle?.nombre;
  return asegurarLista(detalle?.albumes).map((album) => ({
    ...album,
    genero: nombreGenero,
  }));
}

function deduplicarAlbumesPorId(albumes) {
  return albumes.filter((album, indice, lista) => {
    return lista.findIndex((otroAlbum) => otroAlbum.id === album.id) === indice;
  });
}

function prepararAlbumesOrdenados(detalles) {
  const albumesConGenero = detalles.flatMap(obtenerAlbumesConGenero);
  return deduplicarAlbumesPorId(albumesConGenero).sort(compararPorFechaDescendente);
}

export function useInicioPublico() {
  const [generos, setGeneros] = useState([]);
  const [albumes, setAlbumes] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [albumesCatalogo, setAlbumesCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    let solicitudVigente = true;

    const temporizadorLimite = setTimeout(() => {
      controlador.abort();
    }, TIEMPO_LIMITE_CARGA_MS);

    async function cargarInicio() {
      setCargando(true);
      setError(false);

      try {
        const [respuestaAlbumes, respuestaGeneros] = await Promise.all([
          obtenerJson(`/albumes?orden=populares&limite=${LIMITE_ALBUMES_DESTACADOS}`, {
            signal: controlador.signal,
          }),
          obtenerJson("/generos", {
            signal: controlador.signal,
          }),
        ]);

        if (!Array.isArray(respuestaAlbumes?.datos)) {
          throw new Error("La respuesta no contiene una lista de álbumes.");
        }
        if (!Array.isArray(respuestaGeneros?.datos)) {
          throw new Error("La respuesta no contiene una lista de géneros.");
        }

        const listaGeneros = respuestaGeneros.datos;
        const detallesGeneros = await Promise.all(
          listaGeneros.map((genero) =>
            obtenerJson(`/generos/${encodeURIComponent(genero.id)}`, {
              signal: controlador.signal,
            }),
          ),
        );

        const albumesCatalogoLista = prepararAlbumesOrdenados(detallesGeneros);
        const albumesDestacados = respuestaAlbumes.datos.slice(0, LIMITE_ALBUMES_DESTACADOS);

        if (!solicitudVigente) {
          return;
        }

        setGeneros(listaGeneros);
        setAlbumes(albumesDestacados);
        setCatalogo(detallesGeneros);
        setAlbumesCatalogo(albumesCatalogoLista);
      } catch (errorCarga) {
        if (solicitudVigente) {
          console.error("Error al cargar el inicio público:", errorCarga);
          setError(true);
        }
      } finally {
        clearTimeout(temporizadorLimite);
        if (solicitudVigente) {
          setCargando(false);
        }
      }
    }

    cargarInicio();

    return () => {
      solicitudVigente = false;
      clearTimeout(temporizadorLimite);
      controlador.abort();
    };
  }, [intento]);

  return {
    generos,
    albumes,
    catalogo,
    albumesCatalogo,
    cargando,
    error,
    recargar: () => {
      setIntento((valorAnterior) => valorAnterior + 1);
    },
  };
}
