import AvisoEstado from "./AvisoEstado.jsx";
import { obtenerPortadaAlbum } from "../portadasAlbum.js";
import "../styles/DetalleAlbumPublico.css";

function asegurarLista(valor) {
  return Array.isArray(valor) ? valor : [];
}

function obtenerPrimerTextoValido(...valores) {
  return valores.find((valor) => typeof valor === "string" && valor.trim()) || "";
}

function obtenerArtista(registro) {
  const artista = registro?.artista || registro?.artist;
  return typeof artista === "string"
    ? artista
    : obtenerPrimerTextoValido(artista?.nombre, artista?.name, registro?.nombreArtista);
}

function obtenerPistas(album) {
  return asegurarLista(album?.pistas || album?.canciones || album?.tracks);
}

function obtenerDuracionSegundos(valor) {
  if (typeof valor === "number" && Number.isFinite(valor) && valor >= 0) {
    return valor > 10000 ? valor / 1000 : valor;
  }

  if (typeof valor !== "string" || !valor.trim()) {
    return null;
  }

  const duracion = valor.trim();
  const coincidencia = duracion.match(/^(\d+):(\d{2})$/);
  if (coincidencia) {
    return Number(coincidencia[1]) * 60 + Number(coincidencia[2]);
  }

  const segundos = Number(duracion);
  return Number.isFinite(segundos) && segundos >= 0 ? segundos : null;
}

function formatearDuracionPista(valor) {
  const segundos = obtenerDuracionSegundos(valor);
  if (segundos === null) {
    return typeof valor === "string" ? valor : "";
  }

  const totalSegundos = Math.round(segundos);
  const minutos = Math.floor(totalSegundos / 60);
  const segundosRestantes = String(totalSegundos % 60).padStart(2, "0");
  return `${minutos}:${segundosRestantes}`;
}

function formatearFecha(fecha, idioma, opciones) {
  if (!fecha) {
    return "";
  }

  const valorFecha = /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? `${fecha}T00:00:00` : fecha;
  const fechaLocal = new Date(valorFecha);
  if (Number.isNaN(fechaLocal.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(idioma, opciones).format(fechaLocal);
}

function obtenerAnio(fecha, idioma) {
  return formatearFecha(fecha, idioma, { year: "numeric" });
}

function obtenerDuracionTotalSegundos(album, pistas) {
  const valor = album?.duracionTotal ?? album?.duracionSeg ?? album?.duracion ?? album?.duration;
  let segundos = obtenerDuracionSegundos(valor);
  if (segundos === null && pistas.length) {
    const duraciones = pistas
      .map((pista) => obtenerDuracionSegundos(
        pista?.duracion ?? pista?.duracionSeg ?? pista?.duracionSegundos ?? pista?.duration ?? pista?.durationMs,
      ))
      .filter((duracion) => duracion !== null);
    if (duraciones.length) {
      segundos = duraciones.reduce((total, duracion) => total + duracion, 0);
    }
  }

  return segundos;
}

function formatearReproducciones(valor, idioma) {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return new Intl.NumberFormat(idioma).format(valor);
  }

  const numero = Number(valor);
  return valor && Number.isFinite(numero)
    ? new Intl.NumberFormat(idioma).format(numero)
    : typeof valor === "string"
      ? valor
      : "";
}

function reemplazarVariables(plantilla, variables) {
  return typeof plantilla === "string"
    ? plantilla.replace(/\{([^}]+)\}/g, (_, clave) => variables[clave] ?? "")
    : "";
}

function obtenerTextosDetalle(textos) {
  const pagina = textos?.paginas?.album
    || {};
  const general = textos?.general || {};
  const etiquetas = pagina.tabla?.etiquetas || {};

  return {
    pagina,
    general,
    etiquetaAlbum: pagina.encabezado?.etiquetas?.tipo || {},
    plantillaResumen: pagina.encabezado?.etiquetas?.resumen,
    etiquetasCanciones: pagina.encabezado?.canciones || {},
    plantillaDuracion: pagina.encabezado?.duracion,
    numero: etiquetas.numero,
    encabezadoTitulo: etiquetas.titulo,
    encabezadoReproducciones: etiquetas.reproducciones,
    encabezadoDuracion: etiquetas.duracion,
    tituloRelacionados: pagina.masDelArtista?.titulo,
    plantillaAnioYTipo: pagina.masDelArtista?.etiquetas?.anioYTipo,
    verDiscografia: pagina.masDelArtista?.enlaces?.verDiscografia,
    noEncontrado: pagina.noEncontrado || {},
    seo: pagina.seo || {},
  };
}

function obtenerIndiceAlbum(album, albumes) {
  const identificador = album?.id;
  return albumes.findIndex((otroAlbum) => otroAlbum?.id === identificador);
}

