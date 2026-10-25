import { useEffect, useState } from "react";
import { api } from "./api.js";
import { getSettings } from "../Admin/settingsStore.js";

// store pages use this: shows what is saved here at first, then the real settings from the server
export function useSettings() {
  const [s, setS] = useState(getSettings);
  useEffect(() => {
    let alive = true;
    api("/settings")
      .then((d) => alive && setS({ ...getSettings(), ...d }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return s;
}