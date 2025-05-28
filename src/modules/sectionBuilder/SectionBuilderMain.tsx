import React from "react";
import { SectionFormProvider } from "./context/SectionFormContext";
import SectionBuilderTab from "./components/SectionBuilderTab";

function SectionBuilderMain() {
  return (
    <SectionFormProvider>
      <SectionBuilderTab />
    </SectionFormProvider>
  );
}

export default SectionBuilderMain;
