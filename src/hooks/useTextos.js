import { useEffect, useState } from "react";

const API_BASE = "https://yanethm-sintonia-api.fly.dev/api/v1";

function validarTextos(datos) {
  const textos = datos?.textos;
  const nav = textos?.navbar;
  const enlaces = nav?.enlaces?.invitado;
  const botones = nav?.botones?.invitado;
  const etiquetas = [
    nav?.logo?.texto,
    nav?.logo?.aria,
    enlaces?.descubrir,
    enlaces?.planes,
    enlaces?.paraArtistas,
    enlaces?.ayuda,
    nav?.buscador?.placeholder,
    botones?.ingresar,
    botones?.crearCuenta,
    nav?.aria?.navegacion,
    nav?.aria?.idioma,
    textos?.menuMovil?.abrir,
    textos?.menuMovil?.cerrar,
  ];

  if (!etiquetas.every((valor) => typeof valor === "string" && valor.trim())) {
    throw new Error("La respuesta no contiene los textos del navbar.");
  }
  return textos;
}

export function useTextos(idioma) {
  const [textos, setTextos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 12000);
    let vigente = true;
    setCargando(true);
    setError(false);
    setTextos(null);

    async function cargarTextosNavbar() {
      try {
        const parametros = new URLSearchParams({
          idioma,
          seccion: "navbar,menuMovil",
        });
        const respuesta = await fetch(`${API_BASE}/textos?${parametros}`, {
          signal: controlador.signal,
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        //Si si respondio los datos correctamente
        const datos = await respuesta.json();
        const nuevosTextos = validarTextos(datos);
        if (vigente) setTextos(nuevosTextos);
      } catch (error) {
        if (vigente) {
          console.error("Error al cargar los textos:", error);
          setError(true);
        }
      } finally {
        clearTimeout(limite);
        if (vigente) setCargando(false);
      }
    }

    cargarTextosNavbar();
    return () => {
      vigente = false;
      clearTimeout(limite);
      controlador.abort();
    };
  }, [idioma, intento]);

  return {
    textos,
    cargando,
    error,
    recargar: () => setIntento((valor) => valor + 1),
  };
}
