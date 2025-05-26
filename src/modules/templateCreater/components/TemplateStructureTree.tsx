import React, { useState, useEffect } from "react";
import { Tree } from "antd";
import { Key } from "react";
import { LuListTree } from "react-icons/lu";
import { PlusSquareOutlined } from "@ant-design/icons";

// Update the interface to be more specific
interface GroupData {
  handle: string;
  label: string;
}

interface TemplateStructureTreeProps {
  selectedGroups: GroupData[];
  label?: string;
}

export const TemplateStructureTree: React.FC<TemplateStructureTreeProps> = ({
  selectedGroups,
  label,
}) => {
  // Initialize expandedKeys with all possible keys when components change
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // Effect to automatically expand all keys when components change
  useEffect(() => {
    if (selectedGroups && selectedGroups.length > 0) {
      const allKeys = [
        "root",
        ...selectedGroups.map((c) => c.handle),
        ...selectedGroups.flatMap((group) => {
          const groupKeys = [
            `${group.handle}-label`,
          ];

          return groupKeys;
        }),
      ];

      setExpandedKeys(allKeys);
    } else {
      setExpandedKeys([]);
    }
  }, [selectedGroups]);

  // Generate tree data for template structure
  const generateTemplateStructure = () => {
    return [
      {
        key: "root",
        title: "Groups",
        children: selectedGroups.map((group) => {
          // Create children to show detailed group information
          const groupChildren: any[] = [];

          // Add label
          if (group.label) {
            groupChildren.push({
              key: `${group.handle}-label`,
              title: `Label: ${group.label}`,
            });
          }

          return {
            key: group.handle,
            title: group.label,
            children: groupChildren.length > 0 ? groupChildren : undefined,
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
      const allKeys = ["root", ...selectedGroups.map((c) => c.handle)];
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
        <span>Template Builder Structure</span>
        {selectedGroups.length > 0 && (
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

      {selectedGroups.length > 0 && (
        <Tree
          showLine
          expandedKeys={expandedKeys}
          onExpand={(keys: Key[]) => setExpandedKeys(keys.map(String))}
          treeData={generateTemplateStructure()}
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
