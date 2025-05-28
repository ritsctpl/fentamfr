import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the type for section form values
export interface SectionFormValues {
  sectionLabel: string;
  instructions: string;
  effectiveDateTime: string;
  structureType: "structured" | "unstructured";
  componentIds: {
    handle: string;
    label: string;
    dataType: string;
    componentId: string;
  }[];
  style: {
    marginsEnabled: boolean;
    textAlignment: string;
    tableAlignment: string;
    splitColumns: number;
    showHeading: boolean
  };
}

// Define the context type
interface SectionFormContextType {
  sectionFormValues: SectionFormValues;
  setSectionFormValues: React.Dispatch<React.SetStateAction<SectionFormValues>>;
  resetSectionFormValues: () => void;
}

// Create the context with a default value
const SectionFormContext = createContext<SectionFormContextType | undefined>(
  undefined
);

// Create a provider component
export const SectionFormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Default initial values
  const [sectionFormValues, setSectionFormValues] = useState<SectionFormValues>(
    {
      sectionLabel: "",
      instructions: "",
      effectiveDateTime: "",
      structureType: "structured",
      componentIds: [],
      style: {
        marginsEnabled: false,
        textAlignment: "left",
        tableAlignment: "left",
        splitColumns: 1,
        showHeading: true
      },
    }
  );

  // Function to reset form values to initial state
  const resetSectionFormValues = () => {
    setSectionFormValues({
      sectionLabel: "",
      instructions: "",
      effectiveDateTime: "",
      structureType: "structured",
      componentIds: [],
      style: {
        marginsEnabled: false,
        textAlignment: "left",
        tableAlignment: "left",
        splitColumns: 1,
        showHeading: true
      },
    });
  };

  return (
    <SectionFormContext.Provider
      value={{
        sectionFormValues,
        setSectionFormValues,
        resetSectionFormValues,
      }}
    >
      {children}
    </SectionFormContext.Provider>
  );
};

// Custom hook to use the section form context
export const useSectionForm = () => {
  const context = useContext(SectionFormContext);
  if (context === undefined) {
    throw new Error("useSectionForm must be used within a SectionFormProvider");
  }
  return context;
};
