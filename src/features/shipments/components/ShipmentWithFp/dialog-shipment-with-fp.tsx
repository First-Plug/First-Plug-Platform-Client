import { Button } from "@/common";
import { Calendar, InfoIcon } from "lucide-react";
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
import { isBefore, isValid, parseISO, isEqual, format } from "date-fns"; // Importa isEqual
import { checkMemberJoinDate } from "@/features/shipments";
import { Member } from "@/features/members";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pickupDate: AsapOrDateValue;
  onPickupDateChange: (val: AsapOrDateValue) => void;
  deliveredDate: AsapOrDateValue;
  onDeliveredDateChange: (val: AsapOrDateValue) => void;
  onSave: () => void;
  onCancel: () => void; // Agregar un prop para manejar el cancel
  destinationMember: Member | null;
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
  destinationMember,
}: Props) => {
  console.log("Dialog opened with destination member:", destinationMember);
  const { shouldShowWarning, joinDate } = useMemo(
    () => checkMemberJoinDate(destinationMember),
    [destinationMember]
  );
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

  console.log("Dialog opened with destination member:", destinationMember);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Calendar className="w-5 h-5 text-gray-500" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-lg">Ship With First Plug</DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed">
            Warning:
            <br />
            <strong>Dates Are Preferred, Not Guaranteed</strong>
            <br />
            The selected pickup and delivery dates are your preferred choices.
            We’ll do our best to meet them, but exact scheduling may vary due to
            logistics constraints.
          </DialogDescription>
        </DialogHeader>
        <div className="gap-2 grid min-h-[200px]">
          {shouldShowWarning && joinDate && (
            <div className="flex items-center bg-amber-50 px-4 py-2 border border-amber-200 rounded-xl text-[15px] text-amber-700">
              <span>
                {destinationMember?.firstName +
                  " " +
                  destinationMember?.lastName}{" "}
                will join on {format(joinDate, "MMM dd, yyyy")}. We recommend
                setting the delivery date on or before the joining date so the
                member receives the products before their first day.
              </span>
            </div>
          )}
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
          <div className="flex flex-col gap-4 w-full">
            {isInvalidDateRange && (
              <div className="flex items-center gap-2 bg-red-50 p-3 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle className="mt-0.5 w-4 h-4" />
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
