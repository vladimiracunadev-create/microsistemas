/**
 * Adaptador web.
 *
 * Única capa que conoce `fetch`, `Blob` y el portapapeles. El núcleo recibe de
 * aquí un lector de JSON y devuelve datos puros; la interfaz no calcula nada
 * por su cuenta.
 */

import { loadCatalog } from '../../core/catalog/catalog.js';

/** Ruta base de los datos, relativa a `index.html`. */
const DATA_BASE = './data/';

/** Lector de JSON por `fetch`, con mensajes que explican el fallo bajo `file://`. */
export function createFetchReader(base = DATA_BASE) {
  return async function readJson(relativePath) {
    const url = new URL(base + relativePath, window.location.href);
    let response;
    try {
      response = await fetch(url, { cache: 'no-cache' });
    } catch (err) {
      if (window.location.protocol === 'file:') {
        throw new Error(
          'El navegador bloquea la lectura de archivos locales cuando la página se abre con file://. ' +
          'Sirva la carpeta del repositorio por HTTP (por ejemplo con el contenedor del repositorio o un servidor local) y vuelva a abrir la aplicación.'
        );
      }
      throw new Error(`No se pudo leer ${relativePath}: ${err.message}`);
    }
    if (!response.ok) {
      throw new Error(`No se pudo leer ${relativePath}: HTTP ${response.status}`);
    }
    return response.json();
  };
}

/** Carga el catálogo para el navegador. */
export async function loadCatalogForWeb(options = {}) {
  return loadCatalog(createFetchReader(options.base), options);
}

/** Indica si la página se abrió como archivo local, donde `fetch` está bloqueado. */
export function isFileProtocol() {
  return typeof window !== 'undefined' && window.location.protocol === 'file:';
}

/** Descarga un texto como archivo. */
export function downloadText(filename, text, mime = 'text/markdown;charset=utf-8') {
  triggerDownload(filename, new Blob([text], { type: mime }));
}

/** Descarga bytes como archivo. */
export function downloadBytes(filename, bytes, mime = 'application/zip') {
  triggerDownload(filename, new Blob([bytes], { type: mime }));
}

function triggerDownload(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Copia texto al portapapeles, con alternativa cuando la API no está disponible. */
export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true, method: 'clipboard' };
    } catch (err) {
      // Continúa con la alternativa.
    }
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', 'readonly');
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (err) {
    ok = false;
  }
  area.remove();
  return { ok, method: 'fallback' };
}

/**
 * Persistencia local opcional y controlada.
 * Nunca se activa por su cuenta: la interfaz solo guarda cuando la persona lo
 * pide, y `clear` elimina todo rastro.
 */
const STORAGE_KEY = 'sas.savedConfigs.v1';

export function listSavedConfigs() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

export function saveConfig(name, config) {
  try {
    const list = listSavedConfigs().filter((item) => item.name !== name);
    list.unshift({ name, savedAt: new Date().toISOString(), config });
    const trimmed = list.slice(0, 20);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return { ok: true, count: trimmed.length };
  } catch (err) {
    return { ok: false, error: 'El navegador no permitió guardar (modo privado o almacenamiento lleno).' };
  }
}

export function deleteSavedConfig(name) {
  try {
    const list = listSavedConfigs().filter((item) => item.name !== name);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return { ok: true };
  } catch (err) {
    return { ok: false };
  }
}

export function clearSavedConfigs() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return { ok: true };
  } catch (err) {
    return { ok: false };
  }
}

/** Lee un archivo elegido por la persona, con límite de tamaño. */
export function readUploadedFile(file, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No se eligió ningún archivo.'));
      return;
    }
    if (file.size > maxBytes) {
      reject(new Error(`El archivo pesa ${Math.round(file.size / 1024)} KB y el límite es ${Math.round(maxBytes / 1024)} KB.`));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsText(file, 'utf-8');
  });
}
