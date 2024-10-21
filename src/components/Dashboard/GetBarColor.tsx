export const getBarColor = (
  age: number,
  expirationAge: number,
  avgAge: number
) => {
  const sixMonthsBeforeExpiration = expirationAge - 0.5;
  const roundedAvgAge = Math.ceil(avgAge * 2) / 2; // Redondear hacia arriba

  console.log("age", age);
  console.log("expirationAge", expirationAge);
  console.log("avgAge", avgAge);

  // Coloreamos según el valor de age, expirationAge, y avgAge
  if (age <= sixMonthsBeforeExpiration) {
    return "#4FE8B7"; // Verde
  } else if (age > sixMonthsBeforeExpiration && age <= expirationAge) {
    return "#f5efd0"; // Amarillo
  } else if (age > expirationAge && age <= roundedAvgAge) {
    return "#FFC6D3"; // Rojo
  } else {
    return "#d3d3d3"; // Gris para lo que está más allá del avgAge redondeado
  }
};
