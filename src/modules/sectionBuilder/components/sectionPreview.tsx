import React from "react";
import FormPreview from "./previewComponents/formPreview";
import { useSectionForm } from "../context/SectionFormContext";
import TablePreview from "./previewComponents/tablePreview";

interface SectionPreviewProps {
  previewComponent?: any[];
}

function SectionPreview({ previewComponent = [] }: SectionPreviewProps) {
  const { sectionFormValues } = useSectionForm();

  return (
    <div
      style={{
        width: `calc(100vw * 0.40)`,
        height: `calc(100vh * 0.85)`,
        margin: "0 auto",
        padding: "5mm",
        boxSizing: "border-box",
        backgroundColor: "white",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      {sectionFormValues?.structureType === "structured" ? (
        <FormPreview
          component={previewComponent}
          styleData={sectionFormValues.style}
          title={sectionFormValues.sectionLabel}
          instruction={sectionFormValues.instructions}
        />
      ) : (
        <TablePreview
          component={previewComponent}
          title={sectionFormValues.sectionLabel}
          instruction={sectionFormValues.instructions}
        />
      )}
    </div>
  );
}

export default SectionPreview;
