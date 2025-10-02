"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared";
import { saveAs } from "file-saver";
import Image from "next/image";
import { Button } from "@/shared";
import { DownloadIcon } from "@/shared";
import { useAsideStore } from "@/shared";

export const DownloadStock = () => {
  const { getCurrentAside } = useAsideStore();
  const currentAside = getCurrentAside();
  const type = currentAside?.type;

  const fileToDownload = type === "LoadStock" ? "stock.xlsm" : "members.xlsm";
  const downloadTemplate = async () => {
    try {
      const filePath = `/excel/${fileToDownload}`;
      const response = await fetch(filePath);
      const blob = await response.blob();
      saveAs(blob, fileToDownload);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
    }
  };
  return (
    <Dialog>
      <DialogTrigger>
        <div className="bg- p-1 px-4 rounded-md">
          <span className="font-bold text-blue">Download Template 🗃️</span>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Attention 🫸</DialogTitle>
          <DialogTitle className="text-lg">
            Before opening the Excel file, you need to enable ✅ the use of
            macros. Follow these steps:
          </DialogTitle>
          <DialogDescription className="text-md">
            <div className="flex flex-col gap-4">
              <ol className="pl-8 h-full text-lg">
                <li className="list-decimal list-item">
                  {" "}
                  Download the template ⬇.
                </li>
                <li className="list-decimal list-item">
                  Right-click on the downloaded file
                  <span className="font-medium"> ({fileToDownload} 📁)</span>
                  and select “Properties”;.
                </li>

                <li className="gap-2 list-decimal list-item">
                  At the bottom, there&apos;s a{" "}
                  <span className="font-medium">Security</span> message: you
                  need to press <span className="font-medium"> “Unblock”</span>,
                  then “Apply” and “Accept”.
                  <Popover>
                    <PopoverTrigger className="mx-2 text-blue underline">
                      (see image)
                    </PopoverTrigger>
                    <PopoverContent
                      className="bg-white"
                      side="right"
                      align="center"
                    >
                      <div className="relative flex justify-center bg-white m-auto w-[30vw] h-[500px]">
                        <Image
                          src={"/excelProperties.jpg"}
                          alt="stock firstplug"
                          fill
                          objectFit="contain"
                        />
                      </div>
                      .
                    </PopoverContent>
                  </Popover>
                </li>
                <li className="list-decimal list-item">
                  Open the Excel file and enable the use of macros.
                </li>
              </ol>
              <Button
                className="bg-blue p-1 rounded-md text-white"
                onClick={downloadTemplate}
              >
                <div className="flex items-center text-xs">
                  <DownloadIcon />
                  <p>Download Template</p>
                </div>
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
