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

const OpsByCountryChart = ({ members }: OpsByCountryChartProps) => {
  const countryCodes: Record<string, string> = {
    "Antigua and Barbuda": "AG",
    Argentina: "AR",
    Bahamas: "BS",
    Barbados: "BB",
    Belize: "BZ",
    Bolivia: "BO",
    Brazil: "BR",
    Canada: "CA",
    Chile: "CL",
    Colombia: "CO",
    "Costa Rica": "CR",
    Cuba: "CU",
    Dominica: "DM",
    "Dominican Republic": "DO",
    Ecuador: "EC",
    "El Salvador": "SV",
    Grenada: "GD",
    Guatemala: "GT",
    Guyana: "GY",
    Haiti: "HT",
    Honduras: "HN",
    Jamaica: "JM",
    Mexico: "MX",
    Nicaragua: "NI",
    Panama: "PA",
    Paraguay: "PY",
    Peru: "PE",
    "Saint Kitts and Nevis": "KN",
    "Saint Lucia": "LC",
    "Saint Vincent and the Grenadines": "VC",
    Suriname: "SR",
    "Trinidad and Tobago": "TT",
    "United States": "US",
    Uruguay: "UY",
    Venezuela: "VE",
    Afghanistan: "AF",
    Albania: "AL",
    Algeria: "DZ",
    Andorra: "AD",
    Angola: "AO",
    Armenia: "AM",
    Australia: "AU",
    Austria: "AT",
    Azerbaijan: "AZ",
    Bahrain: "BH",
    Bangladesh: "BD",
    Belarus: "BY",
    Belgium: "BE",
    Benin: "BJ",
    Bhutan: "BT",
    "Bosnia and Herzegovina": "BA",
    Botswana: "BW",
    Brunei: "BN",
    Bulgaria: "BG",
    "Burkina Faso": "BF",
    Burundi: "BI",
    "Cabo Verde": "CV",
    Cambodia: "KH",
    Cameroon: "CM",
    "Central African Republic": "CF",
    Chad: "TD",
    China: "CN",
    Comoros: "KM",
    "Congo (Congo-Brazzaville)": "CG",
    Cyprus: "CY",
    "Czech Republic (Czechia)": "CZ",
    "Democratic Republic of the Congo (Congo-Kinshasa)": "CD",
    Denmark: "DK",
    Djibouti: "DJ",
    Egypt: "EG",
    "Equatorial Guinea": "GQ",
    Eritrea: "ER",
    Estonia: "EE",
    "Eswatini (Swaziland)": "SZ",
    Ethiopia: "ET",
    Fiji: "FJ",
    Finland: "FI",
    France: "FR",
    Gabon: "GA",
    Gambia: "GM",
    Georgia: "GE",
    Germany: "DE",
    Ghana: "GH",
    Greece: "GR",
    Guinea: "GN",
    "Guinea-Bissau": "GW",
    Iceland: "IS",
    India: "IN",
    Indonesia: "ID",
    Iran: "IR",
    Iraq: "IQ",
    Ireland: "IE",
    Israel: "IL",
    Italy: "IT",
    "Ivory Coast (Côte d'Ivoire)": "CI",
    Japan: "JP",
    Jordan: "JO",
    Kazakhstan: "KZ",
    Kenya: "KE",
    Kiribati: "KI",
    Kuwait: "KW",
    Kyrgyzstan: "KG",
    Laos: "LA",
    Latvia: "LV",
    Lebanon: "LB",
    Lesotho: "LS",
    Liberia: "LR",
    Libya: "LY",
    Liechtenstein: "LI",
    Lithuania: "LT",
    Luxembourg: "LU",
    Madagascar: "MG",
    Malawi: "MW",
    Malaysia: "MY",
    Maldives: "MV",
    Mali: "ML",
    Malta: "MT",
    "Marshall Islands": "MH",
    Mauritania: "MR",
    Mauritius: "MU",
    Micronesia: "FM",
    Moldova: "MD",
    Monaco: "MC",
    Mongolia: "MN",
    Montenegro: "ME",
    Morocco: "MA",
    Mozambique: "MZ",
    "Myanmar (Burma)": "MM",
    Namibia: "NA",
    Nauru: "NR",
    Nepal: "NP",
    Netherlands: "NL",
    "New Zealand": "NZ",
    Niger: "NE",
    Nigeria: "NG",
    "North Korea": "KP",
    "North Macedonia": "MK",
    Norway: "NO",
    Oman: "OM",
    Pakistan: "PK",
    Palau: "PW",
    Palestine: "PS",
    "Papua New Guinea": "PG",
    Philippines: "PH",
    Poland: "PL",
    Portugal: "PT",
    Qatar: "QA",
    Romania: "RO",
    Russia: "RU",
    Rwanda: "RW",
    Samoa: "WS",
    "San Marino": "SM",
    "São Tomé and Príncipe": "ST",
    "Saudi Arabia": "SA",
    Senegal: "SN",
    Serbia: "RS",
    Seychelles: "SC",
    "Sierra Leone": "SL",
    Singapore: "SG",
    Slovakia: "SK",
    Slovenia: "SI",
    "Solomon Islands": "SB",
    Somalia: "SO",
    "South Africa": "ZA",
    "South Korea": "KR",
    "South Sudan": "SS",
    Spain: "ES",
    "Sri Lanka": "LK",
    Sudan: "SD",
    Sweden: "SE",
    Switzerland: "CH",
    Syria: "SY",
    Taiwan: "TW",
    Tajikistan: "TJ",
    Tanzania: "TZ",
    Thailand: "TH",
    "Timor-Leste": "TL",
    Togo: "TG",
    Tonga: "TO",
    Tunisia: "TN",
    Turkey: "TR",
    Turkmenistan: "TM",
    Tuvalu: "TV",
    Uganda: "UG",
    Ukraine: "UA",
    "United Arab Emirates": "AE",
    "United Kingdom": "GB",
    Uzbekistan: "UZ",
    Vanuatu: "VU",
    "Vatican City": "VA",
    Vietnam: "VN",
    Yemen: "YE",
    Zambia: "ZM",
    Zimbabwe: "ZW",
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
