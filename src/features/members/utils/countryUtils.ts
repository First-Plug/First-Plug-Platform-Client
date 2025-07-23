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

export const months = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

// Función para normalizar texto removiendo acentos
function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Función para encontrar el código de país normalizando el nombre
export function getCountryCode(countryName: string): string | null {
  if (!countryName) return null;

  // Primero intenta con el nombre exacto
  if (countryCodes[countryName]) {
    return countryCodes[countryName];
  }

  // Si no encuentra, normaliza y busca
  const normalizedInput = normalizeText(countryName);

  for (const [country, code] of Object.entries(countryCodes)) {
    if (normalizeText(country) === normalizedInput) {
      return code;
    }
  }

  return null;
}

// Función para obtener el nombre normalizado del país
export function getNormalizedCountryName(countryName: string): string | null {
  if (!countryName) return null;

  // Primero intenta con el nombre exacto
  if (countryCodes[countryName]) {
    return countryName;
  }

  // Si no encuentra, normaliza y busca
  const normalizedInput = normalizeText(countryName);

  for (const [country, code] of Object.entries(countryCodes)) {
    if (normalizeText(country) === normalizedInput) {
      return country;
    }
  }

  return null;
}

// Función específica para normalizar países para filtros
// Esta función agrupa variaciones del mismo país bajo un nombre estándar
export function getCountryNameForFilter(countryName: string): string | null {
  if (!countryName) return null;

  // Mapeo específico para variaciones de nombres de países
  const countryVariations: Record<string, string> = {
    brasil: "Brazil",
    brazil: "Brazil",
    argentina: "Argentina",
    chile: "Chile",
    colombia: "Colombia",
    mexico: "Mexico",
    "estados unidos": "United States",
    "united states": "United States",
    canada: "Canada",
    // Agregar más variaciones según sea necesario
  };

  const normalizedInput = normalizeText(countryName);

  // Buscar en las variaciones
  if (countryVariations[normalizedInput]) {
    return countryVariations[normalizedInput];
  }

  // Si no se encuentra en las variaciones, usar la función original
  return getNormalizedCountryName(countryName);
}

// Función original para emojis (mantenida por compatibilidad)
export function getFlagEmoji(countryName: string): string {
  const countryCode = getCountryCode(countryName);

  if (!countryCode) return "";

  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

// Nueva función para mostrar código de país en lugar de emoji
export function getCountryDisplay(
  countryName: string
): { code: string; name: string } | null {
  const normalizedName = getNormalizedCountryName(countryName);
  const code = getCountryCode(countryName);

  if (!normalizedName || !code) return null;

  return {
    code,
    name: normalizedName,
  };
}
