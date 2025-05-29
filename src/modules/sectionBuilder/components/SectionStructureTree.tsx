import React, { useState, useEffect } from "react";
import { Tree } from "antd";
import { Key } from "react";
import { LuListTree } from "react-icons/lu";
import { PlusSquareOutlined } from "@ant-design/icons";
import ConfigFile from "./configFile";
import { useSectionForm } from "../context/SectionFormContext";

// Update the interface to be more specific
interface ComponentData {
  site: string;
  handle: string;
  componentLabel: string;
  dataType: string;
  unit?: string;
  defaultValue?: string | null;
  required?: boolean;
  tableConfig?: {
    columnNames?: Array<{
      title: string;
      type: string;
      dataIndex?: string | null;
      required?: boolean;
    }>;
  } | null;
}

interface SectionStructureTreeProps {
  selectedComponents: ComponentData[];
  label?: string;
  isPreview: boolean;
}

export const SectionStructureTree: React.FC<SectionStructureTreeProps> = ({
  selectedComponents,
  label,
  isPreview,
}) => {
  const { sectionFormValues } = useSectionForm();
  // Initialize expandedKeys with all possible keys when components change
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // Effect to automatically expand all keys when components change
  useEffect(() => {
    if (selectedComponents && selectedComponents.length > 0) {
      const allKeys = [
        "root",
        ...selectedComponents.map((c) => c.handle),
        ...selectedComponents.flatMap((component) => {
          const componentKeys = [
            `${component.handle}-dataType`,
            `${component.handle}-unit`,
            `${component.handle}-defaultValue`,
            `${component.handle}-required`,
          ];

          // Add table configuration keys if exists
          if (component.tableConfig?.columnNames) {
            const tableConfigKeys = [
              `${component.handle}-tableConfig`,
              ...component.tableConfig.columnNames.map(
                (_, index) => `${component.handle}-column-${index}`
              ),
            ];
            componentKeys.push(...tableConfigKeys);
          }

          return componentKeys;
        }),
      ];

      setExpandedKeys(allKeys);
    } else {
      setExpandedKeys([]);
    }
  }, [selectedComponents]);

  // Generate tree data for section structure
  const generateSectionStructure = () => {
    return [
      {
        key: "root",
        title: "Components",
        children: selectedComponents.map((component) => {
          // Create children to show minimal component information
          const componentChildren: any[] = [];

          // Add simplified table configuration if exists
          if (component.tableConfig?.columnNames) {
            const tableConfigChild = {
              key: `${component.handle}-tableConfig`,
              title: "Table",
              children: component.tableConfig.columnNames.map(
                (column, index) => ({
                  key: `${component.handle}-column-${index}`,
                  title: column.title,
                })
              ),
            };
            componentChildren.push(tableConfigChild);
          }

          // Construct data type string with unit if exists
          const dataTypeDisplay = component.unit
            ? `${component.dataType} - ${component.unit}`
            : component.dataType;

          return {
            key: component.handle,
            title: (
              <>
                {component.componentLabel}
                <span
                  style={{
                    color: "rgb(136, 136, 136)",
                    marginLeft: "8px",
                    fontSize: "12px",
                  }}
                >
                  ({dataTypeDisplay})
                </span>
              </>
            ),
            children:
              componentChildren.length > 0 ? componentChildren : undefined,
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
      const allKeys = ["root", ...selectedComponents.map((c) => c.handle)];
      setExpandedKeys(allKeys);
    }
  };

  // Preview mode rendering
  if (isPreview) {
    return <ConfigFile />;
  }

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
            maxHeight: "calc(100vh - 150px)",
            overflowY: "auto",
          }}
          switcherIcon={<PlusSquareOutlined />}
        />
      )}
    </div>
  );
};
