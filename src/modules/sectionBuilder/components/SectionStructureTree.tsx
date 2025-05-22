import React, { useState } from "react";
import { Tree } from "antd";
import { Key } from "react";
import { LuListTree } from "react-icons/lu";
import { PlusSquareOutlined } from "@ant-design/icons";
import { ComponentIds } from "../types/SectionBuilderTypes";
import { useSectionBuilderContext } from "../hooks/sectionBuilderContex";

interface SectionStructureTreeProps {
  selectedComponents: ComponentIds[];
}

export const SectionStructureTree: React.FC<SectionStructureTreeProps> = ({
  selectedComponents,
}) => {
  const { formValues } = useSectionBuilderContext();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([
    formValues?.sectionLabel || "N/A",
  ]);

  // Generate tree data for section structure
  const generateSectionStructure = () => {
    return [
      {
        key: formValues?.sectionLabel || "N/A",
        title: formValues?.sectionLabel || "N/A",
        children: selectedComponents.map((component, index) => {
          // Find the corresponding component from formValues to get its dataType
          const componentDetails = formValues.componentIds.find(
            (c) => c.label === component.label
          );

          return {
            key: `${component.label}-${component.id}`, // Use unique ID to differentiate duplicates
            title: component.label,
            children: [
              {
                key: `${component.label}-${component.id}-type`,
                title: `Type: ${componentDetails?.dataType || "Unknown"}`,
              },
            ],
          };
        }),
      },
    ];
  };

  // Expand all tree nodes
  const handleExpandAll = () => {
    if (expandedKeys.length > 0) {
      setExpandedKeys([]);
    } else {
      const allKeys = [
        formValues?.sectionLabel || "N/A",
        ...selectedComponents.map((c) => c.label),
      ];
      setExpandedKeys(allKeys);
    }
  };

  return (
    <div>
      <div
        style={{
          fontWeight: 500,
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Section Builder Structure</span>
        {selectedComponents.length > 0 && (
          <LuListTree
            onClick={handleExpandAll}
            style={{
              cursor: "pointer",
              color: "var(--button-color)",
              fontSize: "16px",
            }}
            title={expandedKeys.length > 0 ? "Collapse All" : "Expand All"}
          />
        )}
      </div>

      {selectedComponents.length > 0 && (
        <Tree
          showLine
          expandedKeys={expandedKeys}
          onExpand={(keys: Key[]) => setExpandedKeys(keys.map(String))}
          treeData={generateSectionStructure()}
          style={{
            padding: "12px",
            // borderRadius: "4px",
            // border: "1px solid #e8e8e8",
            maxHeight: "calc(100vh - 250px)",
            overflowY: "auto",
            // backgroundColor: "#f5f5f5"
          }}
          switcherIcon={<PlusSquareOutlined />}
        />
      )}
    </div>
  );
};
