"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, ChartOptions, ChartData } from "chart.js";
Chart.register(ArcElement);

interface DoughnutChartProps {
  data: {
    quantity?: number;
    stock?: number;
    unavailable?: number;
  };
}

export function DoughnutChart({ data }: DoughnutChartProps) {
  const stock = data.stock || 0;
  const quantity = data.quantity || 0;
  const unavailable = data.unavailable || 0;

  const assignedColor = "#9747FF";
  const availableColor = "#4FE8B7";
  const unavailableColor = "#FFC6D3";

  const info: ChartData<"doughnut"> = {
    labels: ["Assigned", "Available", "Unavailable"],
    datasets: [
      {
        data: [quantity, stock, unavailable],
        backgroundColor: [assignedColor, availableColor, unavailableColor],
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
    <figure className=" flex w-full h-full overflow-hidden items-centeroverflow-hidden ">
      <div className=" w-[45%] h-[45%] flex flex-col gap-4 ">
        <div className="relative cursor-pointer">
          <Doughnut data={info} options={options} className="object-contain" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <span className="text-dark-grey font-medium">Total</span>
              <span className="font-bold text-2xl">
                {quantity + stock + unavailable}
              </span>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="flex flex-col justify-center items-start w-[40%] h-full p-4 gap-4 ">
        <div className="flex gap-2 items-center">
          <div
            className="h-[1rem] w-[1rem] rounded-sm"
            style={{ backgroundColor: assignedColor }}
          ></div>
          <p className="text-md font-semibold">
            Assigned | <b>{quantity}</b>
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div
            className="h-[1rem] w-[1rem] rounded-sm"
            style={{ backgroundColor: availableColor }}
          ></div>
          <p className="text-md font-semibold">
            Available | <b>{stock}</b>
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div
            className="h-[1rem] w-[1rem] rounded-sm"
            style={{ backgroundColor: unavailableColor }}
          ></div>
          <p className="text-md font-semibold">
            Unavailable | <b>{unavailable}</b>
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
