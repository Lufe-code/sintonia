import { useEffect, useMemo, useState } from "react";
import portadaAlbumUno from "../assets/portada tarjetas/1.png";
import portadaAlbumDos from "../assets/portada tarjetas/2.png";
import portadaAlbumTres from "../assets/portada tarjetas/3.png";
import portadaAlbumCuatro from "../assets/portada tarjetas/4.png";
import portadaAlbumCinco from "../assets/portada tarjetas/5.png";
import imagenGeneroCantoDeGuadua from "../assets/portada tarjetas/album-canto-de-guadua.png";
import imagenGeneroMusicaAndina from "../assets/portada tarjetas/genero-musica-andina.png";
import imagenGeneroMareaViva from "../assets/portada tarjetas/album-marea-viva.png";
import imagenGeneroFrailejonAcustico from "../assets/portada tarjetas/album-frailejon-acustico.png";
import imagenGeneroEnVivoEnElRuiz from "../assets/portada tarjetas/album-en-vivo-en-el-ruiz.png";
import imagenGeneroPleamar from "../assets/portada tarjetas/album-pleamar.png";
import imagenGeneroInstrumental from "../assets/portada tarjetas/genero-instrumental.png";
import { obtenerPortadaAlbum } from "../portadasAlbum.js";
import "../styles/CatalogoPublico.css";

const IMAGENES_GENERO_ORDENADAS = [
  imagenGeneroCantoDeGuadua,
  portadaAlbumUno,
  portadaAlbumDos,
  portadaAlbumCuatro,
  portadaAlbumCinco,
  portadaAlbumTres,
  imagenGeneroMusicaAndina,
  imagenGeneroMareaViva,
  imagenGeneroFrailejonAcustico,
  imagenGeneroEnVivoEnElRuiz,
  imagenGeneroPleamar,
  imagenGeneroInstrumental,
];
const LIMITE_ALBUMES_DESTACADOS = 6;

function asegurarLista(valor) {
  return Array.isArray(valor) ? valor : [];
}

function asegurarTexto(valor) {
  return typeof valor === "string" ? valor : "";
}

function normalizarTexto(valor) {
  return asegurarTexto(valor)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function obtenerPrimerTextoValido(...valores) {
  for (const valor of valores) {
    if (typeof valor === "string" && valor.trim()) {
      return valor;
    }
  }
  return "";
}

function leerGeneroDesdeUbicacion() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash.startsWith("genero/")) {
    return null;
  }

  const identificador = hash.slice("genero/".length);
  if (!identificador) {
    return null;
  }

  try {
    return decodeURIComponent(identificador);
  } catch (error) {
    console.error("No se pudo leer el género desde la URL:", error);
    return identificador;
  }
}

function obtenerImagenDesdeApi(registro, claves) {
  for (const clave of claves) {
    const valor = clave.split(".").reduce((acumulado, segmento) => acumulado?.[segmento], registro);
    if (typeof valor === "string" && valor.trim()) {
      return valor;
    }
  }
  return "";
}

function obtenerIlustracionGenero(genero, indiceGenero) {
  const imagenApi = obtenerImagenDesdeApi(genero, [
    "ilustracion",
    "imagen",
    "imagenUrl",
    "urlImagen",
    "portada.imagen",
    "portada.imagenUrl",
    "portada.url",
  ]);

  if (imagenApi) {
    return imagenApi;
  }

  return IMAGENES_GENERO_ORDENADAS[indiceGenero % IMAGENES_GENERO_ORDENADAS.length];
}

function obtenerColorGenero(genero) {
  return obtenerPrimerTextoValido(
    genero?.portada?.fondo,
    genero?.colorHex,
    genero?.color,
    "var(--marca-secundario)",
  );
}

