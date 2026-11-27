const PORTADA_SEGURA = {
  patron: 0,
  fondo: "#2A2935",
  figura: "#8E7BFF",
  detalle: "#FFFFFF",
};

function obtenerColorSeguro(color, colorRespaldo) {
  return typeof color === "string" && /^#[\da-f]{6}$/i.test(color)
    ? color
    : colorRespaldo;
}

function normalizarPortada(portada) {
  const patron = Number.isInteger(portada?.patron) && portada.patron >= 0 && portada.patron <= 3
    ? portada.patron
    : PORTADA_SEGURA.patron;

  return {
    patron,
    fondo: obtenerColorSeguro(portada?.fondo, PORTADA_SEGURA.fondo),
    figura: obtenerColorSeguro(portada?.figura, PORTADA_SEGURA.figura),
    detalle: obtenerColorSeguro(portada?.detalle, PORTADA_SEGURA.detalle),
  };
}

export default function Portada({ portada, className }) {
  const colores = normalizarPortada(portada);

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="100" height="100" fill={colores.fondo} />
      {colores.patron === 0 && (
        <>
          <circle cx="100" cy="100" r="85" fill={colores.figura} />
          <circle cx="100" cy="100" r="62.5" fill={colores.fondo} />
          <circle cx="100" cy="100" r="40" fill={colores.figura} />
        </>
      )}
      {colores.patron === 1 && (
        <g fill={colores.figura}>
          <rect x="-34" y="40" width="182" height="11.4" transform="rotate(-35 -34 40)" />
          <rect x="-30.7" y="66" width="182" height="11.4" transform="rotate(-35 -30.7 66)" />
          <rect x="-27.3" y="92" width="182" height="11.4" transform="rotate(-35 -27.3 92)" />
          <rect x="-23.9" y="118.2" width="182" height="11.4" transform="rotate(-35 -23.9 118.2)" />
        </g>
      )}
      {colores.patron === 2 && (
        <>
          <circle cx="50" cy="86.4" r="34.1" fill={colores.figura} />
          <circle cx="76.7" cy="23.3" r="10.8" fill={colores.detalle} />
        </>
      )}
      {colores.patron === 3 && (
        <>
          <g fill={colores.detalle}>
            <circle cx="22.7" cy="22.7" r="9.1" />
            <circle cx="77.3" cy="22.7" r="9.1" />
            <circle cx="50" cy="50" r="9.1" />
            <circle cx="22.7" cy="77.3" r="9.1" />
            <circle cx="77.3" cy="77.3" r="9.1" />
          </g>
          <g fill={colores.figura}>
            <circle cx="50" cy="22.7" r="9.1" />
            <circle cx="22.7" cy="50" r="9.1" />
            <circle cx="77.3" cy="50" r="9.1" />
            <circle cx="50" cy="77.3" r="9.1" />
          </g>
        </>
      )}
    </svg>
  );
}