function obtenerAlbumesRelacionados(album, albumes) {
  const artistaId = album?.artista?.id ?? album?.artist?.id;
  const artista = obtenerArtista(album).toLocaleLowerCase();
  const relacionadosDelApi = asegurarLista(album?.masDelArtista)
    .filter((otroAlbum) => otroAlbum?.id && otroAlbum.id !== album?.id);
  const relacionadosDelCatalogo = albumes.filter((otroAlbum) => {
    if (!otroAlbum?.id || otroAlbum.id === album?.id) {
      return false;
    }

    const otroArtistaId = otroAlbum?.artista?.id ?? otroAlbum?.artist?.id;
    if (artistaId && otroArtistaId) {
      return artistaId === otroArtistaId;
    }

    return artista && obtenerArtista(otroAlbum).toLocaleLowerCase() === artista;
  });

  return [...relacionadosDelApi, ...relacionadosDelCatalogo]
    .filter((otroAlbum, indice, lista) =>
      lista.findIndex((candidato) => candidato.id === otroAlbum.id) === indice,
    )
    .slice(0, 5);
}

function DetallePista({ pista, indice, portada, artistaAlbum, idioma }) {
  const titulo = obtenerPrimerTextoValido(pista?.titulo, pista?.nombre, pista?.name);
  const artista = obtenerArtista(pista) || artistaAlbum;
  const reproducciones = formatearReproducciones(
    pista?.reproducciones ?? pista?.plays ?? pista?.playCount,
    idioma,
  );
  const duracion = formatearDuracionPista(
    pista?.duracion ?? pista?.duracionSeg ?? pista?.duracionSegundos ?? pista?.duration ?? pista?.durationMs,
  );

  return (
    <li className="detalle-album-pista" key={pista?.id || `${titulo}-${indice}`}>
      <span className="detalle-album-numero">{pista?.numero ?? indice + 1}</span>
      <img className="detalle-album-pista-portada" src={portada} alt="" loading="lazy" decoding="async" />
      <span className="detalle-album-pista-texto">
        <strong>{titulo}</strong>
        <span>{artista}</span>
      </span>
      <span className="detalle-album-reproducciones">{reproducciones}</span>
      <time className="detalle-album-duracion">{duracion}</time>
    </li>
  );
}

function TarjetaAlbumRelacionado({ album, indice, idioma, textos }) {
  const fecha = album?.fechaPublicacion || album?.releaseDate;
  const titulo = obtenerPrimerTextoValido(album?.titulo, album?.title, album?.nombre);
  const anio = obtenerAnio(fecha, idioma);
  const tipo = obtenerPrimerTextoValido(
    textos.etiquetaAlbum?.[album?.tipo],
    album?.genero?.nombre,
    album?.genero,
  );
  const subtitulo = reemplazarVariables(textos.plantillaAnioYTipo, { anio, tipo });

  return (
    <a className="detalle-album-relacionado" href={`#album/${encodeURIComponent(album.id)}`}>
      <img
        src={obtenerPortadaAlbum(album, indice)}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <strong>{titulo}</strong>
      {subtitulo && <span>{subtitulo}</span>}
    </a>
  );
}

