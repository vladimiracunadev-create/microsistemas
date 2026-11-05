/**
 * Escritor de archivos ZIP sin dependencias externas.
 *
 * Usa el método de almacenamiento (sin compresión), que es el mínimo exigido
 * por la especificación del formato y es legible por cualquier herramienta
 * estándar. Se eligió no comprimir para no introducir una dependencia de
 * terceros ni un algoritmo propio sin pruebas suficientes.
 *
 * Produce un Uint8Array, utilizable tanto en navegador (Blob) como en Node
 * (Buffer.from).
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

/** CRC-32 estándar (polinomio 0xEDB88320). */
export function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function utf8(text) {
  if (typeof TextEncoder === 'function') return new TextEncoder().encode(text);
  return Uint8Array.from(Buffer.from(text, 'utf8'));
}

/** Convierte una fecha a los campos de fecha y hora del formato ZIP. */
function dosDateTime(date) {
  const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = Math.max(d.getFullYear(), 1980);
  const time = ((d.getHours() & 0x1f) << 11) | ((d.getMinutes() & 0x3f) << 5) | ((Math.floor(d.getSeconds() / 2)) & 0x1f);
  const dateField = (((year - 1980) & 0x7f) << 9) | (((d.getMonth() + 1) & 0x0f) << 5) | (d.getDate() & 0x1f);
  return { time, date: dateField };
}

class ByteWriter {
  constructor() {
    this.chunks = [];
    this.length = 0;
  }

  push(bytes) {
    this.chunks.push(bytes);
    this.length += bytes.length;
  }

  u16(value) {
    const b = new Uint8Array(2);
    b[0] = value & 0xff;
    b[1] = (value >>> 8) & 0xff;
    this.push(b);
  }

  u32(value) {
    const b = new Uint8Array(4);
    b[0] = value & 0xff;
    b[1] = (value >>> 8) & 0xff;
    b[2] = (value >>> 16) & 0xff;
    b[3] = (value >>> 24) & 0xff;
    this.push(b);
  }

  concat() {
    const out = new Uint8Array(this.length);
    let offset = 0;
    for (const chunk of this.chunks) {
      out.set(chunk, offset);
      offset += chunk.length;
    }
    return out;
  }
}

/**
 * Crea un ZIP a partir de un mapa { ruta: contenido }.
 * El contenido puede ser texto o Uint8Array.
 * @param {Record<string, string|Uint8Array>} files
 * @param {{ date?: Date }} [options]
 * @returns {Uint8Array}
 */
export function createZip(files, options = {}) {
  const entries = [];
  const local = new ByteWriter();
  const { time, date } = dosDateTime(options.date);

  for (const [rawPath, rawContent] of Object.entries(files)) {
    const path = String(rawPath).replace(/\\/g, '/').replace(/^\/+/, '');
    if (path === '' || path.includes('..')) {
      throw new Error(`Ruta no válida para el ZIP: "${rawPath}"`);
    }
    const nameBytes = utf8(path);
    const content = typeof rawContent === 'string' ? utf8(rawContent) : rawContent;
    const crc = crc32(content);
    const offset = local.length;

    local.u32(0x04034b50); // firma de cabecera local
    local.u16(20);         // versión mínima
    local.u16(0x0800);     // nombre en UTF-8
    local.u16(0);          // método: almacenado
    local.u16(time);
    local.u16(date);
    local.u32(crc);
    local.u32(content.length);
    local.u32(content.length);
    local.u16(nameBytes.length);
    local.u16(0);
    local.push(nameBytes);
    local.push(content);

    entries.push({ nameBytes, crc, size: content.length, offset });
  }

  const central = new ByteWriter();
  for (const e of entries) {
    central.u32(0x02014b50); // firma de cabecera central
    central.u16(20);         // versión que creó el archivo
    central.u16(20);         // versión mínima
    central.u16(0x0800);
    central.u16(0);
    central.u16(time);
    central.u16(date);
    central.u32(e.crc);
    central.u32(e.size);
    central.u32(e.size);
    central.u16(e.nameBytes.length);
    central.u16(0);
    central.u16(0);
    central.u16(0);
    central.u16(0);
    central.u32(0);
    central.u32(e.offset);
    central.push(e.nameBytes);
  }

  const end = new ByteWriter();
  end.u32(0x06054b50); // firma de fin de directorio central
  end.u16(0);
  end.u16(0);
  end.u16(entries.length);
  end.u16(entries.length);
  end.u32(central.length);
  end.u32(local.length);
  end.u16(0);

  const localBytes = local.concat();
  const centralBytes = central.concat();
  const endBytes = end.concat();

  const out = new Uint8Array(localBytes.length + centralBytes.length + endBytes.length);
  out.set(localBytes, 0);
  out.set(centralBytes, localBytes.length);
  out.set(endBytes, localBytes.length + centralBytes.length);
  return out;
}
