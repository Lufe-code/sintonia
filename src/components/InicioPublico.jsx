import "../styles/InicioPublico.css";

function colorPortada(color) {
  const numero = color?.match(/\d+/)?.[0] || "1";
  return `var(--portada-${numero})`;
}

function fechaAlbum(fecha, idioma) {
  if (!fecha) return "";
  const fechaLocal = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(fechaLocal.getTime())) return "";
  return new Intl.DateTimeFormat(idioma, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(fechaLocal);
}

function PortadaAlbum({ indice, clase = "" }) {
  return (
    <div
      className={`portada-album portada-patron-${indice % 6} ${clase}`}
      aria-hidden="true"
    >
    </div>
  );
}

export default function InicioPublico({
  idioma,
  busqueda = "",
  textos,
  cargandoTextos,
  errorTextos,
  recargarTextos,
  generos = [],
  albumes = [],
  cargando,
  error,
  recargar,
}) {
  const ingles = idioma === "en";
  const hero = textos?.hero;
  const cifras = textos?.cifras;
  const destacados = textos?.destacados;
  const seccionGeneros = textos?.generos;
  const cta = textos?.cta;
  const termino = busqueda.toLocaleLowerCase(idioma);
  const albumesFiltrados = termino
    ? albumes.filter((album) => [
        album.titulo,
        album.artista?.nombre,
        album.genero,
      ].some((valor) => valor?.toLocaleLowerCase(idioma).includes(termino)))
    : albumes;

  return (
    <main className="inicio-publico" id="inicio">
      {(errorTextos || error) && (
        <div className="aviso-inicio" role="status">
          <span>
            {errorTextos
              ? ingles ? "Some page content could not be loaded." : "No se pudo cargar parte del contenido."
              : ingles ? "The catalogue could not be loaded." : "No se pudo cargar el catálogo."}
          </span>
          <button type="button" onClick={errorTextos ? recargarTextos : recargar}>
            {ingles ? "Try again" : "Reintentar"}
          </button>
        </div>
      )}

      <section className="inicio-hero ancho-home" aria-labelledby="titulo-inicio">
        <div className="inicio-hero-texto">
          <span className="inicio-etiqueta">
            {hero?.etiquetas?.temporada || (ingles ? "Discover your next favorite" : "Descubre tu próximo sonido")}
          </span>
          <h1 id="titulo-inicio">
            {hero?.titulo || (ingles ? "Keep the music playing" : "Que no pare la música")}
          </h1>
          <p>
            {hero?.subtitulo || (ingles
              ? "Explore albums, artists and sounds from every genre."
              : "Explora álbumes, artistas y sonidos de todos los géneros.")}
          </p>
          <div className="inicio-acciones">
            <a className="boton-home primario" href="#registro">
              {hero?.botones?.crearCuentaGratis || (ingles ? "Sign up free" : "Crear cuenta gratis")}
            </a>
            <a className="boton-home secundario" href="#catalogo">
              {hero?.botones?.explorarCatalogo || (ingles ? "Explore the catalogue" : "Explorar el catálogo")}
            </a>
          </div>
          <dl className="inicio-cifras">
            <div>
              <dt>{cifras?.canciones?.valor || "120 mil"}</dt>
              <dd>{cifras?.canciones?.etiqueta || (ingles ? "free-to-use songs" : "canciones de uso libre")}</dd>
            </div>
            <div>
              <dt>{generos.length}</dt>
              <dd>{cifras?.generos?.etiqueta || (ingles ? "genres to explore" : "géneros para explorar")}</dd>
            </div>
            <div>
              <dt>{cifras?.cortes?.valor || "0"}</dt>
              <dd>{cifras?.cortes?.etiqueta || (ingles ? "browsing interruptions" : "cortes al navegar")}</dd>
            </div>
          </dl>
        </div>

        <div className="inicio-hero-visual" aria-hidden="true">
          <div className="collage-portada">
            <span />
            <div className="collage-vinilo" />
          </div>
          <div className="collage-pegatina collage-pegatina-rayas" />
          <div className="collage-pegatina collage-pegatina-arcos" />
          <div className="collage-nota">
            <strong>{ingles ? "The mist rises over the mountain" : "Sube la niebla por la montaña"}</strong>
            <span>{ingles ? "and the road sings" : "y el camino canta"}</span>
          </div>
        </div>
      </section>

      <section className="seccion-inicio seccion-albumes" id="catalogo" aria-labelledby="titulo-albumes">
        <div className="seccion-cabecera ancho-home">
          <div>
            <span className="inicio-etiqueta">{ingles ? "FRESHLY ADDED" : "RECIÉN AÑADIDOS"}</span>
            <h2 id="titulo-albumes">{destacados?.titulo || (ingles ? "On repeat this week" : "Suena esta semana")}</h2>
          </div>
          <a href="#generos">
            <span className="texto-enlace-escritorio">
              {destacados?.enlaces?.descubrirMas || (ingles ? "Discover more" : "Descubrir más")}
            </span>
            <span className="texto-enlace-movil">
              {ingles ? "View catalogue" : "Ver catálogo"}
            </span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
        {cargando && albumesFiltrados.length === 0 ? (
          <p className="estado-catalogo ancho-home" role="status">
            {ingles ? "Loading the catalogue..." : "Cargando catálogo..."}
          </p>
        ) : albumesFiltrados.length > 0 ? (
          <div className="rejilla-albumes ancho-home">
            {albumesFiltrados.map((album, indice) => (
              <article className="tarjeta-album" key={album.id}>
                <PortadaAlbum indice={indice} />
                <div className="datos-album">
                  <div>
                    <h3>{album.titulo}</h3>
                    <p>{album.artista?.nombre}</p>
                  </div>
                  <span>{album.genero}</span>
                </div>
                <time dateTime={album.fechaPublicacion}>
                  {fechaAlbum(album.fechaPublicacion, idioma)}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <p className="estado-catalogo ancho-home">
            {termino
              ? ingles ? "No matching albums were found." : "No se encontraron álbumes para esa búsqueda."
              : ingles ? "No albums are available right now." : "Todavía no hay álbumes disponibles."}
          </p>
        )}
      </section>

      <section className="seccion-inicio seccion-generos" id="generos" aria-labelledby="titulo-generos">
        <div className="seccion-cabecera ancho-home">
          <div>
            <span className="inicio-etiqueta">{ingles ? "FIND YOUR FREQUENCY" : "ENCUENTRA TU FRECUENCIA"}</span>
            <h2 id="titulo-generos">{seccionGeneros?.titulo || (ingles ? "Explore by genre" : "Explora por género")}</h2>
          </div>
          <a href="#catalogo">
            {seccionGeneros?.enlaces?.verCatalogo || (ingles ? "View catalogue" : "Ver catálogo")} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="rejilla-generos ancho-home">
          {generos.slice(0, 8).map((genero) => (
            <a
              className="genero-item"
              href={`#genero/${encodeURIComponent(genero.id)}`}
              key={genero.id}
              style={{ "--color-genero": colorPortada(genero.color) }}
            >
              <span className="genero-punto" aria-hidden="true" />
              <span className="genero-nombre">{genero.nombre}</span>
              <span className="genero-descripcion">{genero.descripcion}</span>
              <span className="genero-flecha" aria-hidden="true">↗</span>
            </a>
          ))}
          {cargando && generos.length === 0 && (
            <p className="estado-catalogo">{ingles ? "Loading genres..." : "Cargando géneros..."}</p>
          )}
        </div>
      </section>

      <section className="inicio-cta">
        <div className="inicio-cta-interior ancho-home">
          <div>
            <span className="inicio-etiqueta">{ingles ? "YOUR MUSIC, YOUR WAY" : "TU MÚSICA, A TU MANERA"}</span>
            <h2>{cta?.titulo || (ingles ? "Your next favorite song is one click away" : "Tu próxima canción favorita está a un clic")}</h2>
            <p>{cta?.texto || (ingles ? "Create your free account and start exploring." : "Crea tu cuenta gratis y empieza a explorar.")}</p>
          </div>
          <a className="boton-home primario" href="#registro">
            {cta?.botones?.crearCuentaGratis || (ingles ? "Sign up free" : "Crear cuenta gratis")}
          </a>
        </div>
      </section>
      {cargandoTextos && (
        <span className="sr-only" role="status">
          {ingles ? "Loading page content" : "Cargando contenido de la página"}
        </span>
      )}
    </main>
  );
}