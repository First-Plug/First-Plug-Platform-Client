import React from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { countriesByCode } from "@/shared";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface OpsByCountryChartProps {
  members: any[];
}

export const OpsByCountryChart = ({ members }: OpsByCountryChartProps) => {
  const countryData = members.reduce((acc, member) => {
    const countryCode = member.country?.trim() || "Incomplete\nData";

    const computerProducts = (member.products || []).filter(
      (product) => product.category === "Computer"
    );

    acc[countryCode] = acc[countryCode] || {
      membersCount: 0,
      computersCount: 0,
    };
    acc[countryCode].membersCount++;
    acc[countryCode].computersCount += computerProducts.length;

    return acc;
  }, {});

  const countries = Object.keys(countryData);
  const membersCounts = countries.map(
    (country) => countryData[country].membersCount
  );
  const computersCounts = countries.map(
    (country) => countryData[country].computersCount
  );

  const data = {
    labels: countries,
    datasets: [
      {
        label: "Members",
        data: membersCounts,
        backgroundColor: "#9747FF",
        barThickness: 15,
      },
      {
        label: "Computers",
        data: computersCounts,
        backgroundColor: "#4FE8B7",
        barThickness: 15,
      },
    ],
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const code = tooltipItems[0].label;
                  return countriesByCode[code] || "Incomplete Data";
                },
                label: (tooltipItem) => {
                  return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                callback: function (value, index) {
                  const label =
                    typeof value === "string"
                      ? value
                      : this.getLabelForValue(value);
                  return label.includes("\n") ? label.split("\n") : label;
                },
                align: "center",
                padding: 10,
              },
              title: {
                display: true,
                text: "Countries",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Quantity",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default OpsByCountryChart;
