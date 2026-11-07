import CollagePortadas from "../CollagePortadas/CollagePortadas.jsx";
import "../styles/HeroSintonia.css";
export default function HeroSintonia({ en, abrirCuenta, totalGeneros }) {
  return (
    <section className="ancho-home hero-sintonia">
      <div className="texto-hero">
        <span className="etiqueta-sintonia">
          {en ? "Sample catalogue · 2026" : "Catálogo de ejemplo · 2026"}
        </span>
        <h1>
          {en ? (
            <>
              Keep the <br />
              music <br />
              playing
            </>
          ) : (
            <>
              Que no <br />
              pare la <br />
              música
            </>
          )}
        </h1>
        <p>
          {en
            ? "Explore albums and artists by genre and see the track list of every album. Sign up free with your email."
            : "Explora álbumes y artistas por género y consulta la lista de canciones de cada álbum. Crea tu cuenta gratis con tu correo."}
        </p>
        <div className="grupo-botones">
          <button
            className="boton-home primario"
            onClick={() => abrirCuenta("registro")}
          >
            {en ? "Sign up free" : "Crear cuenta gratis"}
          </button>
          <a className="boton-home secundario" href="#generos">
            {en ? "Explore the catalogue" : "Explorar el catálogo"}
          </a>
        </div>
        <dl className="cifras-sintonia">
          <div>
            <dt>{en ? "120K" : "120 mil"}</dt>
            <dd>{en ? "free-to-use songs" : "canciones de uso libre"}</dd>
          </div>
          <div>
            <dt>{totalGeneros}</dt>
            <dd>{en ? "genres to explore" : "géneros para explorar"}</dd>
          </div>
          <div>
            <dt>0</dt>
            <dd>{en ? "browsing interruptions" : "cortes al navegar"}</dd>
          </div>
        </dl>
      </div>
      <CollagePortadas />
    </section>
  );
}
