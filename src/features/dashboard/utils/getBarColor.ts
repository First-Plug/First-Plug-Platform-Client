export const getBarColor = (
  age: number,
  expirationAge: number,
  avgAge: number
) => {
  const sixMonthsBeforeExpiration = expirationAge - 0.5;
  const roundedAvgAge = Math.ceil(avgAge * 2) / 2;

  if (age <= sixMonthsBeforeExpiration) {
    return "#4FE8B7";
  } else if (age > sixMonthsBeforeExpiration && age <= expirationAge) {
    return "#f5efd0";
  } else if (age > expirationAge && age <= roundedAvgAge) {
    return "#FFC6D3";
  } else {
    return "#d3d3d3";
  }
};
