import { useEffect, useState } from "react";
import { api } from "./api.js";
import { getHeroSlides } from "../Admin/bannersStore.js";

// hero slides: what is saved here at first, then the banners from the server
export function useHeroSlides(defaults) {
  const [slides, setSlides] = useState(() => getHeroSlides(defaults));
  useEffect(() => {
    let alive = true;
    api("/banners")
      .then((list) => {
        const ok = list.filter((b) => b.image && b.title && b.title.length);
        if (alive && ok.length) {
          setSlides(
            ok.map((b) => ({ tag: b.tag, title: b.title, text: b.text, button: b.button, link: b.link, image: b.image }))
          );
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return slides;
}