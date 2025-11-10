import { Buffer } from 'node:buffer';

const DEFAULT_MAX_DEPTH = Number(process.env.NORMALIZE_MAX_DEPTH ?? 200);
const FAST_STRING_LENGTH = Number(process.env.NORMALIZE_FAST_STRING_LENGTH ?? 64);

const SKIP_CONSTRUCTORS = new Set([Date, RegExp, URL, Error, Map, Set]);

const isTypedArray = (value) => ArrayBuffer.isView(value) && !(value instanceof DataView);

const shouldSkipObject = (value) => {
  if (!value || typeof value !== 'object') return true;
  if (SKIP_CONSTRUCTORS.has(value.constructor)) return true;
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return true;
  if (isTypedArray(value)) return true;
  return false;
};

const normalizeString = (value) => {
  if (typeof value !== 'string') return value;
  if (value.length < FAST_STRING_LENGTH) {
    const normalized = value.normalize('NFC');
    return normalized === value ? value : normalized;
  }
  return value.normalize('NFC');
};

export function normalizeUnicode(value, options = {}) {
  const {
    maxDepth = DEFAULT_MAX_DEPTH,
    currentDepth = 0,
    visited = new WeakMap(),
    stats
  } = options;

  if (typeof value === 'string') {
    return normalizeString(value);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (currentDepth >= maxDepth) {
    if (stats) {
      stats.depthExceeded = true;
    }
    return value;
  }

  if (shouldSkipObject(value)) {
    return value;
  }

  if (visited.has(value)) {
    return visited.get(value);
  }

  if (Array.isArray(value)) {
    const placeholder = new Array(value.length);
    visited.set(value, placeholder);
    let mutated = false;
    for (let index = 0; index < value.length; index += 1) {
      const entry = value[index];
      const normalizedEntry = normalizeUnicode(entry, {
        maxDepth,
        currentDepth: currentDepth + 1,
        visited,
        stats
      });
      placeholder[index] = normalizedEntry;
      if (normalizedEntry !== entry) {
        mutated = true;
      }
    }
    if (!mutated) {
      visited.set(value, value);
      return value;
    }
    return placeholder;
  }

  const placeholder = {};
  visited.set(value, placeholder);
  let mutated = false;
  for (const [key, entry] of Object.entries(value)) {
    const normalizedEntry = normalizeUnicode(entry, {
      maxDepth,
      currentDepth: currentDepth + 1,
      visited,
      stats
    });
    placeholder[key] = normalizedEntry;
    if (normalizedEntry !== entry) {
      mutated = true;
    }
  }
  if (!mutated) {
    visited.set(value, value);
    return value;
  }
  return placeholder;
}

export default {
  normalizeUnicode
};
