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

export const OpsByCountryChart = ({ members }: OpsByCountryChartProps) => {
  const countryCodes: Record<string, string> = {
    "Antigua and Barbuda": "AG",
    Argentina: "AR",
    Bahamas: "BS",
    Barbados: "BB",
    Belize: "BZ",
    Bolivia: "BO",
    Brazil: "BR",
    Brasil: "BR",
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
    México: "MX",
    Nicaragua: "NI",
    Panama: "PA",
    Panamá: "PA",
    Paraguay: "PY",
    Peru: "PE",
    Perú: "PE",
    "Saint Kitts and Nevis": "KN",
    "Saint Lucia": "LC",
    "Saint Vincent and the Grenadines": "VC",
    Suriname: "SR",
    "Trinidad and Tobago": "TT",
    "United States": "US",
    "Estados Unidos": "US",
    USA: "US",
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
    "China (Mainland)": "CN",
    Comoros: "KM",
    "Congo (Congo-Brazzaville)": "CG",
    Cyprus: "CY",
    "Czech Republic (Czechia)": "CZ",
    "Czech Republic": "CZ",
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
    Alemania: "DE",
    Ghana: "GH",
    Greece: "GR",
    Grecia: "GR",
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
    Italia: "IT",
    "Ivory Coast (Côte d'Ivoire)": "CI",
    Japan: "JP",
    Japón: "JP",
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
    Marruecos: "MA",
    Mozambique: "MZ",
    "Myanmar (Burma)": "MM",
    Namibia: "NA",
    Nauru: "NR",
    Nepal: "NP",
    Netherlands: "NL",
    "Países Bajos": "NL",
    "New Zealand": "NZ",
    "Nueva Zelanda": "NZ",
    Niger: "NE",
    Nigeria: "NG",
    "North Korea": "KP",
    "North Macedonia": "MK",
    Norway: "NO",
    Noruega: "NO",
    Oman: "OM",
    Pakistan: "PK",
    Palau: "PW",
    Palestine: "PS",
    "Papua New Guinea": "PG",
    Philippines: "PH",
    Filipinas: "PH",
    Poland: "PL",
    Polonia: "PL",
    Portugal: "PT",
    Qatar: "QA",
    Romania: "RO",
    Rumania: "RO",
    Russia: "RU",
    Rusia: "RU",
    Rwanda: "RW",
    Samoa: "WS",
    "San Marino": "SM",
    "São Tomé and Príncipe": "ST",
    "Saudi Arabia": "SA",
    "Arabia Saudita": "SA",
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
    Sudáfrica: "ZA",
    "South Korea": "KR",
    "Corea del Sur": "KR",
    "South Sudan": "SS",
    Spain: "ES",
    España: "ES",
    "Sri Lanka": "LK",
    Sudan: "SD",
    Sweden: "SE",
    Suecia: "SE",
    Switzerland: "CH",
    Suiza: "CH",
    Syria: "SY",
    Siria: "SY",
    Taiwan: "TW",
    Tajikistan: "TJ",
    Tanzania: "TZ",
    Thailand: "TH",
    Tailandia: "TH",
    "Timor-Leste": "TL",
    Togo: "TG",
    Tonga: "TO",
    Tunisia: "TN",
    Túnez: "TN",
    Turkey: "TR",
    Turquía: "TR",
    Turkmenistan: "TM",
    Tuvalu: "TV",
    Uganda: "UG",
    Ukraine: "UA",
    Ucrania: "UA",
    "United Arab Emirates": "AE",
    "Emiratos Árabes Unidos": "AE",
    "United Kingdom": "GB",
    "Reino Unido": "GB",
    UK: "GB",
    Uzbekistan: "UZ",
    Vanuatu: "VU",
    "Vatican City": "VA",
    "Ciudad del Vaticano": "VA",
    Vietnam: "VN",
    Yemen: "YE",
    Zambia: "ZM",
    Zimbabwe: "ZW",
  };

  // Función para normalizar nombres de países
  const normalizeCountryName = (countryName: string): string => {
    if (!countryName) return "Incomplete\nData";

    const normalized = countryName.trim();

    // Si ya existe en el mapeo, devolver el código
    if (countryCodes[normalized]) {
      return countryCodes[normalized];
    }

    // Buscar coincidencias parciales o variaciones comunes
    const lowerNormalized = normalized.toLowerCase();

    // Mapeo de variaciones comunes
    const variations: Record<string, string> = {
      brasil: "BR",
      brazil: "BR",
      mexico: "MX",
      méxico: "MX",
      panama: "PA",
      panamá: "PA",
      peru: "PE",
      perú: "PE",
      "estados unidos": "US",
      "united states": "US",
      usa: "US",
      "reino unido": "GB",
      "united kingdom": "GB",
      uk: "GB",
      espana: "ES",
      españa: "ES",
      spain: "ES",
      alemania: "DE",
      germany: "DE",
      francia: "FR",
      france: "FR",
      italia: "IT",
      italy: "IT",
      japon: "JP",
      japón: "JP",
      japan: "JP",
      china: "CN",
      rusia: "RU",
      russia: "RU",
      canada: "CA",
      australia: "AU",
      "nueva zelanda": "NZ",
      "new zealand": "NZ",
      sudafrica: "ZA",
      sudáfrica: "ZA",
      "south africa": "ZA",
      "corea del sur": "KR",
      "south korea": "KR",
      filipinas: "PH",
      philippines: "PH",
      polonia: "PL",
      poland: "PL",
      rumania: "RO",
      romania: "RO",
      suecia: "SE",
      sweden: "SE",
      suiza: "CH",
      switzerland: "CH",
      siria: "SY",
      syria: "SY",
      tailandia: "TH",
      thailand: "TH",
      tunez: "TN",
      túnez: "TN",
      tunisia: "TN",
      turquia: "TR",
      turquía: "TR",
      turkey: "TR",
      ucrania: "UA",
      ukraine: "UA",
      "emiratos arabes unidos": "AE",
      "emiratos árabes unidos": "AE",
      "united arab emirates": "AE",
      "ciudad del vaticano": "VA",
      "vatican city": "VA",
      "paises bajos": "NL",
      "países bajos": "NL",
      netherlands: "NL",
      holanda: "NL",
      grecia: "GR",
      greece: "GR",
      marruecos: "MA",
      morocco: "MA",
      noruega: "NO",
      norway: "NO",
      "arabia saudita": "SA",
      "saudi arabia": "SA",
      "republica checa": "CZ",
      "república checa": "CZ",
      "czech republic": "CZ",
      czechia: "CZ",
    };

    if (variations[lowerNormalized]) {
      return variations[lowerNormalized];
    }

    // Si no se encuentra ninguna coincidencia, devolver el nombre original
    return "Incomplete\nData";
  };

  const codeToCountry = Object.fromEntries(
    Object.entries(countryCodes).map(([country, code]) => [code, country])
  );

  const countryData = members.reduce((acc, member) => {
    const countryName = member.country?.trim() || "Incomplete\nData";
    const countryCode = normalizeCountryName(countryName);

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
