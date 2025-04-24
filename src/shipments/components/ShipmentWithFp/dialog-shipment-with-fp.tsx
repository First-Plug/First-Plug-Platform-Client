import { Button } from "@/common";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AsapOrDate } from "./index";
import { AsapOrDateValue } from "./asap-or-date";
import { useMemo } from "react";
import { Label } from "@/components/ui/label"; // o cualquier componente de texto
import { AlertCircle } from "lucide-react"; // opcional, para ícono de error
import { isBefore, isValid, parseISO, isEqual } from "date-fns"; // Importa isEqual

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pickupDate: AsapOrDateValue;
  onPickupDateChange: (val: AsapOrDateValue) => void;
  deliveredDate: AsapOrDateValue;
  onDeliveredDateChange: (val: AsapOrDateValue) => void;
  onSave: () => void;
  onCancel: () => void; // Agregar un prop para manejar el cancel
}

export const DialogShipmentWithFp = ({
  isOpen,
  onOpenChange,
  pickupDate,
  onPickupDateChange,
  deliveredDate,
  onDeliveredDateChange,
  onSave,
  onCancel, // Recibir el método de cancelación
}: Props) => {
  // Manejar el cierre del diálogo cuando se hace clic fuera
  const handleClose = (open: boolean) => {
    if (!open) {
      onCancel(); // Limpiar las fechas al cerrar el diálogo
    }
    onOpenChange(open); // Cambiar el estado del diálogo
  };

  const parseToDate = (val: AsapOrDateValue): Date | null => {
    if (!val || val === "ASAP") return null;
    if (val instanceof Date && isValid(val)) return val;
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      const parsed = parseISO(val);
      return isValid(parsed) ? parsed : null;
    }
    return null;
  };

  const isInvalidDateRange = useMemo(() => {
    const pickup = parseToDate(pickupDate);
    const delivered = parseToDate(deliveredDate);

    if (pickup && delivered) {
      // Cambiar la lógica para permitir las fechas iguales
      return !isBefore(pickup, delivered) && !isEqual(pickup, delivered);
    }

    return false;
  }, [pickupDate, deliveredDate]);

  const isEmptyField = pickupDate === "" || deliveredDate === "";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Calendar className="w-5 h-5 text-gray-500" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-lg">Ship With First Plug</DialogTitle>
          <DialogDescription className="text-base">
            Select when you&apos;d like the shipment to be picked up and
            delivered.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 h-[200px]">
          <AsapOrDate
            label="Pickup Date"
            value={pickupDate}
            onChange={onPickupDateChange}
          />
          <AsapOrDate
            label="Delivery Date"
            value={deliveredDate}
            onChange={onDeliveredDateChange}
          />
        </div>
        <DialogFooter>
          <div className="flex flex-col w-full gap-4">
            {isInvalidDateRange && (
              <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>Pickup date must be before delivery date.</span>
              </div>
            )}
            <div className="flex justify-between">
              <Button
                className="px-6 rounded-md"
                variant="secondary"
                onClick={() => {
                  onCancel(); // Llamar a la función onCancel
                  onOpenChange(false); // Cerrar el diálogo
                }}
              >
                Cancel
              </Button>
              <Button
                className="px-8 rounded-md"
                disabled={isEmptyField || isInvalidDateRange}
                onClick={() => {
                  onSave();
                  onOpenChange(false); // Cerrar el diálogo
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
