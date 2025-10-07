import { Office } from "../types/settings.types";

export const mockOffices: Office[] = [
  {
    _id: "1",
    name: "Oficina Principal Madrid",
    email: "madrid@firstplug.com",
    phone: "+34 91 123 4567",
    address: "Gran Vía 123",
    apartment: "Piso 5",
    city: "Madrid",
    state: "Madrid",
    country: "ES",
    zipCode: "28001",
    additionalInfo: "Oficina principal con acceso a metro y parking disponible",
    isDefault: true,
  },
  {
    _id: "2",
    name: "Sucursal Barcelona",
    email: "barcelona@firstplug.com",
    phone: "+34 93 987 6543",
    address: "Passeig de Gràcia 456",
    apartment: "Local 2",
    city: "Barcelona",
    state: "Cataluña",
    country: "ES",
    zipCode: "08001",
    additionalInfo: "Sucursal comercial en el centro de Barcelona",
    isDefault: false,
    hasActiveProducts: true, // ← Tiene productos recoverables/envíos activos (no se puede eliminar)
  },
  {
    _id: "3",
    name: "Oficina San Salvador",
    email: "sansalvador@firstplug.com",
    phone: "+503 2234 5678",
    address: "Avenida Roosevelt 789",
    apartment: "Torre A, Oficina 301",
    city: "San Salvador",
    state: "San Salvador",
    country: "SV",
    zipCode: "01101",
    additionalInfo: "Oficina regional para Centroamérica",
    isDefault: false,
  },
  {
    _id: "4",
    name: "Oficina Nueva York",
    email: "newyork@firstplug.com",
    phone: "+1 212 555 0123",
    address: "Broadway 1234",
    apartment: "Floor 15",
    city: "New York",
    state: "NY",
    country: "US",
    zipCode: "10001",
    additionalInfo:
      "Oficina corporativa en Manhattan con vista al Times Square",
    isDefault: false,
  },
  {
    _id: "5",
    name: "Oficina Londres",
    email: "london@firstplug.com",
    phone: "", // ← Datos incompletos: falta teléfono
    address: "", // ← Datos incompletos: falta dirección
    apartment: "Suite 200",
    city: "London",
    state: "", // ← Datos incompletos: falta estado
    country: "GB",
    zipCode: "", // ← Datos incompletos: falta código postal
    additionalInfo: "Oficina europea con acceso directo al metro",
    isDefault: false,
  },
];
