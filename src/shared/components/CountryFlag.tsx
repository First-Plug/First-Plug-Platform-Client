"use client";

import React from "react";
import Image from "next/image";
import { getCountryCode } from "@/features/members/utils/countryUtils";

interface CountryFlagProps {
  countryName: string;
  size?: number;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryName,
  size = 24,
  className = "",
}) => {
  const countryCode = getCountryCode(countryName);

  if (!countryCode) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-400 text-xs">-</span>
      </div>
    );
  }

  return (
    <Image
      src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`}
      alt={`${countryName}`}
      width={size}
      height={size}
      className={`shadow-sm ${className}`}
      onError={() => {}}
    />
  );
};

export default CountryFlag;
