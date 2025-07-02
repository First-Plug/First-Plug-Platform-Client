import React from "react";

interface ProgressCircleProps {
  productsWithDate: number;
  productsWithoutDate: number;
}

export const ProgressCircle = ({
  productsWithDate,
  productsWithoutDate,
}: ProgressCircleProps) => {
  return (
    <div className="flex flex-col items-start w-full">
      <p className="mb-2 font-medium text-dark-grey text-sm">
        Computers with completed Acquisition Date:
      </p>
      <div className="flex flex-row justify-start items-center gap-4 w-full">
        <figcaption className="flex flex-row justify-start items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="rounded-sm w-[1rem] h-[1rem]"
              style={{ backgroundColor: "#4FE8B7" }}
            ></div>
            <p className="font-semibold text-sm">
              Completed | <b>{productsWithDate}</b>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="rounded-sm w-[1rem] h-[1rem]"
              style={{ backgroundColor: "#FFC6D3" }}
            ></div>
            <p className="font-semibold text-sm">
              Non completed | <b>{productsWithoutDate}</b>
            </p>
          </div>
        </figcaption>
      </div>
    </div>
  );
};
