import React from "react";
import { SectionStructureTree } from "./SectionStructureTree";
import styles from "../styles/SectionBuilderTab.module.css";

interface SectionBuilderRightPanelProps {
  selectedSection: any;
  isCreateMode: boolean;
  previewComponent: any[];
  isPreview?: boolean;
}

export const SectionBuilderRightPanel: React.FC<
  SectionBuilderRightPanelProps
> = ({
  selectedSection,
  isCreateMode,
  previewComponent,
  isPreview = false,
}) => {
  return (
    <div
      className={styles["right-section"]}
      style={{
        height: "calc(100vh - 90px)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: "#f5f5f5",
      }}
    >
      {!selectedSection && !isCreateMode ? (
        <span
          style={{
            color: "#999",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
            padding: "20px",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          Select a section or create a new one to view structure
        </span>
      ) : (
        <SectionStructureTree
          label={""}
          selectedComponents={previewComponent}
          isPreview={isPreview}
        />
      )}
    </div>
  );
};
