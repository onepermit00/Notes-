// Camera photos are several megabytes each. Shrink them before they are saved
// with a shift entry so reports load quickly for the manager.
export function shrinkImage(dataUrl, maxSide = 1280, quality = 0.72) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/') || dataUrl.length < 300000) return Promise.resolve(dataUrl);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const out = canvas.toDataURL('image/jpeg', quality);
        resolve(out.length < dataUrl.length ? out : dataUrl);
      } catch { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export const shrinkImages = (urls = []) => Promise.all(urls.filter(url => typeof url === 'string' && url).map(url => shrinkImage(url)));
