import React, { createContext, useContext, useState } from 'react';

const SharedDataContext = createContext(null);

export function SharedDataProvider({ children }) {
  const [uploadedSOPs,  setUploadedSOPs]  = useState([]);
  const [trainingItems, setTrainingItems] = useState([]);
  return (
    <SharedDataContext.Provider value={{ uploadedSOPs, setUploadedSOPs, trainingItems, setTrainingItems }}>
      {children}
    </SharedDataContext.Provider>
  );
}

export function useSharedData() {
  return useContext(SharedDataContext);
}
