import { useEffect, useState } from "react";

const API_BASE = "https://yanethm-sintonia-api.fly.dev/api/v1";
const GENEROS_DESTACADOS = 6;

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
    const limite = setTimeout(() => controlador.abort(), 12000);
    let vigente = true;

    async function obtenerJson(url) {
      const respuesta = await fetch(url, { signal: controlador.signal });
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      return respuesta.json();
    }

    async function cargarInicio() {
      setCargando(true);
      setError(false);

      try {
        const respuestaGeneros = await obtenerJson(`${API_BASE}/generos`);
        if (!Array.isArray(respuestaGeneros.datos)) {
          throw new Error("La respuesta no contiene una lista de géneros.");
        }

        const listaGeneros = respuestaGeneros.datos;
        const detalles = await Promise.all(
          listaGeneros.map((genero) =>
            obtenerJson(`${API_BASE}/generos/${encodeURIComponent(genero.id)}`),
          ),
        );
        const albumesCatalogo = detalles
          .flatMap((detalle) =>
            (Array.isArray(detalle.albumes) ? detalle.albumes : []).map(
              (album) => ({ ...album, genero: detalle.nombre }),
            ),
          )
          .filter(
            (album, indice, lista) =>
              lista.findIndex((otro) => otro.id === album.id) === indice,
          )
          .sort(
            (a, b) =>
              new Date(b.fechaPublicacion).getTime() -
              new Date(a.fechaPublicacion).getTime(),
          );
        const albumesDestacados = detalles
          .slice(0, GENEROS_DESTACADOS)
          .flatMap((detalle) =>
            (Array.isArray(detalle.albumes) ? detalle.albumes : []).map(
              (album) => ({ ...album, genero: detalle.nombre }),
            ),
          )
          .filter(
            (album, indice, lista) =>
              lista.findIndex((otro) => otro.id === album.id) === indice,
          )
          .sort(
            (a, b) =>
              new Date(b.fechaPublicacion).getTime() -
              new Date(a.fechaPublicacion).getTime(),
          )
          .slice(0, 6);

        if (vigente) {
          setGeneros(listaGeneros);
          setAlbumes(albumesDestacados);
          setCatalogo(detalles);
          setAlbumesCatalogo(albumesCatalogo);
        }
      } catch (errorCarga) {
        if (vigente) {
          console.error("Error al cargar el inicio público:", errorCarga);
          setError(true);
        }
      } finally {
        clearTimeout(limite);
        if (vigente) setCargando(false);
      }
    }

    cargarInicio();
    return () => {
      vigente = false;
      clearTimeout(limite);
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
    recargar: () => setIntento((valor) => valor + 1),
  };
}
