import * as Dialog from "@radix-ui/react-dialog";

interface GenericAlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

const GenericAlertDialog: React.FC<GenericAlertDialogProps> = ({
  open,
  onClose,
  title,
  description,
  buttonText,
  onButtonClick,
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
      <Dialog.Description className="mt-2">
        {description}
      </Dialog.Description>
      <div className="mt-4 flex justify-end">
        <Dialog.Close asChild>
          <button
            className="px-4 py-2 bg-blue text-white rounded"
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
        </Dialog.Close>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
  );
};

export default GenericAlertDialog;
