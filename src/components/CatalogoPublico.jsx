import ilustracionesCatalogo from "../assets/catalogo.svg";
import "../styles/InicioPublico.css";
import "../styles/CatalogoPublico.css";

const ILUSTRACIONES_GENERO = {
  gen_pop: "genero-pop",
  gen_indie: "genero-indie",
  gen_rock: "genero-rock",
  gen_electronica: "genero-electronica",
  gen_salsa: "genero-salsa",
  gen_tropical: "genero-tropical",
  gen_andina: "genero-andina",
  gen_folk: "genero-folk",
  gen_urbano: "genero-urbano",
  gen_lofi: "genero-lofi",
  gen_jazz: "genero-jazz",
  gen_instrumental: "genero-instrumental",
};

const ILUSTRACIONES_ALBUM = {
  alb_subestacion: "album-0",
  alb_canto_de_guadua: "album-0",
  alb_tejados_mojados: "album-1",
  alb_cuerdas_y_voltios: "album-1",
  alb_flor_de_escarcha: "album-2",
  alb_sabado_en_la_plaza: "album-2",
  alb_ascensor_danado: "album-4",
  alb_domingo_de_feria: "album-5",
  alb_todo_el_ruido: "album-5",
  alb_luz_de_paramo: "album-1",
  alb_onda_corta: "album-3",
  alb_ventana_empanada: "album-3",
  alb_neon_y_neblina: "album-3",
  alb_fiesta_en_la_vereda: "album-5",
  alb_barrio_arriba: "album-3",
  alb_domingo_lento: "album-1",
  alb_sobremesa: "album-5",
  alb_mapa_de_curvas: "album-4",
};

const ILUSTRACIONES_POR_PATRON = ["album-0", "album-2", "album-5", "album-4"];

function colorPortada(color) {
  const numero = color?.match(/\d+/)?.[0] || "1";
  return `var(--portada-${numero})`;
}

function PortadaAlbum({ album }) {
  const patron = album.portada?.patron;
  const albumId = album.id?.replaceAll("-", "_");
  const ilustracion = ILUSTRACIONES_ALBUM[albumId]
    || ILUSTRACIONES_POR_PATRON[patron]
    || "album-0";

  return (
    <div
      className="portada-album portada-catalogo"
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 160">
        <use href={`${ilustracionesCatalogo}#${ilustracion}`} />
      </svg>
    </div>
  );
}

function TarjetaAlbum({ album }) {
  return (
    <article className="tarjeta-album" key={album.id}>
      <PortadaAlbum album={album} />
      <div className="datos-album">
        <div>
          <h3>{album.titulo}</h3>
          <p>{album.artista?.nombre}</p>
        </div>
      </div>
    </article>
  );
}

function formatearDuracion(segundos = 0) {
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
}

