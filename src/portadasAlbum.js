import portadaUno from "./assets/portada tarjetas/1.png";
import portadaDos from "./assets/portada tarjetas/2.png";
import portadaTres from "./assets/portada tarjetas/3.png";
import portadaCuatro from "./assets/portada tarjetas/4.png";
import portadaCinco from "./assets/portada tarjetas/5.png";
import portadaCantoDeGuadua from "./assets/portada tarjetas/album-canto-de-guadua.png";
import portadaEnVivoEnElRuiz from "./assets/portada tarjetas/album-en-vivo-en-el-ruiz.png";
import portadaFrailejonAcustico from "./assets/portada tarjetas/album-frailejon-acustico.png";
import portadaMareaViva from "./assets/portada tarjetas/album-marea-viva.png";
import portadaPleamar from "./assets/portada tarjetas/album-pleamar.png";

const PORTADAS = [
  { coincidencias: ["bajo el guadual"], imagen: portadaTres },
  { coincidencias: ["canto de guadua"], imagen: portadaCantoDeGuadua },
  { coincidencias: ["cartas sin enviar"], imagen: portadaUno },
  { coincidencias: ["cuerdas y volitos"], imagen: portadaDos },
  { coincidencias: ["en vivo en el ruiz"], imagen: portadaEnVivoEnElRuiz },
  { coincidencias: ["frailejon"], imagen: portadaFrailejonAcustico },
  { coincidencias: ["kilometro 41"], imagen: portadaCinco },
  { coincidencias: ["luz de paramo"], imagen: portadaUno },
  { coincidencias: ["marea viva"], imagen: portadaMareaViva },
  { coincidencias: ["neon y niebla"], imagen: portadaCuatro },
  { coincidencias: ["pleamar"], imagen: portadaPleamar },
  { coincidencias: ["cartas a la niebla"], imagen: portadaCinco },
  { coincidencias: ["todo el ruido"], imagen: portadaDos },
];

const PORTADAS_POR_DEFECTO = [
  portadaUno,
  portadaDos,
  portadaTres,
  portadaCuatro,
  portadaCinco,
];

function normalizarTexto(valor) {
  return typeof valor === "string"
    ? valor
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[-_]+/g, " ")
    : "";
}

function obtenerIndiceEstable(identificador) {
  const texto = String(identificador || "");
  let hash = 0;
  for (let indice = 0; indice < texto.length; indice += 1) {
    hash = (hash * 31 + texto.charCodeAt(indice)) >>> 0;
  }
  return hash % PORTADAS_POR_DEFECTO.length;
}

export function obtenerPortadaAlbum(album, indice) {
  const identificadoresAlbum = [
    album?.id,
    album?.slug,
    album?.titulo,
    album?.title,
    album?.nombre,
  ].map(normalizarTexto);
  const portadaCoincidente = PORTADAS.find(({ coincidencias }) =>
    coincidencias.some((coincidencia) =>
      identificadoresAlbum.some((identificador) =>
        identificador.includes(coincidencia),
      ),
    ),
  );

  if (portadaCoincidente) {
    return portadaCoincidente.imagen;
  }

  const claveEstable = album?.id || identificadoresAlbum.find(Boolean);
  const indicePortada = claveEstable
    ? obtenerIndiceEstable(claveEstable)
    : Number.isInteger(indice) && indice >= 0
      ? indice
      : 0;
  return PORTADAS_POR_DEFECTO[indicePortada % PORTADAS_POR_DEFECTO.length];
}
