import React from "react";
import { useQuery } from "@apollo/client";
import PUBLICATION_PAGE_QUERY from "../../graphql/publicationPageQuery.ts";
import MainBlock from "../MainBlock.tsx";
import DraggablePublication from "./DraggablePublication.tsx";

const FmUpdate = () => {
  const { loading, error, data } = useQuery(PUBLICATION_PAGE_QUERY, {
    variables: { orderBy: "-vote_count" },
  });
  const publications = data?.publicationPage.publications || [];

  return (
    <MainBlock styleClass="w-full">
      <h2 className="text-md lg:text-2xl text-center font-bold text-white mt-2 mb-2 lg:mt-6 lg:mb-4">Popular publications</h2>
      <p className="text-sm lg:text-md text-white text-center mb-3 lg:mb-6">Drag any publication to the schedule</p>
      <div className="flex-1 overflow-y-auto space-y-1 lg:space-y-4 px-2 max-h-[calc(20vh)] lg:max-h-[calc(70vh)]">
        {loading && <p>Loading...</p>}
        {error && <p>Error</p>}
        {publications.map((publication) => (
          <DraggablePublication key={publication.id} publication={publication} />
        ))}
      </div>
    </MainBlock>
  );
};

export default FmUpdate;