export default function CatalogoPublico({
  idioma,
  generos = [],
  albumes = [],
  catalogo = [],
  busqueda = "",
  cargando,
  error,
  recargar,
}) {
  const ingles = idioma === "en";
  const generoId = window.location.hash.startsWith("#genero/")
    ? window.location.hash.slice("#genero/".length)
    : null;
  const detalle = catalogo.find((item) => item.id === generoId);
  const titulo = detalle?.nombre || (ingles ? "Music catalogue" : "Catálogo musical");
  const subtitulo = detalle?.descripcion || (ingles
    ? "Explore by genre or open an album to see its songs."
    : "Explora por género o abre un álbum para ver sus canciones.");
  const termino = busqueda.toLocaleLowerCase(idioma);
  const generosFiltrados = generos.filter((genero) =>
    genero.nombre.toLocaleLowerCase(idioma).includes(termino),
  );
  const albumesFiltrados = (detalle?.albumes || albumes).filter((album) =>
    [album.titulo, album.artista?.nombre, detalle?.nombre].some((valor) =>
      valor?.toLocaleLowerCase(idioma).includes(termino),
    ),
  );
  const albumesVisibles = detalle
    ? [...albumesFiltrados].sort((a, b) => a.titulo.localeCompare(b.titulo, idioma))
    : termino
      ? albumesFiltrados
      : albumesFiltrados.slice(0, 6);
  const artistas = detalle?.artistas || [];
  const pistas = [...(detalle?.pistas || [])]
    .sort((a, b) => b.reproducciones - a.reproducciones)
    .slice(0, 5);

  return (
    <main className="catalogo-pagina ancho-home" id="catalogo">
      {error && (
        <div className="aviso-inicio" role="status">
          <span>
            {ingles
              ? "The catalogue could not be loaded."
              : "No se pudo cargar el catálogo."}
          </span>
          <button type="button" onClick={recargar}>
            {ingles ? "Try again" : "Reintentar"}
          </button>
        </div>
      )}

      <header className="catalogo-titulo">
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </header>

      <section className="catalogo-generos" aria-labelledby="titulo-explorar-generos">
        <h2 id="titulo-explorar-generos">
          {ingles ? "Explore by genre" : "Explorar por género"}
        </h2>
        <div className="rejilla-generos">
          {generosFiltrados.map((genero) => (
            <a
              className="genero-item"
              href={`#genero/${encodeURIComponent(genero.id)}`}
              key={genero.id}
              aria-current={genero.id === generoId ? "page" : undefined}
              data-genero={genero.id}
              style={{ "--color-genero": colorPortada(genero.color) }}
            >
              <span className="genero-nombre">{genero.nombre}</span>
              <span className="genero-descripcion">{genero.descripcion}</span>
              <span className="genero-flecha" aria-hidden="true">↗</span>
              {ILUSTRACIONES_GENERO[genero.id] && (
                <svg className="genero-ilustracion" viewBox="0 0 160 90" aria-hidden="true">
                  <use href={`${ilustracionesCatalogo}#${ILUSTRACIONES_GENERO[genero.id]}`} />
                </svg>
              )}
            </a>
          ))}
          {!cargando && generosFiltrados.length === 0 && (
            <p className="estado-catalogo">
              {ingles ? "No genres match this search." : "No hay géneros que coincidan."}
            </p>
          )}
        </div>
      </section>

      {detalle && (
        <section className="catalogo-artistas" aria-labelledby="titulo-artistas">
          <h2 id="titulo-artistas">{ingles ? "Artists" : "Artistas"}</h2>
          <div className="catalogo-artistas-lista">
            {artistas.map((artista) => {
              const albumArtista = detalle.albumes?.find(
                (album) => album.artista?.id === artista.id,
              );

              return (
                <article className="catalogo-artista" key={artista.id}>
                  <div
                    className="catalogo-artista-portada"
                    style={{
                      backgroundColor: albumArtista?.portada?.fondo
                        || artista.portada?.fondo
                        || "var(--marca-secundario)",
                    }}
                    aria-hidden="true"
                  />
                  <h3>{artista.nombre}</h3>
                  <p>{ingles ? "Artist" : "Artista"}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section
        className={`catalogo-albumes${detalle ? " catalogo-albumes-detalle" : ""}`}
        aria-labelledby="titulo-albumes-catalogo"
      >
        <h2 id="titulo-albumes-catalogo">
          {detalle
            ? ingles ? `Albums by ${detalle.nombre}` : `Álbumes de ${detalle.nombre}`
            : ingles ? "Featured albums" : "Álbumes destacados"}
        </h2>
        {cargando && albumesVisibles.length === 0 ? (
          <p className="estado-catalogo" role="status">
            {ingles ? "Loading the catalogue..." : "Cargando catálogo..."}
          </p>
        ) : albumesVisibles.length > 0 ? (
          <div className="catalogo-albumes-lista">
            {albumesVisibles.map((album) => (
              <TarjetaAlbum album={album} key={album.id} />
            ))}
          </div>
        ) : (
          <p className="estado-catalogo">
            {ingles ? "No matching albums were found." : "No se encontraron álbumes."}
          </p>
        )}
      </section>

      {detalle && (
        <section className="catalogo-pistas" aria-labelledby="titulo-pistas">
          <h2 id="titulo-pistas">
            {ingles ? "Most played songs" : "Canciones más escuchadas"}
          </h2>
          <ol>
            {pistas.map((pista, indice) => (
              <li key={pista.id}>
                <span className="catalogo-pista-numero">{indice + 1}</span>
                <span className="catalogo-pista-titulo">
                  <strong>{pista.titulo}</strong>
                  <span>{pista.artista?.nombre}</span>
                </span>
                <time>{formatearDuracion(pista.duracionSeg)}</time>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
