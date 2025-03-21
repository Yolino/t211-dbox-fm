import React from "react";
import { useQuery } from "@apollo/client";
import PUBLICATIONS_QUERY from "../../graphql/publicationsQuery.ts";
import MainBlock from "../MainBlock.tsx";
import DraggablePublication from "./DraggablePublication.tsx";

const FmUpdate = () => {
  const { loading, error, data } = useQuery(PUBLICATIONS_QUERY, {
    variables: { orderBy: "-vote_count" },
  });
  const publications = data?.publications || [];

  return (
    <MainBlock style="w-1/4">
      <h2 className="text-2xl text-center font-bold text-white mt-6 mb-4">Popular publications</h2>
      <p className="text-white text-center mb-6">Drag any publication to the schedule</p>
      <div className="flex-1 overflow-y-auto space-y-4 px-2 max-h-[700px]">
        {publications.map((publication) => (
          <DraggablePublication key={publication.id} publication={publication} />
        ))}
      </div>
    </MainBlock>
  );
};

export default FmUpdate;
