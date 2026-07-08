export function node(type, properties = {}, token = null) {
  return {
    type,
    line: token?.line ?? 1,
    column: token?.column ?? 1,
    ...properties
  };
}
