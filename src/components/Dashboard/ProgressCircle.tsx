import React from "react";
import "react-circular-progressbar/dist/styles.css";

interface ProgressCircleProps {
  productsWithDate: number;
  productsWithoutDate: number;
}

const ProgressCircle = ({
  productsWithDate,
  productsWithoutDate,
}: ProgressCircleProps) => {
  const data = {
    labels: ["With Date", "Without Date"],
    datasets: [
      {
        data: [productsWithDate, productsWithoutDate],
        backgroundColor: ["#9747FF", "#FF5733"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col items-start w-full">
      <p className="mb-2 text-dark-grey font-medium text-sm">
        Computer with Completed Acquisition Date
      </p>
      <div className="flex flex-row items-center justify-start w-full gap-4">
        <figcaption className="flex flex-row items-center justify-start gap-4">
          <div className="flex gap-2 items-center">
            <div
              className="h-[1rem] w-[1rem] rounded-sm"
              style={{ backgroundColor: "#4FE8B7" }}
            ></div>
            <p className="text-sm font-semibold">
              Complete Date | <b>{productsWithDate}</b>
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div
              className="h-[1rem] w-[1rem] rounded-sm"
              style={{ backgroundColor: "#FFC6D3" }}
            ></div>
            <p className="text-sm font-semibold">
              Non-Completed Date | <b>{productsWithoutDate}</b>
            </p>
          </div>
        </figcaption>
      </div>
    </div>
  );
};

export default ProgressCircle;
