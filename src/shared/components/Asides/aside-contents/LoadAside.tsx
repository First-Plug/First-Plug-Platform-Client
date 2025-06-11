"use client";
import Image from "next/image";
import React, { ChangeEvent, useState } from "react";
import { Button, LoaderSpinner } from "@/shared";
import Papa from "papaparse";
import { PrdouctModelZod, AddStockCard } from "@/features/assets";
import {
  CsvMember,
  CsvProduct,
  EMPTY_FILE_INFO,
  csvMemberSchema,
  csvPrdocutSchema,
  csvSchema,
} from "@/shared";

import { CsvServices } from "@/services";
import { isCsvCompleted, parseProduct, parseMembers } from "@/shared";
import { useToast } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import { CreateMemberZodModel } from "@/features/members";
import { useAsideStore, useAlertStore } from "@/shared";
import { DownloadStock } from "@/features/assets";

export const LoadAside = function () {
  const [csvInfo, setCsvInfo] = useState(EMPTY_FILE_INFO);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setAside, type } = useAsideStore();
  const { setAlert } = useAlertStore();

  const queryClient = useQueryClient();

  const clearCsvData = () => {
    setCsvInfo(EMPTY_FILE_INFO);
    setCsvFile(null);
  };

  const { title, file, currentDate } = csvInfo;

  const postCsvToDatabase = async (parsedData) => {
    setIsLoading(true);
    try {
      if (type === "LoadStock") {
        const filteredData = parsedData.filter((prod) => prod["category*"]);
        const products = filteredData.map((product) => ({
          ...product,
          acquisitionDate: product.acquisitionDate
            ? new Date(product.acquisitionDate).toISOString()
            : product.acquisitionDate,
        }));

        const parsedProducts: PrdouctModelZod = products.map((product) =>
          parseProduct(product)
        );

        const { success, data, error } = csvSchema.safeParse({
          products: parsedProducts,
        });

        if (success) {
          try {
            await CsvServices.bulkCreateProducts(data.products);
            await queryClient.invalidateQueries({ queryKey: ["assets"] });
            await queryClient.invalidateQueries({ queryKey: ["members"] });
            setAside(undefined);
            setAlert("csvSuccess");
            clearCsvData();
          } catch (error) {
            toast({
              title:
                "The uploaded file is not correct. Please verify it and try again.  ",
              variant: "destructive",
              duration: 1500,
            });
          }
        } else {
          toast({
            title:
              "The uploaded file is not correct. Please verify it and try again.  ",
            variant: "destructive",
            duration: 1500,
          });
        }
      }

      if (type === "LoadMembers") {
        const members = parsedData
          .map((member) => {
            return {
              ...member,
              birthDate:
                member["Birth Date"] === "" ? null : member["Birth Date"],
            };
          })
          .filter((e) => isCsvCompleted(e));

        const parsedMembers: CreateMemberZodModel[] = members.map((member) =>
          parseMembers(member)
        );
        const { success, data, error } = csvSchema.safeParse({
          members: parsedMembers,
        });

        if (success) {
          try {
            await CsvServices.bulkCreateTeams(data.members);
            queryClient.invalidateQueries({ queryKey: ["members"] });
            queryClient.invalidateQueries({ queryKey: ["assets"] });

            clearCsvData();
            setAside(undefined);
            setAlert("csvSuccess");
          } catch (error) {
            console.error("error en la carga csv member : ", {
              error: error.response.data,
            });
            toast({
              title:
                "The uploaded file is not correct. Please verify it and try again.  ",
              variant: "destructive",
              duration: 1500,
            });
          }
        } else {
          console.error({ error });
          toast({
            title:
              "The uploaded file is not correct. Please verify it and try again.  ",
            variant: "destructive",
            duration: 1500,
          });
        }
      }
    } catch (error) {
      console.error({ error });
      return toast({
        title:
          "The uploaded file is not correct. Please verify it and try again.  ",
        variant: "destructive",
        duration: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onFileChangeHandler = (csvFile: File) => {
    Papa.parse(csvFile, {
      skipEmptyLines: true,
      header: true,
      complete: function (results) {
        // Here is the UPLOAD  🗃️⬆️  file validation:
        if (type === "LoadStock") {
          const fileData: CsvProduct[] = results.data.filter((p) =>
            isCsvCompleted(p)
          );
          const { name, size } = csvFile;
          const { success } = csvPrdocutSchema.safeParse(fileData);

          if (success) {
            setCsvFile(csvFile);
            setCsvInfo({
              title: name,
              file: `${(size / 1024).toFixed(2)}kb`,
              currentDate: new Date().toLocaleString(),
            });
          } else {
            setCsvFile(null);
            toast({
              title:
                "The uploaded file is not correct. Please verify it and try again.  ",
              variant: "destructive",
              duration: 15000,
            });
          }
        }

        if (type === "LoadMembers") {
          const fileData: CsvMember[] = results.data.filter((p) =>
            isCsvCompleted(p)
          );

          const { name, size } = csvFile;
          const { success, error } = csvMemberSchema.safeParse(fileData);

          if (success) {
            setCsvFile(csvFile);
            setCsvInfo({
              title: name,
              file: `${(size / 1024).toFixed(2)}kb`,
              currentDate: new Date().toLocaleString(),
            });
          } else {
            console.error("ERROR EN LA SUBIDAD DE CSV MEMBERS", error);
            setCsvFile(null);
            toast({
              title:
                "The uploaded file is not correct. Please verify it and try again.  ",
              variant: "destructive",
              duration: 15000,
            });
          }
        }
      },
    });
  };

  const handleAttachFileClick = () => {
    if (csvFile) {
      Papa.parse(csvFile, {
        skipEmptyLines: true,
        header: true,
        complete: function (results) {
          const { name, size } = csvFile;
          setCsvInfo({
            title: name,
            file: `${(size / 1024).toFixed(2)}kb`,
            currentDate: new Date().toLocaleString(),
          });
          postCsvToDatabase(results.data);
        },
      });
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const csvFile = event.target.files[0];
      onFileChangeHandler(csvFile);
    }
  };

  return (
    <div className="drop-area">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-center items-start gap-2 p-4 border-2 border-dashed rounded-md font-inter">
          <div className="relative h-20 aspect-square">
            <Image alt="folder icon" src="/svg/folder.svg" fill />
          </div>
          <p>Select a CSV file from your PC</p>
          <section className="flex justify-between items-center gap-2 w-full">
            <div>
              <label
                htmlFor="csvFileSelector"
                className="text-blue-500 cursor-pointer"
              >
                <h2 className="font-lg font-sans font-bold text-blue">
                  Select a File
                </h2>
              </label>
              <input
                type="file"
                id="csvFileSelector"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <DownloadStock />
          </section>
        </div>
        {csvInfo.title && (
          <AddStockCard
            title={title}
            file={file}
            currentDate={currentDate}
            onDeleteClick={clearCsvData}
            isLoading={isLoading}
          />
        )}
      </div>
      <div className="bottom-5 fixed flex w-[85%]">
        <Button
          disabled={csvFile === null}
          variant={isLoading ? "secondary" : "primary"}
          size="big"
          className="p-3 rounded-md w-full"
          onClick={() => {
            handleAttachFileClick();
          }}
        >
          {isLoading ? <LoaderSpinner /> : "Upload file"}
        </Button>
      </div>
    </div>
  );
};
