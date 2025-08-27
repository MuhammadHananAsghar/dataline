import { useCallback, useEffect, useState } from "react";
import { IConnectionOptions, IEditConnection } from "@components/Library/types";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { AlertIcon, AlertModal } from "@components/Library/AlertModal";
import { enqueueSnackbar } from "notistack";
import {
  useDeleteConnection,
  useGetConnection,
  useGetConversations,
  useUpdateConnection,
  useRefreshConnectionSchema,
} from "@/hooks";
import { Button } from "../Catalyst/button";
import { Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Switch } from "@components/Catalyst/switch";
import { Textarea } from "@components/Catalyst/textarea";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
const SchemaEditor = ({
  options,
  setOptions,
}: {
  options: IConnectionOptions;
  setOptions: (newOptions: IConnectionOptions) => void;
}) => {
  const [expanded, setExpanded] = useState(
    Object.fromEntries(options.schemas.map((schema) => [schema.name, false]))
  );

  return (
    <div className="mt-2 divide-y divide-white/5 rounded-xl bg-white/5">
      {options.schemas.map((schema, schema_index) =>
        schema.tables.length === 0 ? null : (
          <div className="flex flex-col" key={schema_index}>
            <div className="flex w-full items-center p-6" key={schema_index}>
              <Switch
                color="green"
                name="select_schema"
                checked={schema.enabled}
                onChange={(checked) =>
                  // Check/Uncheck schema and its tables
                  setOptions({
                    schemas: options.schemas.map((prev_schema, prev_idx) =>
                      prev_idx === schema_index
                        ? {
                            ...prev_schema,
                            enabled: checked,
                            tables: prev_schema.tables.map((table) => ({
                              ...table,
                              enabled: checked,
                            })),
                          }
                        : prev_schema
                    ),
                  })
                }
              />
              <div
                className="group flex w-full items-center cursor-pointer"
                onClick={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [schema.name]: !prev[schema.name],
                  }))
                }
              >
                <span
                  className={classNames(
                    "ml-4 text-sm/6 font-medium group-hover:text-white/80 grow",
                    schema.enabled ? "text-white" : "text-white/50"
                  )}
                >
                  {schema.name}
                </span>
                <ChevronDownIcon
                  className={classNames(
                    "size-5 fill-white/60 group-hover:fill-white/50",
                    expanded[schema.name] ? "rotate-180" : ""
                  )}
                />
              </div>
            </div>

            <Transition show={expanded[schema.name] || false}>
              <div className="transition ease-in-out translate-x-0 data-[closed]:opacity-0 data-[closed]:-translate-y-3">
                {schema.tables.map((table, table_index) => (
                  <div className="p-6 pt-0 pl-12" key={table_index}>
                    <div
                      className="flex w-full items-center"
                      key={schema_index}
                    >
                      <Switch
                        color="green"
                        name="select_schema"
                        checked={table.enabled && schema.enabled}
                        onChange={(checked) =>
                          // Check/Uncheck table
                          setOptions({
                            schemas: options.schemas.map(
                              (prev_schema, prev_idx) =>
                                prev_idx === schema_index
                                  ? {
                                      ...prev_schema,
                                      tables: prev_schema.tables.map(
                                        (table, inner_table_idx) =>
                                          inner_table_idx === table_index
                                            ? {
                                                ...table,
                                                enabled: checked,
                                              }
                                            : table
                                      ),
                                    }
                                  : prev_schema
                            ),
                          })
                        }
                      />
                      <span
                        className={classNames(
                          "ml-4 text-sm/5",
                          schema.enabled && table.enabled
                            ? "text-white"
                            : "text-white/50"
                        )}
                      >
                        {table.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Transition>
          </div>
        )
      )}
    </div>
  );
};

const connectionRouteApi = getRouteApi("/_app/connection/$connectionId");

export const ConnectionEditor = () => {
  const navigate = useNavigate();
  const { connectionId } = connectionRouteApi.useParams();
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [showCancelAlert, setShowCancelAlert] = useState<boolean>(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);

  const { data, isLoading } = useGetConnection(connectionId);
  const { data: conversationsData } = useGetConversations();
  const relatedConversations =
    conversationsData?.filter(
      (conversation) => conversation.connection_id === connectionId
    ) ?? [];

  const connection = data;

  const { mutate: deleteConnection } = useDeleteConnection({
    onSuccess() {
      navigate({ to: "/" });
    },
  });

  const { mutate: updateConnection } = useUpdateConnection({
    onSuccess() {
      navigate({ to: "/" });
    },
  });

  const { mutate: refreshSchema, isPending: isRefreshing } =
    useRefreshConnectionSchema((data) => {
      setEditFields((prev) => ({
        ...prev,
        options: data.options,
      }));
    });

  // Form state
  const [editFields, setEditFields] = useState<IEditConnection>({
    name: "",
    dsn: "",
    system_prompt: "",
  });

  useEffect(() => {
    setEditFields((prev) => ({
      name: connection?.name || prev.name,
      dsn: connection?.dsn || prev.dsn,
      options: connection?.options || prev.options,
      system_prompt: connection?.system_prompt || prev.system_prompt,
    }));
  }, [connection]);

  if (!connectionId) {
    enqueueSnackbar({
      variant: "error",
      message: "No connection id provided - something went wrong",
    });
  }

  // Handle navigating back only if there are no unsaved changes
  const handleBack = useCallback(() => {
    if (unsavedChanges) {
      setShowCancelAlert(true);
    } else {
      navigate({ to: "/" });
    }
  }, [navigate, unsavedChanges]);

  // Handle navigating back when escape is pressed
  useEffect(() => {
    const handleKeyPress = (event: { key: string }) => {
      if (event.key === "Escape") {
        handleBack();
      }
    };

    // Add an event listener for the "Escape" key press
    document.addEventListener("keydown", handleKeyPress);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleBack, unsavedChanges]);

  function handleDelete() {
    if (!connectionId) return;
    deleteConnection(connectionId);
  }

  function handleSubmit() {
    if (!unsavedChanges) {
      navigate({ to: "/" }); // Return to previous page

      return;
    }

    if (!connectionId) return;

    // Validate system prompt
    if (!editFields.system_prompt?.trim()) {
      enqueueSnackbar({
        variant: "error",
        message: "System prompt is required. Please provide instructions for the AI to understand your database.",
      });
      return;
    }
    
    if (editFields.system_prompt.trim().length < 10) {
      enqueueSnackbar({
        variant: "error",
        message: "System prompt should have at least 10 characters. Please provide more detailed instructions.",
      });
      return;
    }

    updateConnection({
      id: connectionId,
      payload: {
        name: editFields.name,
        ...(editFields.dsn !== connection?.dsn && { dsn: editFields.dsn }), // only add dsn if it changed
        options: editFields.options,
        ...(editFields.system_prompt !== connection?.system_prompt && { system_prompt: editFields.system_prompt }),
      },
    });
  }

  return (
    <div className="dark:bg-gray-900 w-full h-full relative flex flex-col mt-16 lg:mt-0">
      <AlertModal
        isOpen={showCancelAlert}
        title="Discard Unsaved Changes?"
        message="You have unsaved changes. Discard changes?"
        okText="OK"
        // color="red"
        icon={AlertIcon.Warning}
        onSuccess={() => {
          setShowCancelAlert(false);
          history.back();
        }}
        onCancel={() => {
          setShowCancelAlert(false);
        }}
      />
      <AlertModal
        isOpen={showDeleteAlert}
        title="Delete Connection?"
        message={`This will delete ${relatedConversations.length} related conversation(s)!`}
        okText="Delete"
        icon={AlertIcon.Warning}
        onSuccess={() => {
          setShowDeleteAlert(false);
          handleDelete();
        }}
        onCancel={() => {
          setShowDeleteAlert(false);
        }}
      />
      <div className="flex flex-col lg:mt-0 p-4 lg:p-24">
        <div className="flex flex-row justify-between">
          <div className="text-gray-50 text-md md:text-2xl font-semibold">
            Edit connection
          </div>
          <div className="cursor-pointer" onClick={handleBack}>
            <XMarkIcon className="w-10 h-10 text-white [&>path]:stroke-[1]" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-white"
            >
              Name
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                disabled={false}
                value={editFields.name}
                onChange={(e) => {
                  setEditFields({ ...editFields, name: e.target.value });
                  setUnsavedChanges(true);
                }}
                className={classNames(
                  isLoading
                    ? "animate-pulse bg-gray-900 text-gray-400"
                    : "bg-white/5 text-white",
                  "block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                )}
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-white"
            >
              Database Connection String
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                disabled={false}
                value={editFields.dsn}
                onChange={(e) => {
                  setEditFields({ ...editFields, dsn: e.target.value });
                  setUnsavedChanges(true);
                }}
                className={classNames(
                  isLoading
                    ? "animate-pulse bg-gray-900 text-gray-400"
                    : "bg-white/5 text-white",
                  "block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                )}
              />
            </div>
          </div>

          <div className="sm:col-span-6 max-w-6xl">
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
                    The system prompt directly controls how the AI understands and queries your database. A well-crafted prompt significantly improves query accuracy and results. Changes will affect all future conversations.
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
            
            <label
              htmlFor="system_prompt"
              className="block text-white font-medium text-base mb-2"
            >
              System Prompt <span className="text-red-400">*</span>
            </label>
            <Textarea
              id="system_prompt"
              name="system_prompt"
              rows={6}
              value={editFields.system_prompt || ""}
              onChange={(e) => {
                setEditFields({ ...editFields, system_prompt: e.target.value });
                setUnsavedChanges(true);
              }}
              placeholder="Example: This is an e-commerce database containing customer orders, products, and inventory data. The 'orders' table links to 'customers' via customer_id and to 'products' via product_id. Revenue calculations should exclude orders with status 'cancelled' or 'returned'. Always format monetary values with 2 decimal places and dates as YYYY-MM-DD."
              className="mt-2 bg-gray-900 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500 min-h-[120px]"
            />
            <p className="mt-2 text-sm text-gray-400">
              💡 <strong>Tip:</strong> The more context you provide about your data structure and business logic, the better the AI will perform. <span className="text-yellow-400">Minimum 10 characters required.</span>
            </p>
          </div>

          <div className="sm:col-span-6">
            <div className="flex items-center mb-2 gap-x-2">
              <label
                htmlFor="schema"
                className="block text-sm font-medium leading-6 text-white"
              >
                Schema options
              </label>
              <Button
                onClick={() => refreshSchema(connectionId)}
                plain
                disabled={isRefreshing}
              >
                <ArrowPathIcon
                  className={classNames(
                    "w-6 h-6 [&>path]:stroke-[2] group-hover:-rotate-6",
                    isRefreshing ? "animate-spin" : ""
                  )}
                />
              </Button>
            </div>
            {editFields.options && (
              <SchemaEditor
                options={editFields.options}
                setOptions={(newOptions) => {
                  setEditFields((prev) => ({
                    ...prev,
                    options: newOptions,
                  }));
                  setUnsavedChanges(true);
                }}
              />
            )}
          </div>

          <div className="sm:col-span-6 flex items-center justify-end gap-x-6">
            <Button
              color="dark/zinc/red"
              // className=" hover:bg-red-700 px-3 py-2 text-sm font-medium text-red-400 hover:text-white border border-gray-600 hover:border-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-colors duration-150"
              onClick={() => {
                if (relatedConversations.length > 0) {
                  setShowDeleteAlert(true);
                } else {
                  handleDelete();
                }
              }}
            >
              Delete this connection
            </Button>
            <Button
              onClick={handleBack}
              color="dark/zinc"
              // className="rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white border border-gray-500 hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-colors duration-150"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              color="green"
              // className="rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm border bg-green-600 border-green-500 hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors duration-150"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
