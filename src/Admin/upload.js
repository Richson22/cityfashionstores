import { uploadImage } from "../data/api.js";

// shrink the photo in the browser, then send it to Cloudinary. Returns the photo's link.
function shrinkToBlob(file, max, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not read that photo"))),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that photo"));
    };
    img.src = url;
  });
}

export async function uploadPhoto(file, max = 1400) {
  const blob = await shrinkToBlob(file, max, 0.85);
  return uploadImage(new File([blob], "photo.jpg", { type: "image/jpeg" }));
}