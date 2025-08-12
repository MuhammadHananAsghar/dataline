import { useState } from "react";
import { Radio, RadioField, RadioGroup } from "@catalyst/radio";
import { SampleSelector } from "./SampleSelector";
import ConnectionCreator from "./ConnectionCreator";
import { 
  CircleStackIcon,
  BeakerIcon,
  ServerIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";

// Global variable to control sample dataset option visibility
const SHOW_SAMPLE_DATASETS = false;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const NewConnection = () => {
  // Flow in this component:
  // A. Enter name of connection
  // B. Select radio deciding if SAMPLE or CUSTOM connection
  // C. If SAMPLE, show SampleSelector component
  // D. If CUSTOM, show ConnectionCreator component
  const [connectionName, setConnectionName] = useState("");
  const [isLoading] = useState(false);

  type RadioValue = "sample" | "custom" | null;
  const [selectedRadio, setSelectedRadio] = useState<RadioValue>(null);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setConnectionName(value);
  };

  return (
    <div className="bg-gray-900 min-h-screen w-full">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/connections"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to connections</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center">
              <CircleStackIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                New Connection
              </h1>
              <p className="text-gray-400 text-lg">
                Connect to your database or choose a sample dataset
              </p>
            </div>
          </div>
        </div>

        {/* Connection Form */}
        <div className="space-y-8">
          {/* Connection Name Input */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-white mb-3"
            >
              Connection Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              disabled={isLoading}
              autoComplete="off"
              value={connectionName}
              onChange={handleNameChange}
              placeholder="e.g., Production Database, Analytics DB"
              className={classNames(
                isLoading
                  ? "animate-pulse bg-gray-700 text-gray-400"
                  : "bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500",
                "block w-full rounded-lg border px-4 py-3 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              )}
            />
            <p className="text-gray-400 text-xs mt-2">
              Choose a descriptive name for your connection
            </p>
          </div>

          {/* Data Source Type Selection */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ServerIcon className="w-5 h-5 text-gray-400" />
              Data Source Type
            </h3>

            <RadioGroup
              defaultValue=""
              onChange={(event) => setSelectedRadio(event as RadioValue)}
              className="space-y-4"
            >
              {SHOW_SAMPLE_DATASETS && (
                <div className="relative">
                  <label className="flex items-start gap-4 p-4 border border-gray-600 rounded-lg hover:border-green-500 hover:bg-gray-750 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-900 rounded-lg flex-shrink-0">
                      <BeakerIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <RadioField>
                          <Radio value="sample" color="white" />
                        </RadioField>
                        <span className="text-white font-medium">Sample Dataset</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Get started quickly with pre-loaded sample data including Netflix, Spotify, and more
                      </p>
                    </div>
                  </label>
                </div>
              )}
              
              <div className="relative">
                <label className="flex items-start gap-4 p-4 border border-gray-600 rounded-lg hover:border-blue-500 hover:bg-gray-750 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-900 rounded-lg flex-shrink-0">
                    <CircleStackIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <RadioField>
                        <Radio value="custom" color="white" />
                      </RadioField>
                      <span className="text-white font-medium">Custom Connection</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Connect to your own PostgreSQL, MySQL, SQLite, or other databases
                    </p>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Dynamic Content Based on Selection */}
          {selectedRadio && (
            <div className="transition-all duration-300 ease-in-out">
              {selectedRadio === "sample" && SHOW_SAMPLE_DATASETS && (
                <SampleSelector name={connectionName} />
              )}
              {selectedRadio === "custom" && (
                <ConnectionCreator name={connectionName} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
