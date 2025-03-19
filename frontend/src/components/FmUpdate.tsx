import React from "react";
import { useQuery } from "@apollo/client";
import PUBLICATIONS_QUERY from "../graphql/publicationsQuery.ts";
import DraggablePublication from "./DraggablePublication.tsx";

const FmUpdate = () => {
  const { loading, error, data } = useQuery(PUBLICATIONS_QUERY, {
    variables: { orderBy: "-vote_count" },
  });
  const publications = data?.publications || [];

  return (
    <div className="overflow-y-auto max-w-xl mx-auto p-4 bg-gray-800 shadow-lg rounded-lg h-[800px] flex flex-col">
      {publications.map((publication) => (
        <DraggablePublication key={publication.id} publication={publication} />
      ))}
    </div>
  );
};

export default FmUpdate;
