export const isProductCompleted = (product) => {
  for (const key of Object.keys(product)) {
    if (product[key]) {
      return true;
    }
  }
  return false;
};
