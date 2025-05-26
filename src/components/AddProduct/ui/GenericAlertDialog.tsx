import { Button } from "@/common";
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

const GenericAlertDialog: React.FC<GenericAlertDialogProps> = ({
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
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed bg-white p-6 rounded-md shadow-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96">
          <Dialog.Close asChild>
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              &#x2715;
            </button>
          </Dialog.Close>

          <Dialog.Title className="text-lg font-medium">{title}</Dialog.Title>
          <Dialog.Description className="text-base mt-2 text-gray-600">
            {isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              description
            )}
          </Dialog.Description>

          {additionalMessage && (
            <p className="mt-4 text-base text-gray-600">{additionalMessage}</p>
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

export default GenericAlertDialog;
