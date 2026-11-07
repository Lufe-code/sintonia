import "../styles/BannerCookies.css";

export default function BannerCookies({ textos, onAceptar, onRechazar }) {
  return (
    <aside className="banner-cookies" aria-labelledby="titulo-banner-cookies">
      <div>
        <h2 id="titulo-banner-cookies">{textos.banner}</h2>
        <p>{textos.descripcion}</p>
      </div>
      <div className="cookies-banner-acciones">
        <button className="cookies-secundario" type="button" onClick={onRechazar}>
          {textos.rechazar}
        </button>
        <button className="cookies-primario" type="button" onClick={onAceptar}>
          {textos.aceptar}
        </button>
      </div>
    </aside>
  );
}
