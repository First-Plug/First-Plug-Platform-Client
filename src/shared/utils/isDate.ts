export const isDate = (value: unknown) =>
  value instanceof Date && !isNaN(value.valueOf());
