import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from "@apollo/client";
import ME_QUERY from "../graphql/meQuery.ts";

const PrivilegesContext = createContext<any>(null);

interface PrivilegesProviderProps {
  children: ReactNode;
};

interface Privileges {
  isLoggedIn: boolean;
  isModerator: boolean;
};

export const PrivilegesProvider = ({ children }: PrivilegesProviderProps) => {
  const [privileges, setPrivileges] = useState<Privileges | null>(null);
  const { loading, error, data, refetch } = useQuery(ME_QUERY);

  React.useEffect(() => {
    if (data) { setPrivileges(data.me) }
  }, [data]);

  const refreshPrivileges = async () => {
    await refetch();
  }

  return (
    <PrivilegesContext.Provider value={{ privileges, refreshPrivileges }}>
      {children}
    </PrivilegesContext.Provider>
  );
};

export const usePrivileges = () => {
  return useContext(PrivilegesContext);
};
