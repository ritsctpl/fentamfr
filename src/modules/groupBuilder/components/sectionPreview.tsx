import React, { useEffect, useState } from "react";
import { getGroupPreview } from "@services/groupBuilderService";
import TablePreview from "./previewComponents/tablePreview";
import FormPreview from "./previewComponents/formPreview";

interface PreviewSection {
  _id: string;
  sectionLabel: string;
  instructions: string;
  structureType: string;
  style: {
    marginsEnabled: boolean;
    textAlignment: string;
    tableAlignment: string;
    splitColumns: number;
  };
  components: Array<{
    _id: string;
    componentLabel: string;
    dataType: string;
    unit?: string;
    defaultValue?: string;
    required: boolean;
  }>;
}

function SectionPreview({ sections }: { sections: any[] }) {
  const [previewData, setPreviewData] = useState<PreviewSection[]>([]);

  useEffect(() => {
    const fetchPreviewData = async () => {
      const response = await getGroupPreview({
        siteId: '1004',
        sectionsIds: sections.map(section => ({
          handle: section.handle,
          sectionLabel: section.sectionLabel,
        })),
      });
      setPreviewData(response);
    };
    fetchPreviewData();
  }, [sections]);

  return (
    <div
      style={{
        width: `calc(100vw * 0.40)`,
        margin: "0 auto",
        padding: "5mm",
        boxSizing: "border-box",
        backgroundColor: "white",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "2rem",
        overflowY: "auto"
      }}
    >
      {previewData.map((section) => (
        <div key={section._id} style={{ width: "100%" }}>
          {section.structureType === "structured" ? (
            <FormPreview
              component={section.components}
              styleData={section.style}
              title={section.sectionLabel}
              instruction={section.instructions}
            />
          ) : (
            <TablePreview
              component={section.components}
              title={section.sectionLabel}
              instruction={section.instructions}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default SectionPreview;
