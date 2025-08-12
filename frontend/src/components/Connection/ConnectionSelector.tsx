import ConnectionImage from "./DatabaseDialectImage";
import { useState } from "react";
import { IConnection, IConversation } from "../Library/types";
import { 
  Cog6ToothIcon,
  PlusIcon,
  CircleStackIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { useCreateConversation, useGetConnections } from "@/hooks";
import { Link, useNavigate } from "@tanstack/react-router";

export const ConnectionSelector = () => {
  const navigate = useNavigate();
  const [, setConversation] = useState<IConversation | null>();
  const { data } = useGetConnections();
  const createConnection = () => {
    navigate({ to: "/connection/new" });
  };

  const { mutate } = useCreateConversation({
    onSuccess(resp) {
      setConversation({
        id: resp.data.id,
        name: "Untitled chat",
      });
      navigate({
        to: "/chat/$conversationId",
        params: { conversationId: resp.data.id },
      });
    },
  });

  function selectConnection(connection: IConnection) {
    mutate({ id: connection.id, name: "Untitled chat" });
  }

  return (
    <div className="bg-gray-900 min-h-screen w-full">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">
            Select a Connection
          </h1>
          <p className="text-gray-400 text-lg">
            Choose a database connection to start analyzing your data
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.connections?.map((connection) => (
            <div
              key={connection.id}
              className="group bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 hover:bg-gray-750 transition-all duration-200 cursor-pointer"
              onClick={() => selectConnection(connection)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <ConnectionImage
                    databaseDialect={connection.dialect}
                    name={connection.name}
                  />
                </div>
                <Link
                  to={`/connection/$connectionId`}
                  params={{ connectionId: connection.id }}
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-600 rounded-lg"
                >
                  <Cog6ToothIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                </Link>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                    {connection.dialect.charAt(0).toUpperCase() + connection.dialect.slice(1)}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg truncate">
                  {connection.name}
                </h3>
                <div className="flex items-center text-gray-400 text-sm mt-4">
                  <span>Start conversation</span>
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          ))}

          <div
            className="group bg-gray-800 border border-gray-700 border-dashed rounded-xl p-6 hover:border-green-500 hover:bg-gray-750 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
            onClick={createConnection}
          >
            <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-800 transition-colors duration-200">
              <PlusIcon className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Add Connection
            </h3>
            <p className="text-gray-400 text-sm text-center">
              Connect to a new database to start analyzing your data
            </p>
            <div className="flex items-center text-green-400 text-sm mt-4">
              <CircleStackIcon className="w-4 h-4 mr-2" />
              <span>Create new</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
