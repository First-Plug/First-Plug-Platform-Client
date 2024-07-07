"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { saveAs } from "file-saver";
import Image from "next/image";
import { Button } from "../ui/button";
import { DownloadIcon } from "@/common";
import { useStore } from "@/models";
export function DownloadStock() {
  const {
    aside: { type },
  } = useStore();

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
        <div className="bg- p-1 rounded-md px-4">
          <span className="font-bold text-blue">Download Template 🗃️</span>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl   ">Attention 🫸</DialogTitle>
          <DialogTitle className="text-lg">
            Before opening the Excel file, you need to enable ✅ the use of
            macros. Follow these steps:
          </DialogTitle>
          <DialogDescription className="text-md   ">
            <div className="flex flex-col gap-4">
              <ol className="pl-8 h-full text-lg">
                <li className="list-item list-decimal">
                  {" "}
                  Download the template ⬇.
                </li>
                <li className="list-item list-decimal">
                  Right-click on the downloaded file
                  <span className="font-medium"> ({fileToDownload} 📁)</span>
                  and select “Properties”;.
                </li>

                <li className="list-item list-decimal gap-2 ">
                  At the bottom, there&apos;s a{" "}
                  <span className="font-medium">Security</span> message: you
                  need to press <span className="font-medium"> “Unblock”</span>,
                  then “Apply” and “Accept”.
                  <Popover>
                    <PopoverTrigger className="text-blue underline mx-2">
                      (see image)
                    </PopoverTrigger>
                    <PopoverContent
                      className="bg-white"
                      side="right"
                      align="center"
                    >
                      <div className="relative h-[500px] w-[30vw] bg-white   flex justify-center m-auto ">
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
                <li className="list-item list-decimal">
                  Open the Excel file and enable the use of macros.
                </li>
              </ol>
              <Button
                className="rounded-md p-1 bg-blue text-white "
                onClick={downloadTemplate}
              >
                <div className="text-xs flex items-center">
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
}
