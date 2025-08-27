import { useCreateConnection, useCreateFileConnection } from "@/hooks";
import { Button } from "@catalyst/button";
import { Field, Label } from "@catalyst/fieldset";
import { Input } from "@catalyst/input";
import { Textarea } from "@catalyst/textarea";
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
  const [systemPrompt, setSystemPrompt] = useState<string>("");
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
    
    if (!systemPrompt.trim()) {
      enqueueSnackbar({
        variant: "error",
        message: "System prompt is required. Please provide instructions for the AI to understand your database.",
      });
      return;
    }
    
    if (systemPrompt.trim().length < 10) {
      enqueueSnackbar({
        variant: "error",
        message: "System prompt should have at least 10 characters. Please provide more detailed instructions.",
      });
      return;
    }
    createConnection(
      { dsn, name, isSample: false, systemPrompt },
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
    
    if (!systemPrompt.trim()) {
      enqueueSnackbar({
        variant: "error",
        message: "System prompt is required. Please provide instructions for the AI to understand your data.",
      });
      return;
    }
    
    if (systemPrompt.trim().length < 10) {
      enqueueSnackbar({
        variant: "error",
        message: "System prompt should have at least 10 characters. Please provide more detailed instructions.",
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
      { file, name, type, systemPrompt },
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
      
      {/* System Prompt Field - shown for all connection types */}
      {selectedRadio && (
        <div className="mt-8 max-w-4xl">
          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-yellow-400 font-semibold text-sm mb-2">
                  ⚠️ System Prompt is Critical for AI Performance
                </h4>
                <p className="text-yellow-100 text-sm leading-relaxed mb-3">
                  The system prompt directly controls how the AI understands and queries your database. A well-crafted prompt significantly improves query accuracy and results.
                </p>
                <div className="bg-black/20 rounded p-3 border border-yellow-600/20">
                  <p className="text-yellow-100 text-xs font-medium mb-2">📝 Guidelines for effective system prompts:</p>
                  <ul className="text-yellow-100 text-xs space-y-1">
                    <li>• <strong>Describe your data:</strong> "This is a sales database with customer orders, products, and inventory"</li>
                    <li>• <strong>Specify important relationships:</strong> "Orders are linked to customers via customer_id"</li>
                    <li>• <strong>Mention key business rules:</strong> "Revenue should exclude returned items"</li>
                    <li>• <strong>Define terminology:</strong> "Active customers are those with orders in the last 90 days"</li>
                    <li>• <strong>Set expectations:</strong> "Always format dates as YYYY-MM-DD and round currency to 2 decimals"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <Field>
            <Label className="text-white font-medium text-base">
              System Prompt <span className="text-red-400">*</span>
            </Label>
            <Textarea
              rows={6}
              placeholder="Example: This is an e-commerce database containing customer orders, products, and inventory data. The 'orders' table links to 'customers' via customer_id and to 'products' via product_id. Revenue calculations should exclude orders with status 'cancelled' or 'returned'. Always format monetary values with 2 decimal places and dates as YYYY-MM-DD."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="mt-2 bg-gray-900 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500 min-h-[120px]"
              required
            />
            <p className="mt-2 text-sm text-gray-400">
              💡 <strong>Tip:</strong> The more context you provide about your data structure and business logic, the better the AI will perform. <span className="text-yellow-400">Minimum 10 characters required.</span>
            </p>
          </Field>
        </div>
      )}
      
      <div className="mt-6 max-w-2xl">
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