export default function DetalleAlbumPublico({
  album,
  albumes = [],
  idioma,
  textos,
  estados,
  errores,
  general,
  cargando,
  error,
  noEncontrado,
  recargar,
}) {
  const listaAlbumes = asegurarLista(albumes);
  const detalleTextos = obtenerTextosDetalle(textos);
  const pistas = obtenerPistas(album);
  const artista = obtenerArtista(album);
  const fecha = album?.fechaPublicacion || album?.releaseDate;
  const anio = obtenerAnio(fecha, idioma);
  const indiceAlbum = obtenerIndiceAlbum(album, listaAlbumes);
  const portada = obtenerPortadaAlbum(album, indiceAlbum >= 0 ? indiceAlbum : undefined);
  const albumesRelacionados = album ? obtenerAlbumesRelacionados(album, listaAlbumes) : [];
  const cantidadPistas = album?.totalPistas ?? pistas.length;
  const segundosTotal = obtenerDuracionTotalSegundos(album, pistas);
  const minutosTotal = typeof segundosTotal === "number"
    ? Math.round(segundosTotal / 60)
    : "";
  const duracionTotal = reemplazarVariables(detalleTextos.plantillaDuracion, {
    minutos: minutosTotal,
  });
  const plantillaCantidadCanciones = cantidadPistas === 1
    ? detalleTextos.etiquetasCanciones.uno
    : detalleTextos.etiquetasCanciones.otro;
  const cantidadCanciones = reemplazarVariables(plantillaCantidadCanciones, {
    cantidad: cantidadPistas,
  });
  const titulo = obtenerPrimerTextoValido(album?.titulo, album?.title, album?.nombre);
  const etiquetaTipoAlbum = detalleTextos.etiquetaAlbum?.[album?.tipo] || "";
  const tituloRelacionados = reemplazarVariables(detalleTextos.tituloRelacionados, {
    artista,
  });
  const mensajeError = error && !noEncontrado
    ? obtenerPrimerTextoValido(
        errores?.generico,
        estados?.error?.descripcion,
      )
    : "";
  const textoReintentar = obtenerPrimerTextoValido(
    general?.acciones?.reintentar,
    estados?.error?.botones?.reintentar,
  );
  const resumen = reemplazarVariables(detalleTextos.plantillaResumen, {
    artista,
    anio,
    canciones: cantidadCanciones,
    duracion: duracionTotal,
  });
  const fechaPublicacion = formatearFecha(fecha, idioma, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const textoCopyright = obtenerPrimerTextoValido(
    album?.copyright,
    album?.derechos,
    album?.textoCopyright,
  );
  const albumNoEncontrado = noEncontrado && detalleTextos.noEncontrado;

  return (
    <main className="detalle-album-pagina ancho-home">
      <a
        className="detalle-album-volver"
        href="#catalogo"
        aria-label={general?.acciones?.volver || undefined}
      >
        <span aria-hidden="true">←</span>
      </a>

      <AvisoEstado
        mensaje={mensajeError}
        accion={recargar}
        textoAccion={textoReintentar}
        tipo="alert"
        className="aviso-inicio"
      />

      {cargando && !album ? (
        <p className="detalle-album-estado" role="status">{estados?.cargando?.titulo}</p>
      ) : albumNoEncontrado ? (
        <div className="detalle-album-no-encontrado">
          <h1>{detalleTextos.noEncontrado.titulo}</h1>
          <p>{detalleTextos.noEncontrado.texto}</p>
          <a className="boton-home secundario" href="#catalogo">
            {detalleTextos.noEncontrado.botones?.volver}
          </a>
        </div>
      ) : album ? (
        <>
          <section className="detalle-album-cabecera">
            <img className="detalle-album-portada" src={portada} alt="" />
            <div className="detalle-album-identidad">
              {etiquetaTipoAlbum && (
                <span className="detalle-album-etiqueta">{etiquetaTipoAlbum}</span>
              )}
              <h1>{titulo}</h1>
              <p>{resumen}</p>
            </div>
          </section>

          {pistas.length > 0 && (
            <section className="detalle-album-lista" aria-label={detalleTextos.encabezadoPistas || undefined}>
              <div className="detalle-album-tabla-cabecera">
                <span>{detalleTextos.numero}</span>
                <span />
                <span className="detalle-album-columna-titulo">{detalleTextos.encabezadoTitulo}</span>
                <span className="detalle-album-columna-reproducciones">
                  {detalleTextos.encabezadoReproducciones}
                </span>
                <span className="detalle-album-columna-duracion">{detalleTextos.encabezadoDuracion}</span>
              </div>
              <ol>
                {pistas.map((pista, indice) => (
                  <DetallePista
                    pista={pista}
                    indice={indice}
                    portada={portada}
                    artistaAlbum={artista}
                    idioma={idioma}
                    key={pista?.id || `${pista?.titulo || pista?.nombre || "pista"}-${indice}`}
                  />
                ))}
              </ol>
            </section>
          )}

          {(fechaPublicacion || textoCopyright) && (
            <div className="detalle-album-legal">
              {fechaPublicacion && <time dateTime={fecha}>{fechaPublicacion}</time>}
              {textoCopyright && <p>{textoCopyright}</p>}
            </div>
          )}

          {albumesRelacionados.length > 0 && (
            <section className="detalle-album-relacionados">
              <div className="detalle-album-relacionados-cabecera">
                {tituloRelacionados && <h2>{tituloRelacionados}</h2>}
                {detalleTextos.verDiscografia && (
                  <a href="#catalogo">{detalleTextos.verDiscografia}</a>
                )}
              </div>
              <div className="detalle-album-relacionados-lista">
                {albumesRelacionados.map((albumRelacionado) => (
                  <TarjetaAlbumRelacionado
                    album={albumRelacionado}
                    indice={obtenerIndiceAlbum(albumRelacionado, listaAlbumes)}
                    idioma={idioma}
                    textos={detalleTextos}
                    key={albumRelacionado.id}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      ) : !error && !cargando ? (
        <p className="detalle-album-estado">{estados?.vacio?.generico}</p>
      ) : null}
    </main>
  );
}
