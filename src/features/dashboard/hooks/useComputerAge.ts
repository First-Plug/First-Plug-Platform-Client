import { useEffect, useState } from "react";

export const useComputerAge = (
  products: any[],
  onAvgAgeCalculated: (avgAge: number) => void
) => {
  const [avgAge, setAvgAge] = useState<number>(0);

  useEffect(() => {
    const allComputers = products
      .flatMap((category) => category.products)
      .filter((product) => product.category === "Computer");

    const productsWithAcquisitionDate = allComputers.filter(
      (product) => product.acquisitionDate && product.acquisitionDate !== ""
    );

    const totalYears = productsWithAcquisitionDate.map((product) => {
      const acquisitionDate = new Date(product.acquisitionDate);
      const yearsSinceAcquisition =
        (Date.now() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

      return yearsSinceAcquisition;
    });

    if (totalYears.length) {
      const sumYears = totalYears.reduce((a, b) => a + b, 0);
      const avg = sumYears / totalYears.length;

      setAvgAge(avg);
      onAvgAgeCalculated(avg);
    }
  }, [products, onAvgAgeCalculated]);

  return avgAge;
};
