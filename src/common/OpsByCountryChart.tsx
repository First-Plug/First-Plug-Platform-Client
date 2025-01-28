import React from "react";
import { Bar } from "react-chartjs-2";

interface OpsByCountryChartProps {
  members: any[];
}

const OpsByCountryChart = ({ members }: OpsByCountryChartProps) => {
  const countryCodes: Record<string, string> = {
    Argentina: "AR",
    Bolivia: "BO",
    Brasil: "BR",
    Chile: "CL",
    Colombia: "CO",
    "Costa Rica": "CR",
    Ecuador: "EC",
    "El Salvador": "SV",
    Guatemala: "GT",
    Honduras: "HN",
    Israel: "IL",
    Mexico: "MX",
    Nicaragua: "NI",
    Panama: "PA",
    Paraguay: "PY",
    Perú: "PE",
    Spain: "ES",
    "United States": "US",
    Uruguay: "UY",
    Venezuela: "VE",
  };

  const codeToCountry = Object.fromEntries(
    Object.entries(countryCodes).map(([country, code]) => [code, country])
  );

  const countryData = members.reduce((acc, member) => {
    const countryName = member.country?.trim() || "Incomplete\nData";
    const countryCode = countryCodes[countryName] || "Incomplete\nData";

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
  console.log("computer counts", computersCounts);

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
    <div className="w-full h-full flex items-center justify-center">
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
                  return codeToCountry[code] || "Incomplete Data";
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
