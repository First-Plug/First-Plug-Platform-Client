import { countriesByCode } from "@/shared/constants/country-codes";

/**
 * Normaliza el valor de country del backend al código ISO de 2 letras
 * Puede recibir:
 * - Código ISO de 2 letras: "PA", "UY", "AR"
 * - Nombre completo en inglés: "Panama", "Uruguay", "Argentina"
 *
 * Siempre devuelve el código ISO en mayúsculas o null si no lo encuentra
 */
export function normalizeCountryCode(
  country: string | null | undefined
): string | null {
  if (!country || country.trim() === "") {
    return null;
  }

  const trimmedCountry = country.trim();

  if (trimmedCountry.length === 2) {
    return trimmedCountry.toUpperCase();
  }

  const countryCode = Object.keys(countriesByCode).find(
    (code) =>
      countriesByCode[code].toLowerCase() === trimmedCountry.toLowerCase()
  );

  return countryCode || null;
}

/**
 * Obtiene el nombre completo del país en inglés
 * Puede recibir código ISO o nombre completo, siempre devuelve el nombre completo
 *
 * @param country - Código ISO ("PA", "UY") o nombre completo ("Panama", "Uruguay")
 * @returns Nombre completo del país en inglés o el valor original si no se encuentra
 */
export function getCountryName(country: string | null | undefined): string {
  if (!country || country.trim() === "") {
    return "";
  }

  const countryCode = normalizeCountryCode(country);

  if (countryCode && countriesByCode[countryCode]) {
    return countriesByCode[countryCode];
  }

  return country.trim();
}
