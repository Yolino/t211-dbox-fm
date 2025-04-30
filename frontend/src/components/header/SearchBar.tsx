import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import LOOKUP_QUERY from "../../graphql/lookupQuery.ts";

const SearchBar = () => {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const [fetchLookup, { data }] = useLazyQuery(LOOKUP_QUERY);

  const handleChangeSearchValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timeoutId = setTimeout(() => {
      fetchLookup({
        variables: { text: event.target.value },
      });
    }, 2000);
    setDebounceTimeout(timeoutId);
  };

  const submitLookup = (event: React.FormEvent) => {
    event.preventDefault();
    fetchLookup({
      variables: { text: searchValue },
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      fetchLookup({
        variables: { text: searchValue },
      });
    }
  };

  return (
    <div
      onFocus={() => setIsFocused(true)}
      onBlur={() => setTimeout(() => setIsFocused(false), 150)}
      className="relative w-1/2 rounded-lg bg-white text-gray-800"
    >
      <form onSubmit={submitLookup} className="flex">
        <input
          type="text"
          placeholder="Search"
          onChange={handleChangeSearchValue}
          onKeyDown={handleKeyDown}
          className="p-3 w-full rounded-lg"
          value={searchValue}
        />
        <input
          type="submit"
          value="Submit"
          className="m-2 p-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
      {isFocused && (
        <div className="absolute top-full mt-2 w-full bg-gray-100 shadow-lg rounded-lg z-10 max-h-60 overflow-y-auto divide-y divide-gray-800 divide-solid">
          {data?.publicationLookup.map((p, i) => (
            <div
              key={i}
              onClick={() => { navigate(`/profile/${p.author.username}`, { state: { expanded: p.id } }) }}
              className="flex justify-between py-2 px-4 hover:bg-gray-200"
            >
              <span>{p.author.username} - {p.title}</span>
              <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">Publication</span>
            </div>
          ))}
          {data?.userLookup.map((u, i) => (
            <div
              key={i}
              onClick={() => { navigate(`/profile/${u.username}`) }}
              className="flex justify-between py-2 px-4 hover:bg-gray-200"
            >
              <span>{u.username}</span>
              <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">User</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

