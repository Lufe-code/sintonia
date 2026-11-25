import LogoSintonia from "./LogoSintonia.jsx";

export default function PiePublico({ textos, onAbrirAccesibilidad, onAbrirCookies }) {
  if (!textos) return null;
  const anio = String(new Date().getFullYear());
  const derechos = textos.legal?.derechos?.replace("{anio}", anio);

  return (
    <footer className="pie-publico">
      <div className="pie-publico-interior">
        <LogoSintonia ariaLabel={textos.logo?.aria} nombre={textos.logo?.nombre} />
        <p>{textos.lema}</p>
        <div className="pie-publico-columnas">
          <div>
            <h2>{textos.columnas?.explora?.titulo}</h2>
            <a href="#inicio">{textos.columnas?.explora?.enlaces?.inicio}</a>
            <a href="#catalogo">{textos.columnas?.explora?.enlaces?.catalogo}</a>
          </div>
          <div>
            <h2>{textos.columnas?.cuenta?.titulo}</h2>
            <a href="#ingresar">{textos.columnas?.cuenta?.enlaces?.ingresar}</a>
            <a href="#registro">{textos.columnas?.cuenta?.enlaces?.crearCuenta}</a>
          </div>
          <div>
            <h2>{textos.columnas?.legal?.titulo}</h2>
            <a href="#terminos">{textos.columnas?.legal?.enlaces?.terminos}</a>
            <button type="button" onClick={onAbrirAccesibilidad}>
              {textos.columnas?.legal?.enlaces?.accesibilidad}
            </button>
            <button type="button" onClick={onAbrirCookies}>
              {textos.preferenciasCookies || textos.columnas?.legal?.enlaces?.cookies}
            </button>
          </div>
        </div>
        <div className="pie-publico-legal">
          <span>{derechos}</span>
          <span>{textos.legal?.nota}</span>
        </div>
      </div>
    </footer>
  );
}