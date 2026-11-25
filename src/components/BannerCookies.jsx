import "../styles/BannerCookies.css";

export default function BannerCookies({ textos, onAceptar, onRechazar, onConfigurar }) {
  const banner = textos?.banner;
  if (!banner) return null;

  return (
    <aside className="banner-cookies" aria-labelledby="titulo-banner-cookies">
      <div>
        <h2 id="titulo-banner-cookies">{banner.titulo}</h2>
        <p>{banner.texto || banner.descripcion}</p>
      </div>
      <div className="cookies-banner-acciones">
        {onConfigurar && banner.botones?.configurar && (
          <button className="cookies-secundario" type="button" onClick={onConfigurar}>
            {banner.botones.configurar}
          </button>
        )}
        <button className="cookies-secundario" type="button" onClick={onRechazar}>
          {banner.botones?.rechazar}
        </button>
        <button className="cookies-primario" type="button" onClick={onAceptar}>
          {banner.botones?.aceptar}
        </button>
      </div>
    </aside>
  );
}
