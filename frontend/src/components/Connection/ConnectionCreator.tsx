import { useCreateConnection, useCreateFileConnection } from "@/hooks";
import { Button } from "@catalyst/button";
import { Field, Label } from "@catalyst/fieldset";
import { Input } from "@catalyst/input";
import { Radio, RadioField, RadioGroup } from "@catalyst/radio";
import { DatabaseFileType } from "@components/Library/types";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  CircleStackIcon,
  CloudArrowUpIcon,
  DocumentCheckIcon,
  DocumentIcon,
  DocumentTextIcon,
  TableCellsIcon
} from "@heroicons/react/24/solid";
import { useNavigate } from "@tanstack/react-router";
import { enqueueSnackbar } from "notistack";
import React, { useRef, useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const FileDragAndDrop = ({
  currentFile,
  setFile,
  fileTypeLabel,
}: {
  currentFile: File | undefined;
  setFile: (file: File | undefined) => void;
  fileTypeLabel: string;
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  };
  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }
  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }

  function handleDragEnter(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }
  return (
    <div
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      className={classNames(
        "mt-2 flex justify-center rounded-lg border border-dashed border-white/60 px-6 py-10",
        dragActive ? "bg-gray-700" : ""
      )}
    >
      <div className={classNames(currentFile ? "" : "hidden", "text-center")}>
        <div className="relative inline-block">
          <DocumentCheckIcon
            className="h-12 w-12 text-gray-300"
            aria-hidden="true"
          />
          <div
            onClick={() => setFile(undefined)}
            className="absolute -right-1 -top-1 cursor-pointer block h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-500"
          >
            <XMarkIcon
              className="h-3 w-3 text-white [&>path]:stroke-[4]"
              aria-hidden="true"
            />
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          {currentFile && currentFile.name}
        </p>
      </div>
      <div className={classNames(currentFile ? "hidden" : "", "text-center")}>
        <CloudArrowUpIcon
          onClick={handleFileClick}
          className="cursor-pointer mx-auto h-12 w-12 text-gray-300"
          aria-hidden="true"
        />
        <div className="mt-4 flex text-sm leading-6 text-gray-400 justify-center">
          <label
            htmlFor="file-upload"
            className="px-1 relative cursor-pointer rounded-md bg-gray-900 font-semibold text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-indigo-500"
          >
            <span>Upload a file</span>
            {/** Set a key so that the input is re-rendered and cleared when the file is removed */}
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              key={currentFile?.name}
            />
          </label>
          <p>or drag and drop</p>
        </div>
        <p className="text-xs leading-5 text-gray-400 px-12 mt-4">
          Creates a copy of your {fileTypeLabel} in DataLine. Changes you make
          to the file will not be accessible to DataLine as it will work on the
          copy you upload.
        </p>
      </div>
    </div>
  );
};

type RadioValue = DatabaseFileType | "database" | null;
const fileTypeLabelMap: { [K in DatabaseFileType]: string } = {
  sqlite: "SQLite data file",
  csv: "CSV file",
  sas7bdat: "sas7bdat file",
  excel: "Excel file",
};

