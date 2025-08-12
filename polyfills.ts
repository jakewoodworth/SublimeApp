if (typeof (window as any).structuredClone !== 'function') {
  (window as any).structuredClone = (value: unknown) => JSON.parse(JSON.stringify(value));
}
