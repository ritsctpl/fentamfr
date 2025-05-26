import { defaulSectionBuilderform, SectionBuilderDataItem } from "@modules/sectionBuilder/types/SectionBuilderTypes";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SectionBuilderTypes {
  formValues: SectionBuilderDataItem;
  setFormValues: React.Dispatch<React.SetStateAction<SectionBuilderDataItem>>;
}

// Create the context
const SectionBuilderContext = createContext<SectionBuilderTypes>({
  formValues: defaulSectionBuilderform,
  setFormValues: () => {},
});

// Create the provider
export const SectionBuilderProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [formValues, setFormValues] = useState<SectionBuilderDataItem>(
    defaulSectionBuilderform
  );
  return (
    <SectionBuilderContext.Provider
      value={{
        formValues,
        setFormValues,
      }}
    >
      {children}
    </SectionBuilderContext.Provider>
  );
};

// Custom hook to use the context
export const useSectionBuilderContext = () => {
  return useContext(SectionBuilderContext);
};
