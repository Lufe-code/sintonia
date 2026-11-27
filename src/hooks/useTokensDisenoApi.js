import { useEffect } from "react";
import { API_ORIGIN } from "../config/api.js";

export function useTokensDisenoApi() {
  useEffect(() => {
    const hojaEstilos = document.createElement("link");
    hojaEstilos.rel = "stylesheet";
    hojaEstilos.href = `${API_ORIGIN}/docs/diseno/tokens.css`;
    hojaEstilos.dataset.tokensDisenoApi = "true";
    document.head.append(hojaEstilos);

    return () => hojaEstilos.remove();
  }, []);
}
