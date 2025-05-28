import React, { useMemo } from "react";
import { List, Form, Input, Spin } from "antd";
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { CiBoxList } from "react-icons/ci";
import { LuComponent } from "react-icons/lu";

import styles from "../styles/SectionBuilderTab.module.css";

interface SectionBuilderLeftPanelProps {
  isLoading: boolean;
  loadingMessage: string;
  selectedSection: any;
  sectionData: any[];
  componentsData: any[];
  searchTerm: string;
  structureType: "structured" | "unstructured";
  onBackToSections: () => void;
  onAddSection: () => void;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onItemClick: (item: any) => void;
}

export const SectionBuilderLeftPanel: React.FC<
  SectionBuilderLeftPanelProps
> = ({
  isLoading,
  loadingMessage,
  selectedSection,
  sectionData,
  componentsData,
  searchTerm,
  structureType,
  onBackToSections,
  onAddSection,
  onSearchChange,
  onSearch,
  onItemClick,
}) => {
  const filteredComponentsData = useMemo(() => {
    if (!selectedSection) return componentsData;

    return componentsData.filter(
      (component) =>
        structureType === "unstructured" || component.dataType !== "Table"
    );
  }, [componentsData, structureType, selectedSection]);

  const renderListItem = (item: any, index: number) => {
    const itemName = selectedSection ? item.componentLabel : item.sectionLabel;
    const secondaryText = selectedSection ? item.dataType : "";

    return (
      <List.Item
        key={index}
        style={{
          padding: "8px 12px",
          backgroundColor: "#fff",
          border: "1px solid rgba(0, 0, 0, 0.16)",
          marginBottom: "8px",
          borderRadius: "4px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          // border: "1px solid transparent",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f0f7ff";
          e.currentTarget.style.borderColor = "1px solid rgba(0, 0, 0, 0.16)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(24,144,255,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#fff";
          e.currentTarget.style.borderColor = "1px solid rgba(0, 0, 0, 0.16)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
        }}
        onClick={() => onItemClick(item)}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* <span
              style={{
                fontSize: itemName.length > 30 ? "0.7em" : "0.9em",
                fontWeight: 400,
              }}
            >
              {itemName}
            </span> */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {selectedSection ? (
                <LuComponent style={{ fontSize: "16px", color: "#666" }} />
              ) : (
                <CiBoxList style={{ fontSize: "16px", color: "#666" }} />
              )}
              <div
                style={{
                  fontWeight: "400",
                  fontSize: itemName.length > 30 ? "0.7em" : "0.8em",
                }}
              >
                {itemName}
              </div>
            </div>
            {secondaryText && (
              <span
                style={{
                  fontSize: "0.8em",
                  color: "#666",
                  marginTop: "4px",
                  fontWeight: "bolder",
                }}
              >
                {secondaryText}
              </span>
            )}
          </div>
        </div>
      </List.Item>
    );
  };

  return (
    <div
      className={styles["left-section"]}
      style={{
        height: "calc(100vh - 90px)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Left Section Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 100,
          }}
        >
          <Spin
            size="small"
            tip={loadingMessage}
            style={{
              fontSize: "14px",
              color: "#1890ff",
            }}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          paddingBottom: "10px",
        }}
      >
        <div
          style={{
            fontWeight: 500,
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {selectedSection && (
              <ArrowLeftOutlined
                onClick={onBackToSections}
                style={{
                  marginRight: "8px",
                  cursor: "pointer",
                  color: "#000",
                  fontSize: "14px",
                }}
              />
            )}
            {selectedSection
              ? `List of Components (${filteredComponentsData?.length})`
              : `List of Sections (${sectionData?.length})`}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              height: "100%",
            }}
          >
            {!selectedSection && (
              <PlusOutlined
                style={{
                  color: "#1890ff",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onClick={onAddSection}
                title="Add New Section"
              />
            )}
          </div>
        </div>

        {/* Search Input */}
        <Form
          layout="inline"
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Form.Item
            name="sectionSearch"
            style={{
              flex: 1,
              marginRight: "8px",
              marginBottom: 0,
            }}
          >
            <Input.Search
              placeholder="Search components..."
              onChange={(e) => onSearchChange(e.target.value)}
              onSearch={onSearch}
              value={searchTerm}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>

        {/* List Container with Scrolling */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "calc(100vh - 200px)",
            paddingRight: "8px",
          }}
        >
          <List
            dataSource={selectedSection ? filteredComponentsData : sectionData}
            renderItem={renderListItem}
            style={{
              height: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};
