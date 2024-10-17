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
import React from "react";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ComputerAgeChartProps {
  products: any[];
  avgAge: number;
}

const ComputerAgeChart = ({ avgAge }: ComputerAgeChartProps) => {
  const data = {
    labels: ["1 ", "2 ", "3", "4 ", "5", "6", "7", "8", "9", "10"],
    datasets: [
      {
        label: "Computer Age",

        data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        backgroundColor: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) =>
          year <= avgAge ? "#9747FF" : "#d3d3d3"
        ),
        borderWidth: 0.2,
        borderRadius: 4,
        barThickness: 14,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        display: false,
        beginAtZero: true,
        max: 10,
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
    },
    layout: {
      padding: 0,
    },
    animation: {
      duration: 100,
    },
    responsive: true,
    maintainAspectRatio: true,
  };

  return (
    <div className="w-32 h-20 mt-14">
      {" "}
      <Bar data={data} options={options} />
    </div>
  );
};

export default ComputerAgeChart;
