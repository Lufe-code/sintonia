export default function AvisoEstado({
  mensaje,
  accion,
  textoAccion,
  tipo = "status",
  className = "aviso-inicio",
}) {
  if (!mensaje) return null;

  return (
    <div className={className} role={tipo}>
      <span>{mensaje}</span>
      {accion && textoAccion ? (
        <button type="button" onClick={accion}>
          {textoAccion}
        </button>
      ) : null}
    </div>
  );
}