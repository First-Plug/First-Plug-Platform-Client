"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, ChartOptions, ChartData } from "chart.js";
Chart.register(ArcElement);

interface DoughnutChartProps {
  data: {
    quantity?: number;
    stock?: number;
  };
}

export function DoughnutChart({ data }: DoughnutChartProps) {
  const stock = data.stock || 0;
  const quantity = data.quantity || 0;

  const assignedColor = "#9747FF";
  const availableColor = "#4FE8B7";

  const info: ChartData<"doughnut"> = {
    labels: ["Assigned", "Available"],
    datasets: [
      {
        data: [quantity, stock],
        backgroundColor: [assignedColor, availableColor],
        hoverBackgroundColor: ["#fff", "#fff"],
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
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
    <figure className="relative mx-auto flex flex-col items-center w-full h-full max-h-full">
      <div className="absolute w-[90%] h-[90%] flex flex-col gap-4">
        <div className="relative cursor-pointer">
          <Doughnut data={info} options={options} className="object-contain" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <span className="text-dark-grey font-medium">Total</span>
              <span className="font-bold text-2xl">{quantity + stock}</span>
            </div>
          </div>
        </div>
        <figcaption className="flex gap-2 w-full justify-center items-center">
          <div className="flex gap-1 items-center">
            <div
              className="h-[1rem] w-[1rem]"
              style={{ backgroundColor: assignedColor }}
            ></div>
            <p>
              Assigned | <b>{quantity}</b>
            </p>
          </div>
          <div className="flex gap-1 items-center">
            <div
              className="h-[1rem] w-[1rem]"
              style={{ backgroundColor: availableColor }}
            ></div>
            <p>
              Available | <b>{stock}</b>
            </p>
          </div>
        </figcaption>
      </div>
    </figure>
  );
}
