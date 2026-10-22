import React, { useState } from 'react'

export const Ejercicio1 = () => {
    const [nombre, setNombre] = useState("");

    function agregarNombre() {
        setNombre(nombre);
    }

    return (
        <>
            <button onClick={agregarNombre}>Agregar Nombre</button>
            <input type="text" value={nombre} onChange={(nuevoNombre) => setNombre(nuevoNombre.target.value)} />
        </>
    )
}
