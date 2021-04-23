export function keyAsString(key) {
  if (key === undefined || key === null) {
    return '';
  }

  if (typeof key === 'string' || key instanceof String) {
    return key;
  }

  if (Array.isArray(key)) {
    return key.reduce((a, v) => {
      return a + (a ? '&' : '') + encodeURIComponent(v);
    }, '');
  }

  if (typeof key === 'object') {
    const k = key;
    return Object.keys(k).sort().reduce((a, v) => {
      return a + (a ? '&' : '') + encodeURIComponent(v) + '=' + encodeURIComponent(k[v]);
    }, '');
  }

  return key.toString(); // Last resort...
}