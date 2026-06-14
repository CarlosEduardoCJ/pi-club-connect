import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const STORAGE_KEY = 'dev:school-view';

interface SchoolViewContextType {
  selectedSchool: string | null;
  setSelectedSchool: (s: string | null) => void;
}

const SchoolViewContext = createContext<SchoolViewContextType>({
  selectedSchool: null,
  setSelectedSchool: () => {},
});

export const useSchoolView = () => useContext(SchoolViewContext);

export const SchoolViewProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSchool, setSelectedSchoolState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  const setSelectedSchool = (s: string | null) => {
    setSelectedSchoolState(s);
    if (s) localStorage.setItem(STORAGE_KEY, s);
    else localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    // no-op; just ensures hydration is consistent
  }, []);

  return (
    <SchoolViewContext.Provider value={{ selectedSchool, setSelectedSchool }}>
      {children}
    </SchoolViewContext.Provider>
  );
};
