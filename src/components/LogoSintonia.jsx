import "../styles/LogoSintonia.css";

export default function LogoSintonia({
  ariaLabel = "Sintonía, ir al inicio",
  nombre = "sintonía",
}) {
  return (
    <a className="logo-sintonia" href="#inicio" aria-label={ariaLabel}>
      <span className="logo-sintonia-emblema" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="logo-sintonia-nombre">{nombre}</span>
    </a>
  );
}
