export const getBarColor = (age: number, roundedAvgAge: number) => {
  if (age <= 2.5) {
    return age <= roundedAvgAge ? "#4FE8B7" : "#d3d3d3";
  } else if (age > 2.5 && age <= 3) {
    return age <= roundedAvgAge ? "#f5efd0" : "#d3d3d3";
  } else {
    return age <= roundedAvgAge ? "#FFC6D3" : "#d3d3d3";
  }
};
