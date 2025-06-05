"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, ChartOptions, ChartData } from "chart.js";
import { InventoryStatusLegend } from "@/features/assets";
Chart.register(ArcElement);

interface DoughnutChartProps {
  data: {
    quantity?: number;
    stock?: number;
    unavailable?: number;
    inTransit?: number;
    inTransitMissingData?: number;
  };
}

export function DoughnutChart({ data }: DoughnutChartProps) {
  const stock = data.stock || 0;
  const quantity = data.quantity || 0;
  const unavailable = data.unavailable || 0;
  const inTransit = data.inTransit || 0;
  const inTransitMissingData = data.inTransitMissingData || 0;

  const assignedColor = "#9747FF";
  const availableColor = "#4FE8B7";
  const unavailableColor = "#FFC6D3";
  const inTransitColor = "#FFD59E";
  const inTransitMissingDataColor = "#FF8A80";

  const info: ChartData<"doughnut"> = {
    labels: [
      "Assigned",
      "Available",
      "Unavailable",
      "In Transit",
      "In Transit - Missing Data",
    ],
    datasets: [
      {
        data: [quantity, stock, unavailable, inTransit, inTransitMissingData],
        backgroundColor: [
          assignedColor,
          availableColor,
          unavailableColor,
          inTransitColor,
          inTransitMissingDataColor,
        ],
        hoverBackgroundColor: ["#fff", "#fff"],
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    // responsive: true,
    // maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.label + ": " + context.parsed + " units";
          },
        },
      },
    },
  };

  return (
    <figure className="flex w-full h-full overflow-hidden">
      <div className="flex flex-col gap-4 w-[40%] h-[40%]">
        <div className="relative cursor-pointer">
          <Doughnut data={info} options={options} className="object-contain" />

          <div className="absolute inset-0 flex justify-center items-center">
            <div className="flex flex-col items-center">
              <span className="font-medium text-dark-grey">Total</span>
              <span className="font-bold text-2xl">
                {quantity +
                  stock +
                  unavailable +
                  inTransit +
                  inTransitMissingData}
              </span>
            </div>
          </div>
        </div>
      </div>

      <InventoryStatusLegend
        assigned={quantity}
        available={stock}
        inTransit={inTransit}
        inTransitMissingData={inTransitMissingData}
        unavailable={unavailable}
        assignedColor={assignedColor}
        availableColor={availableColor}
        unavailableColor={unavailableColor}
        inTransitColor={inTransitColor}
        inTransitMissingDataColor={inTransitMissingDataColor}
      />
    </figure>
  );
}
