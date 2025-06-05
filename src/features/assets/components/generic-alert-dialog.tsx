import { Button } from "@/shared";
import * as Dialog from "@radix-ui/react-dialog";

interface GenericAlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  isHtml?: boolean;
  additionalMessage?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export const GenericAlertDialog: React.FC<GenericAlertDialogProps> = ({
  open,
  onClose,
  title,
  description,
  buttonText,
  onButtonClick,
  isHtml = false,
  additionalMessage,
  cancelButtonText = "Cancel",
  onCancel,
  showCancelButton = false,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="z-50 fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="top-1/2 left-1/2 z-50 fixed bg-white shadow-md p-6 rounded-md w-96 -translate-x-1/2 -translate-y-1/2 transform">
          <Dialog.Close asChild>
            <button
              className="top-3 right-3 absolute text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              &#x2715;
            </button>
          </Dialog.Close>

          <Dialog.Title className="font-medium text-lg">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-gray-600 text-base">
            {isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              description
            )}
          </Dialog.Description>

          {additionalMessage && (
            <p className="mt-4 text-gray-600 text-base">{additionalMessage}</p>
          )}

          <div
            className={`mt-6 flex ${
              showCancelButton ? "justify-between" : "justify-end"
            }`}
          >
            {showCancelButton && (
              <Dialog.Close asChild>
                <Button variant="secondary" className="px-7" onClick={onCancel}>
                  {cancelButtonText}
                </Button>
              </Dialog.Close>
            )}

            <Dialog.Close asChild>
              <Button variant="primary" onClick={onButtonClick}>
                {buttonText}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
