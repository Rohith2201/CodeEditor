import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AppContextType {
  user: any;
  subjects: any[];
  assignments: any[];
  setSubjects: React.Dispatch<React.SetStateAction<any[]>>;
  setAssignments: React.Dispatch<React.SetStateAction<any[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      const subjectsRes = await fetch('/api/subjects');
      const subjectsData = await subjectsRes.json();
      setSubjects(subjectsData);

      const assignmentsRes = await fetch('/api/assignments');
      const assignmentsData = await assignmentsRes.json();
      setAssignments(assignmentsData);
    };

    fetchData();
  }, []);

  return (
    <AppContext.Provider value={{ user, subjects, assignments, setSubjects, setAssignments }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