const ConnectionCreator = ({ name = null }: { name: string | null }) => {
  const [selectedRadio, setSelectedRadio] = useState<RadioValue>(null);
  const [dsn, setDsn] = useState<string | null>(null);
  const [file, setFile] = useState<File>();
  const { mutate: createConnection, isPending } = useCreateConnection();
  const { mutate: createFileConnection, isPending: isFilePending } =
    useCreateFileConnection();

  const navigate = useNavigate();

  const handleCustomCreate = async () => {
    // Call api with name and dsn
    if (!name || !dsn) {
      enqueueSnackbar({
        variant: "info",
        message: "Please enter a name and dsn for this connection",
      });
      return;
    }
    createConnection(
      { dsn, name, isSample: false },
      {
        onSuccess: () => {
          enqueueSnackbar({
            variant: "success",
            message: "Connection created",
          });
          navigate({ to: "/" });
        },
      }
    );
  };

  const handleFileCreate = async (type: DatabaseFileType) => {
    if (!file) {
      enqueueSnackbar({
        variant: "info",
        message: "Please add a file",
      });
      return;
    }

    if (!name) {
      enqueueSnackbar({
        variant: "info",
        message: "Please add a name",
      });
      return;
    }

    // Limit file size to 500MB
    if (file.size > 1024 * 1024 * 500) {
      enqueueSnackbar({
        variant: "info",
        message: "File size exceeds 500MB limit",
      });
      return;
    }

    createFileConnection(
      { file, name, type },
      {
        onSuccess: () => {
          enqueueSnackbar({
            variant: "success",
            message: "Connection created",
          });
          navigate({ to: "/" });
        },
      }
    );
  };

  return (
    <>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">
          Create a custom connection
        </h3>
        
        <RadioGroup
          defaultValue=""
          onChange={(selection: string) =>
            setSelectedRadio(selection as RadioValue)
          }
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Database Connection Card */}
          <div className="relative">
            <label className="flex items-start gap-4 p-4 border border-gray-600 rounded-lg hover:border-blue-500 hover:bg-gray-750 transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-900 rounded-lg flex-shrink-0">
                <CircleStackIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <RadioField>
                    <Radio value="database" color="white" />
                  </RadioField>
                  <span className="text-white font-medium">Database</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Postgres, MySQL, Snowflake, or MS SQL Server
                </p>
              </div>
            </label>
          </div>

          {/* SQLite File Card */}
          <div className="relative">
            <label className="flex items-start gap-4 p-4 border border-gray-600 rounded-lg hover:border-purple-500 hover:bg-gray-750 transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-900 rounded-lg flex-shrink-0">
                <DocumentIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <RadioField>
                    <Radio value="sqlite" color="white" />
                  </RadioField>
                  <span className="text-white font-medium">SQLite</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Local SQLite database file
                </p>
              </div>
            </label>
          </div>

          {/* CSV File Card */}
          <div className="relative">
            <label className="flex items-start gap-4 p-4 border border-gray-600 rounded-lg hover:border-green-500 hover:bg-gray-750 transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 bg-green-900 rounded-lg flex-shrink-0">
                <TableCellsIcon className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <RadioField>
                    <Radio value="csv" color="white" />
                  </RadioField>
                  <span className="text-white font-medium">CSV File</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Comma-separated values file
                </p>
              </div>
            </label>
          </div>

          {/* Excel File Card */}
          <div className="relative">
            <label className="flex items-start gap-4 p-4 border border-gray-600 rounded-lg hover:border-orange-500 hover:bg-gray-750 transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-900 rounded-lg flex-shrink-0">
                <DocumentTextIcon className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <RadioField>
                    <Radio value="excel" color="white" />
                  </RadioField>
                  <span className="text-white font-medium">Excel File</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Microsoft Excel spreadsheet
                </p>
              </div>
            </label>
          </div>

          {/* SAS File Card */}
          <div className="relative md:col-span-2">
            <label className="flex items-start gap-4 p-4 border border-gray-600 rounded-lg hover:border-indigo-500 hover:bg-gray-750 transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-900 rounded-lg flex-shrink-0">
                <DocumentIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <RadioField>
                    <Radio value="sas7bdat" color="white" />
                  </RadioField>
                  <span className="text-white font-medium">SAS File</span>
                </div>
                <p className="text-gray-400 text-sm">
                  SAS7BDAT statistical data file
                </p>
              </div>
            </label>
          </div>
        </RadioGroup>
      </div>
      <div className="mt-10 max-w-2xl">
        {selectedRadio === "database" ? (
          <div>
            <Field>
              <Label>Connection DSN</Label>
              <Input
                type="text"
                placeholder="postgres://myuser:mypassword@localhost:5432/mydatabase"
                onChange={(e) => setDsn(e.target.value)}
              />
            </Field>
            <Button
              className="cursor-pointer mt-4"
              onClick={handleCustomCreate}
              disabled={isPending}
            >
              Create connection
            </Button>
          </div>
        ) : (
          selectedRadio && (
            <div>
              <Field>
                <Label>{fileTypeLabelMap[selectedRadio]}</Label>
                <FileDragAndDrop
                  setFile={setFile}
                  currentFile={file}
                  fileTypeLabel={fileTypeLabelMap[selectedRadio]}
                />
              </Field>
              <Button
                className="cursor-pointer mt-4"
                onClick={() => handleFileCreate(selectedRadio)}
                disabled={isFilePending}
              >
                Create connection
              </Button>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default ConnectionCreator;
