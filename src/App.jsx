import { useTextos } from "./hooks/useTextos.js"
import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { Ejercicio1 } from "./components/Ejercicio1.jsx";

function leerSeccion() {
  return window.location.hash.slice(1) || "inicio";
}

function App() {
  const [idioma, setIdioma] = useState("es");
  const [activo, setActivo] = useState(leerSeccion);
  const [textoGrande, setTextoGrande] = useState(false);
  const datos = useTextos(idioma);

  useEffect(() => {
    function actualizar() {
      setActivo(leerSeccion());
    }
    window.addEventListener("hashchange", actualizar);
    return () => window.removeEventListener("hashchange", actualizar);
  }, []);

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  useEffect(() => {
    document.documentElement.style.fontSize = textoGrande ? "112%" : "";
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [textoGrande]);

  function buscar(valor) {
    setActivo("buscar");
    window.history.replaceState(null, "", "#buscar");
  }

  return (
    /*   <>
       <Navbar {...datos} 
        idioma={idioma}
        cambiarIdioma={setIdioma}
        activo={activo}
        onBuscar={buscar}
        textoGrande={textoGrande}
        alternarTexto={() => setTextoGrande((valor) => !valor)}
       />
      </> */
    <>
      <Ejercicio1 />
    </>
  );
}

export default App
