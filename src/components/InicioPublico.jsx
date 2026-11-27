import AvisoEstado from "./AvisoEstado.jsx";
import imagenPortadaInicio from "../assets/icono portada/inicio-collage.png";
import Portada from "./Portada.jsx";
import "../styles/InicioPublico.css";

function colorGenero(genero) {
  return genero?.colorHex || genero?.portada?.fondo || "var(--marca-secundario)";
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

function PortadaAlbum({ album }) {
  return (
    <Portada
      className="portada-album portada-destacada"
      portada={album?.portada}
    />
  );
}

export default function InicioPublico({
  idioma,
  busqueda = "",
  textos,
  cargandoTextos,
  errorTextos,
  recargarTextos,
  estados,
  errores,
  general,
  generos = [],
  albumes = [],
  cargando,
  error,
  recargar,
  autenticado = false,
}) {
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

  const mensajeError = errorTextos || error
    ? (errores?.general?.error_interno || estados?.error?.mensaje)
    : null;
  const accionError = errorTextos ? recargarTextos : recargar;

  return (
    <main className="inicio-publico" id="inicio">
      <AvisoEstado
        mensaje={mensajeError}
        accion={accionError}
        textoAccion={general?.acciones?.reintentar || estados?.error?.accion}
      />

      <section className="inicio-hero ancho-home" aria-labelledby="titulo-inicio">
        <div className="inicio-hero-texto">
          {hero?.etiquetas?.temporada && (
            <span className="inicio-etiqueta">{hero.etiquetas.temporada}</span>
          )}
          <h1 id="titulo-inicio">{hero?.titulo}</h1>
          <p>{hero?.subtitulo}</p>
          <div className="inicio-acciones">
            {!autenticado && (
              <a className="boton-home primario" href="#registro">
                {hero?.botones?.crearCuentaGratis}
              </a>
            )}
            <a className="boton-home secundario" href="#catalogo">
              {hero?.botones?.explorarCatalogo}
            </a>
          </div>
          <dl className="inicio-cifras">
            <div>
              <dt>{cifras?.canciones?.valor}</dt>
              <dd>{cifras?.canciones?.etiqueta}</dd>
            </div>
            <div>
              <dt>{generos.length}</dt>
              <dd>{cifras?.generos?.etiqueta}</dd>
            </div>
            <div>
              <dt>{cifras?.cortes?.valor}</dt>
              <dd>{cifras?.cortes?.etiqueta}</dd>
            </div>
          </dl>
        </div>

        <div className="inicio-hero-visual" aria-hidden="true">
          <img
            className="inicio-hero-portada"
            src={imagenPortadaInicio}
            alt=""
            loading="eager"
            decoding="async"
          />
          {hero?.nota && (
            <div className="collage-nota">
              <strong>{hero.nota.titulo || hero.nota.texto}</strong>
              {hero.nota.detalle && <span>{hero.nota.detalle}</span>}
            </div>
          )}
        </div>
      </section>

      <section className="seccion-inicio seccion-albumes" id="catalogo" aria-labelledby="titulo-albumes">
        <div className="seccion-cabecera ancho-home">
          <div>
            {destacados?.etiqueta && <span className="inicio-etiqueta">{destacados.etiqueta}</span>}
            <h2 id="titulo-albumes">{destacados?.titulo}</h2>
          </div>
          <a href="#generos">
            <span className="texto-enlace-escritorio">
              {destacados?.enlaces?.descubrirMas}
            </span>
            <span className="texto-enlace-movil">
              {seccionGeneros?.enlaces?.verCatalogo}
            </span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
        {cargando && albumesFiltrados.length === 0 ? (
          <p className="estado-catalogo ancho-home" role="status">
            {estados?.cargando?.mensaje}
          </p>
        ) : albumesFiltrados.length > 0 ? (
          <div className="rejilla-albumes ancho-home">
            {albumesFiltrados.map((album, indice) => {
              const contenidoTarjeta = (
                <>
                  <PortadaAlbum album={album} />
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
                <article className="tarjeta-album" key={`${album.titulo}-${indice}`}>
                  {contenidoTarjeta}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="estado-catalogo ancho-home">{estados?.vacio?.generico?.mensaje}</p>
        )}
      </section>

      <section className="seccion-inicio seccion-generos" id="generos" aria-labelledby="titulo-generos">
        <div className="seccion-cabecera ancho-home">
          <div>
            {seccionGeneros?.etiqueta && <span className="inicio-etiqueta">{seccionGeneros.etiqueta}</span>}
            <h2 id="titulo-generos">{seccionGeneros?.titulo}</h2>
          </div>
          <a href="#catalogo">
            {seccionGeneros?.enlaces?.verCatalogo} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="rejilla-generos ancho-home">
          {generos.slice(0, 8).map((genero) => (
            <a
              className="genero-item"
              href={`#genero/${encodeURIComponent(genero.id)}`}
              key={genero.id}
              style={{ "--color-genero": colorGenero(genero) }}
            >
              <Portada
                className="genero-ilustracion"
                portada={genero.portada}
              />
              <span className="genero-punto" aria-hidden="true" />
              <span className="genero-nombre">{genero.nombre}</span>
              <span className="genero-descripcion">{genero.descripcion}</span>
              <span className="genero-flecha" aria-hidden="true">↗</span>
            </a>
          ))}
          {cargando && generos.length === 0 && (
            <p className="estado-catalogo">{estados?.cargando?.mensaje}</p>
          )}
        </div>
      </section>

      {!autenticado && (
        <section className="inicio-cta">
          <div className="inicio-cta-interior ancho-home">
            <div>
              {cta?.etiqueta && <span className="inicio-etiqueta">{cta.etiqueta}</span>}
              <h2>{cta?.titulo}</h2>
              <p>{cta?.texto}</p>
            </div>
            <a className="boton-home primario" href="#registro">
              {cta?.botones?.crearCuentaGratis}
            </a>
          </div>
        </section>
      )}
      {cargandoTextos && (
        <span className="sr-only" role="status">
          {estados?.cargando?.mensaje}
        </span>
      )}
    </main>
  );
}