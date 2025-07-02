import { useMemo } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { getBarColor, useComputerAge } from "@/features/dashboard";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ComputerAgeChartProps {
  products: any[];
  onAvgAgeCalculated: (avgAge: number) => void;
  computerExpiration: number;
}

export const ComputerAgeChart = ({
  products,
  onAvgAgeCalculated,
  computerExpiration,
}: ComputerAgeChartProps) => {
  const avgAge = useComputerAge(products, onAvgAgeCalculated);
  const roundedAvgAge = Math.ceil(avgAge * 2) / 2;

  const data = useMemo(
    () => ({
      labels: [
        "0-6 months",
        "6-12 months",
        "12-18 months",
        "18-24 months",
        "24-30 months",
        "30-36 months",
        "36-42 months",
        "42-48 months",
        "48-54 months",
        "54-60 months",
      ],
      datasets: [
        {
          label: "Computer Age",
          data: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
          backgroundColor: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((age) =>
            age <= roundedAvgAge
              ? getBarColor(age, computerExpiration, roundedAvgAge)
              : "#d3d3d3"
          ),
          borderWidth: 0.2,
          borderRadius: 4,
          barThickness: 20,
        },
      ],
    }),
    [roundedAvgAge, computerExpiration]
  );

  const options = useMemo(
    () => ({
      scales: {
        y: {
          display: false,
          beginAtZero: true,
          max: 5,
        },
        x: {
          display: false,
          categoryPercentage: 0.6,
          barPercentage: 0.8,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      layout: {
        padding: 0,
      },
      animation: {
        duration: 100,
      },
      responsive: true,
      maintainAspectRatio: true,
    }),
    []
  );

  return (
    <div className="mt-14 w-32 h-20">
      <Bar data={data} options={options} />
    </div>
  );
};