function formatearFechaPublicacion(fecha, idioma) {
  const textoFecha = asegurarTexto(fecha).trim();
  if (!textoFecha) {
    return "";
  }

  const valorFecha = /^\d{4}-\d{2}-\d{2}$/.test(textoFecha) ? `${textoFecha}T00:00:00` : textoFecha;
  const fechaLocal = new Date(valorFecha);
  if (Number.isNaN(fechaLocal.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(idioma, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(fechaLocal);
}

function formatearDuracion(valor) {
  if (typeof valor === "number" && Number.isFinite(valor) && valor >= 0) {
    const totalSegundos = Math.round(valor > 1000 ? valor / 1000 : valor);
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = String(totalSegundos % 60).padStart(2, "0");
    return `${minutos}:${segundos}`;
  }

  const texto = asegurarTexto(valor).trim();
  if (!texto) {
    return "";
  }

  if (/^\d+:\d{2}$/.test(texto)) {
    return texto;
  }

  const segundos = Number(texto);
  if (Number.isFinite(segundos) && segundos >= 0) {
    return formatearDuracion(segundos);
  }

  return texto;
}

function obtenerTextosCatalogo(textos, estados, errores, general) {
  const encabezado = textos?.encabezado || {};
  const textosGenero = textos?.genero || {};
  const panel = textos?.panel || {};
  const acciones = textos?.acciones || {};
  const seo = textos?.seo || {};
  const destacados = textos?.destacados || {};
  const textosArtistas = textos?.artistas || textos?.secciones?.artistas || {};
  const textosCanciones =
    textos?.cancionesMasEscuchadas || textos?.canciones || textos?.pistas || textos?.secciones?.cancionesMasEscuchadas || {};

  return {
    tituloEncabezado: obtenerPrimerTextoValido(encabezado.titulo, seo.tituloCatalogo, "Catálogo musical"),
    subtituloEncabezado: obtenerPrimerTextoValido(
      encabezado.subtitulo,
      "Explora por género o abre un álbum para ver sus canciones.",
    ),
    tituloGeneros: obtenerPrimerTextoValido(textosGenero.etiqueta, textos?.generos?.titulo, "Explorar por género"),
    tituloAlbumes: obtenerPrimerTextoValido(destacados.titulo, textos?.albumes?.titulo, "Álbumes destacados"),
    tituloPanelGenero: obtenerPrimerTextoValido(panel.genero, textos?.albumes?.tituloPorGenero, "Álbumes del género"),
    tituloArtistas: obtenerPrimerTextoValido(textosArtistas.titulo, textosGenero.artistas, "Artistas"),
    tituloCanciones: obtenerPrimerTextoValido(
      textosCanciones.titulo,
      textosGenero.cancionesMasEscuchadas,
      textosGenero.canciones,
      "Canciones más escuchadas",
    ),
    enlaceDescubrirMas: obtenerPrimerTextoValido(
      destacados.enlace,
      destacados.enlaces?.descubrirMas,
      acciones.verCatalogoCompleto,
      "Descubrir más",
    ),
    verCatalogoCompleto: obtenerPrimerTextoValido(acciones.verCatalogoCompleto, "Ver catálogo completo"),
    seoTituloCatalogo: asegurarTexto(seo.tituloCatalogo),
    mensajeCargando: asegurarTexto(estados?.cargando?.mensaje),
    mensajeVacioGenerico: asegurarTexto(estados?.vacio?.generico?.mensaje),
    mensajeVacioBusqueda: asegurarTexto(estados?.vacio?.busqueda?.descripcion),
    mensajeErrorConexion: asegurarTexto(errores?.catalogo?.sin_conexion || estados?.error?.mensaje),
    textoReintentar: asegurarTexto(general?.acciones?.reintentar || estados?.error?.accion),
    textoBusqueda: asegurarTexto(textos?.busqueda),
  };
}

export default function CatalogoPublico({
  idioma,
  textos,
  estados,
  errores,
  general,
  generos = [],
  albumes = [],
  catalogo = [],
  busqueda = "",
  cargando,
  error,
  recargar,
}) {
  const listaGeneros = asegurarLista(generos);
  const listaCatalogo = asegurarLista(catalogo);
  const listaAlbumes = asegurarLista(albumes);
  const textosCatalogo = obtenerTextosCatalogo(textos, estados, errores, general);
  const [generoActivoId, setGeneroActivoId] = useState(leerGeneroDesdeUbicacion);

  useEffect(() => {
    function sincronizarGeneroDesdeHash() {
      const identificadorDesdeHash = leerGeneroDesdeUbicacion();
      setGeneroActivoId((identificadorActual) => {
        if (normalizarTexto(identificadorActual) === normalizarTexto(identificadorDesdeHash)) {
          return identificadorActual;
        }
        return identificadorDesdeHash;
      });
    }

    window.addEventListener("hashchange", sincronizarGeneroDesdeHash);
    return () => window.removeEventListener("hashchange", sincronizarGeneroDesdeHash);
  }, []);

  const generoActivo = useMemo(() => {
    if (!generoActivoId) {
      return null;
    }

    const identificadorNormalizado = normalizarTexto(generoActivoId);
    return (
      listaCatalogo.find((genero) => normalizarTexto(genero?.id) === identificadorNormalizado) ||
      listaGeneros.find((genero) => normalizarTexto(genero?.id) === identificadorNormalizado) ||
      null
    );
  }, [generoActivoId, listaCatalogo, listaGeneros]);

  useEffect(() => {
    if (!generoActivoId || generoActivo || cargando) {
      return;
    }

    const hayDatosDeGeneros = listaGeneros.length > 0 || listaCatalogo.length > 0;
    if (!hayDatosDeGeneros) {
      return;
    }

    setGeneroActivoId(null);
  }, [generoActivoId, generoActivo, cargando, listaGeneros, listaCatalogo]);

  const terminoBusquedaNormalizado = normalizarTexto(busqueda);
  const albumesBase = generoActivo
    ? asegurarLista(listaCatalogo.find((genero) => genero?.id === generoActivo.id)?.albumes)
    : listaAlbumes;

  const albumesFiltrados = albumesBase.filter((album) => {
    if (!terminoBusquedaNormalizado) {
      return true;
    }

    return [album?.titulo, album?.artista?.nombre, album?.genero, generoActivo?.nombre].some((valor) =>
      normalizarTexto(valor).includes(terminoBusquedaNormalizado),
    );
  });

  const esVistaDestacados = !generoActivo && !terminoBusquedaNormalizado;
  const albumesVisibles = esVistaDestacados
    ? albumesFiltrados.slice(0, LIMITE_ALBUMES_DESTACADOS)
    : albumesFiltrados;

  const nombreGeneroActivo = asegurarTexto(generoActivo?.nombre);
  const artistasGenero = generoActivo
    ? asegurarLista(generoActivo?.artistas || generoActivo?.artists || generoActivo?.listaArtistas)
    : [];
  const cancionesGenero = generoActivo
    ? asegurarLista(
        generoActivo?.cancionesMasEscuchadas ||
          generoActivo?.topCanciones ||
          generoActivo?.canciones ||
          generoActivo?.pistas ||
          generoActivo?.tracks,
      )
    : [];
  const titulo = nombreGeneroActivo
    ? `${textosCatalogo.tituloGeneros}: ${nombreGeneroActivo}`
    : textosCatalogo.seoTituloCatalogo || textosCatalogo.tituloEncabezado;
  const subtitulo = asegurarTexto(generoActivo?.descripcion) || textosCatalogo.subtituloEncabezado;
  const plantillaTituloAlbumesGenero = obtenerPrimerTextoValido(
    textos?.albumes?.tituloPorGenero,
    textos?.panel?.tituloConGenero,
    textos?.panel?.generoConNombre,
  );
  const tituloAlbumesGenero = nombreGeneroActivo
    ? plantillaTituloAlbumesGenero.replace(/\{genero\}|\{nombre\}/gi, nombreGeneroActivo) ||
      `${textosCatalogo.tituloPanelGenero} ${nombreGeneroActivo}`.trim()
    : textosCatalogo.tituloPanelGenero;
  const mensajeError = error ? textosCatalogo.mensajeErrorConexion : "";
  const mensajeVacio = terminoBusquedaNormalizado
    ? textosCatalogo.mensajeVacioBusqueda
    : textosCatalogo.mensajeVacioGenerico;

  return (
    <main className="catalogo-pagina ancho-home" id="catalogo">
      <header className="catalogo-titulo">
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </header>

      <AvisoEstado
        mensaje={mensajeError}
        accion={recargar}
        textoAccion={textosCatalogo.textoReintentar}
      />

      <section className="catalogo-generos" aria-labelledby="titulo-generos-catalogo">
        <h2 id="titulo-generos-catalogo">{textosCatalogo.tituloGeneros}</h2>
        <div className="rejilla-generos">
          {listaGeneros.map((genero, indiceGenero) => {
            const generoEstaActivo = generoActivo?.id === genero?.id;
            const ilustracionGenero = obtenerIlustracionGenero(genero, indiceGenero);

            return (
              <a
                className="genero-item"
                href={generoEstaActivo ? "#catalogo" : `#genero/${encodeURIComponent(genero?.id || "")}`}
                key={genero?.id || `${genero?.nombre || "genero"}-${indiceGenero}`}
                aria-current={generoEstaActivo ? "page" : undefined}
                style={{ "--color-genero": obtenerColorGenero(genero) }}
              >
                <img
                  className="genero-ilustracion"
                  src={ilustracionGenero}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span className="genero-nombre">{genero?.nombre}</span>
              </a>
            );
          })}
        </div>
      </section>

      {generoActivo && artistasGenero.length > 0 && (
        <section className="catalogo-artistas" aria-labelledby="titulo-artistas-genero">
          <h2 id="titulo-artistas-genero">{textosCatalogo.tituloArtistas}</h2>
          <div className="catalogo-artistas-lista">
            {artistasGenero.map((artista, indiceArtista) => {
              const nombreArtista = obtenerPrimerTextoValido(artista?.nombre, artista?.name);
              const etiquetaArtista = obtenerPrimerTextoValido(
                artista?.subtitulo,
                artista?.etiqueta,
                artista?.rol,
                artista?.tipo,
                artista?.genero,
                nombreGeneroActivo,
              );
              const imagenArtista = obtenerImagenDesdeApi(artista, [
                "imagen",
                "imagenUrl",
                "urlImagen",
                "foto",
                "avatar",
                "portada.url",
                "portada.imagenUrl",
                "portada.imagen",
              ]);
              const colorArtista = obtenerPrimerTextoValido(
                artista?.color,
                artista?.colorHex,
                artista?.portada?.fondo,
                obtenerColorGenero(generoActivo),
              );

              return (
                <article className="catalogo-artista" key={artista?.id || `${nombreArtista || "artista"}-${indiceArtista}`}>
                  <div className="catalogo-artista-portada" style={{ background: colorArtista, overflow: "hidden" }}>
                    {imagenArtista ? (
                      <img
                        src={imagenArtista}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : null}
                  </div>
                  <h3>{nombreArtista}</h3>
                  <p>{etiquetaArtista}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {cargando && albumesVisibles.length === 0 && artistasGenero.length === 0 && cancionesGenero.length === 0 ? (
        <p className="estado-catalogo" role="status">{textosCatalogo.mensajeCargando}</p>
      ) : albumesVisibles.length > 0 ? (
        <section
          className={`catalogo-albumes${generoActivo ? " catalogo-albumes-detalle" : ""}`}
          aria-labelledby="titulo-albumes-catalogo"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", marginBottom: "10px" }}>
            <h2 id="titulo-albumes-catalogo" style={{ margin: 0 }}>
              {generoActivo ? tituloAlbumesGenero : textosCatalogo.tituloAlbumes}
            </h2>
            {!generoActivo && textosCatalogo.enlaceDescubrirMas ? (
              <a href="#catalogo" style={{ color: "var(--texto-secundario)", fontSize: "0.8rem", textDecoration: "none" }}>
                {textosCatalogo.enlaceDescubrirMas} <span aria-hidden="true">→</span>
              </a>
            ) : null}
          </div>
          <div className="catalogo-albumes-lista">
            {albumesVisibles.map((album, indiceAlbum) => {
              const portadaAlbum = obtenerPortadaAlbum(album, indiceAlbum);
              const contenidoTarjeta = (
                <>
                  <img className="portada-album portada-catalogo" src={portadaAlbum} alt="" loading="lazy" decoding="async" />
                  <div className="datos-album">
                    <div>
                      <h3>{album?.titulo}</h3>
                      <p>{album?.artista?.nombre}</p>
                    </div>
                    <span>{album?.genero || nombreGeneroActivo}</span>
                  </div>
                  <time dateTime={album?.fechaPublicacion}>
                    {formatearFechaPublicacion(album?.fechaPublicacion, idioma)}
                  </time>
                </>
              );

              return album?.id ? (
                <a
                  className="tarjeta-album tarjeta-album-enlace"
                  href={`#album/${encodeURIComponent(album.id)}`}
                  key={album.id}
                >
                  {contenidoTarjeta}
                </a>
              ) : (
                <article className="tarjeta-album" key={`${album?.titulo || "album"}-${indiceAlbum}`}>
                  {contenidoTarjeta}
                </article>
              );
            })}
          </div>
          {generoActivo && (
            <p className="catalogo-ver-mas">
              <a href="#catalogo">{textosCatalogo.verCatalogoCompleto}</a>
            </p>
          )}
        </section>
      ) : !generoActivo || (artistasGenero.length === 0 && cancionesGenero.length === 0) ? (
        <p className="estado-catalogo">{mensajeVacio || textosCatalogo.textoBusqueda}</p>
      ) : null}

      {generoActivo && cancionesGenero.length > 0 && (
        <section className="catalogo-pistas" aria-labelledby="titulo-canciones-genero">
          <h2 id="titulo-canciones-genero">{textosCatalogo.tituloCanciones}</h2>
          <ol>
            {cancionesGenero.map((cancion, indiceCancion) => {
              const tituloCancion = obtenerPrimerTextoValido(cancion?.titulo, cancion?.nombre, cancion?.name);
              const artistaCancion = obtenerPrimerTextoValido(
                cancion?.artista?.nombre,
                cancion?.artista,
                cancion?.nombreArtista,
                cancion?.artist?.name,
                cancion?.artist,
              );
              const duracionCancion = formatearDuracion(
                cancion?.duracion ?? cancion?.duracionSegundos ?? cancion?.duration ?? cancion?.durationMs,
              );

              return (
                <li key={cancion?.id || `${tituloCancion || "cancion"}-${indiceCancion}`}>
                  <span className="catalogo-pista-numero">{indiceCancion + 1}</span>
                  <span className="catalogo-pista-titulo">
                    <strong>{tituloCancion}</strong>
                    <span>{artistaCancion}</span>
                  </span>
                  <time>{duracionCancion}</time>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </main>
  );
}

function AvisoEstado({ mensaje, accion, textoAccion }) {
  if (!mensaje) return null;
  return (
    <p className="aviso-catalogo" role="status">
      <span>{mensaje}</span>
      {accion && (
        <button type="button" className="boton-reintentar" onClick={accion}>
          {textoAccion}
        </button>
      )}
    </p>
  );
}
