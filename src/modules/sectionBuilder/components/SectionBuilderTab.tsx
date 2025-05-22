import React, { useState, useCallback, useEffect } from "react";
import { Row, Col, Input, List } from "antd";
import { PlusOutlined, EyeOutlined, ClearOutlined } from "@ant-design/icons";
import { MdDeleteOutline } from "react-icons/md";
import { parseCookies } from "nookies";

// Styles
import styles from "../styles/SectionBuilderTab.module.css";

// Hooks and Context
import { useSectionBuilderContext } from "../hooks/sectionBuilderContex";

// Components
import { DragableTable } from "./DragableTable";
import PreviewModal from "./PreviewModal";
import { SectionStructureTree } from "./SectionStructureTree";

// Types
import { ComponentIds } from "../types/SectionBuilderTypes";

// Services
import { fetchSectionBuilderData } from "@/services/sectionBuilderService";
import { SectionBuilderResponse } from "@/services/sectionBuilderService";
const preview = [
  {
    site: "1004",
    handle: "ComponentBO:1004,Product Name",
    componentLabel: "Product Name",
    dataType: "Input",
    unit: "",
    defaultValue: "NA",
    required: true,
    validation: "",
    apiUrl: null,
    minValue: null,
    maxValue: null,
    tableConfig: null,
    active: 1,
    userId: "rits_admin",
    createdDateTime: "2025-05-19T15:53:46.646",
    modifiedDateTime: null,
  },
  {
    site: "1004",
    handle: "ComponentBO:1004,Active Composition",
    componentLabel: "Active Composition",
    dataType: "Reference Table",
    unit: "",
    defaultValue: null,
    required: false,
    validation: "",
    apiUrl: null,
    minValue: null,
    maxValue: null,
    tableConfig: null,
    active: 1,
    userId: "janardhan",
    createdDateTime: "2025-05-19T15:54:56.444",
    modifiedDateTime: "2025-05-21T16:40:26.48",
  },
  {
    site: "1004",
    handle: "ComponentBO:1004,Raw Data Indent",
    componentLabel: "Raw Data Indent",
    dataType: "Table",
    unit: "",
    defaultValue: null,
    required: false,
    validation: "",
    apiUrl: null,
    minValue: null,
    maxValue: null,
    tableConfig: null,
    active: 1,
    userId: "janardhan",
    createdDateTime: "2025-05-19T16:02:02.783",
    modifiedDateTime: "2025-05-21T17:55:51.793",
  },
  {
    site: "1004",
    handle: "ComponentBO:1004,Test test1 .",
    componentLabel: "Test test1 .",
    dataType: "Integer",
    unit: "",
    defaultValue: "0",
    required: false,
    validation: "",
    apiUrl: null,
    minValue: null,
    maxValue: null,
    tableConfig: null,
    active: 1,
    userId: "janardhan",
    createdDateTime: "2025-05-21T17:35:39.531",
    modifiedDateTime: null,
  },
  {
    site: "1004",
    handle: "ComponentBO:1004,Active_Composotion",
    componentLabel: "Active Composotion",
    dataType: "Table",
    unit: "",
    defaultValue: null,
    required: false,
    validation: "",
    apiUrl: null,
    minValue: null,
    maxValue: null,
    tableConfig: {
      columns: "3",
      columnNames: [
        {
          title: "name",
          type: "Input",
          dataIndex: "name",
        },
        {
          title: "age",
          type: "Input",
          dataIndex: "age",
        },
        {
          title: "qty",
          type: "Input",
          dataIndex: "qty",
        },
      ],
      rows: "2",
      rowData: [
        {
          name: "Nandan",
        },
        {
          name: "Dhanush",
        },
      ],
    },
    active: 1,
    userId: "rits_admin",
    createdDateTime: "2025-05-21T19:06:04.223",
    modifiedDateTime: "2025-05-22T09:54:54.984",
  },
];
function SectionBuilderTab() {
  // Cookies and Context
  const cookies = parseCookies();
  const { formValues, setFormValues } = useSectionBuilderContext();

  // State: Available Components
  const [availableComponents, setAvailableComponents] = useState<
    ComponentIds[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State: Selected Components
  const [selectedComponents, setSelectedComponents] = useState<ComponentIds[]>(
    formValues.componentIds.map((component) => ({
      id: `${Date.now()}-${component.label}`,
      handle: component.handle,
      label: component.label,
      dataType: component.dataType || "Text",
    }))
  );

  // State: Preview
  const [previewComponent, setPreviewComponent] = useState<any>(null);

  // -------------------------
  // COMPONENT FETCHING
  // -------------------------
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const payload = {
          site: cookies.site,
          componentLabel: "",
        };

        const response = await fetchSectionBuilderData(
          payload,
          "componentbuilder-service",
          "getAllComponent"
        );

        // Map components with full details, handling the new response format
        const filteredComponents =
          response.map((componentItem: any) => ({
            handle: componentItem?.handle,
            label: componentItem.componentLabel,
            dataType: componentItem.dataType || "Text",
          })) || [];

        setAvailableComponents(filteredComponents);
      } catch (error) {
        console.error("Failed to fetch components:", error);
        setAvailableComponents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComponents();
  }, [cookies.site]);

  // -------------------------
  // COMPONENT FILTERING
  // -------------------------
  const filteredComponents = availableComponents.filter((component) =>
    component.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // -------------------------
  // COMPONENT MANAGEMENT
  // -------------------------
  const handleAddComponent = useCallback(
    (component: ComponentIds) => {
      // Add a new instance of the component
      const newComponent: ComponentIds = {
        id: `${Date.now()}-${component.label}`,
        handle: component.handle,
        label: component.label,
        dataType: component.dataType,
      };

      const updatedSelectedComponents = [...selectedComponents, newComponent];
      setSelectedComponents(updatedSelectedComponents);

      // Update context with component IDs
      const updatedComponentIds = [
        ...formValues.componentIds,
        {
          id: newComponent.id,
          handle: component.handle,
          label: component.label,
          dataType: component.dataType,
        },
      ];

      setFormValues({
        ...formValues,
        componentIds: updatedComponentIds,
      });
    },
    [formValues, selectedComponents, setFormValues]
  );

  const handleRemoveComponent = useCallback(
    (record: ComponentIds) => {
      // Remove from selected components
      const updatedComponents = selectedComponents.filter(
        (component) => component.id !== record.id
      );
      setSelectedComponents(updatedComponents);

      // Update context with remaining component IDs
      const updatedComponentIds = updatedComponents.map((component) => ({
        componentId: component.label,
        dataType: component.dataType || "",
        handle: component.handle,
      }));

      setFormValues({
        ...formValues,
        componentIds: updatedComponentIds.map((item) => ({
          handle: item.handle,
          label: item.componentId,
          dataType: item.dataType || "Text",
          componentId: item.componentId,
        })),
      });
    },
    [formValues, selectedComponents, setFormValues]
  );

  const handleDragEnd = (dragIndex: number, dropIndex: number) => {
    const newComponents = [...selectedComponents];
    const [removed] = newComponents.splice(dragIndex, 1);
    newComponents.splice(dropIndex, 0, removed);

    // Update selected components
    setSelectedComponents(newComponents);

    // Reorder componentIds based on the new order
    const reorderedComponentIds = newComponents.map((component) => ({
      componentId: component.label,
      dataType: component.dataType || "Text",
      handle: component.handle,
    }));

    setFormValues({
      ...formValues,
      componentIds: reorderedComponentIds.map((item) => ({
        handle: item.handle,
        label: item.componentId,
        dataType: item.dataType || "Text",
        componentId: item.componentId,
      })),
    });
  };

  // -------------------------
  // PREVIEW MANAGEMENT
  // -------------------------
  const handleOpenPreview = () => {
    setPreviewComponent(preview);
  };

  const handleClosePreview = () => {
    setPreviewComponent(null);
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <>
      <Row className={styles["section-builder-container"]}>
        {/* Left Section - Available Components */}
        <Col span={5} className={styles["left-section"]}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              paddingBottom: "10px",
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: "16px" }}>
              Components Builder ({availableComponents.length || 0})
            </div>
            <Input.Search
              placeholder="Search components..."
              style={{ marginBottom: "16px" }}
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <div style={{ flex: 1, overflowY: "auto" }}>
              {isLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  Loading components...
                </div>
              ) : (
                <List
                  dataSource={filteredComponents}
                  renderItem={(component, index) => (
                    <List.Item
                      key={index}
                      style={{
                        padding: "8px",
                        backgroundColor: "#fff",
                        marginBottom: "8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        border: "1px solid transparent",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f7ff";
                        e.currentTarget.style.borderColor = "#1890ff";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(24,144,255,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.borderColor = "transparent";
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.05)";
                      }}
                      onClick={() => handleAddComponent(component)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span style={{ fontWeight: 400 }}>
                            {component.label}
                          </span>
                          <span
                            style={{
                              fontSize: "0.8em",
                              color: "#666",
                              marginTop: "4px",
                            }}
                          >
                            {component.dataType}
                          </span>
                        </div>
                        <PlusOutlined style={{ color: "#1890ff" }} />
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          </div>
        </Col>

        {/* Main Section - Selected Components */}
        <Col span={14} className={styles["main-section"]}>
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
              <span>Section Builder</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                {selectedComponents.length > 0 && (
                  <>
                    <EyeOutlined
                      style={{
                        color: "#1890ff",
                        cursor: "pointer",
                        fontSize: "18px",
                      }}
                      onClick={() => handleOpenPreview()}
                      title="Preview Section Builder"
                    />
                    {/* <MdDeleteOutline
                      style={{
                        color: "#ff4d4f",
                        cursor: "pointer",
                        fontSize: "18px",
                      }}
                      onClick={() => setSelectedComponents([])}
                      title="Remove All Components"
                    /> */}
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "var(--button-color)",
                      cursor: "pointer",
                      fontSize: "12px",
                      gap: "4px",
                    }}
                    onClick={() => setSelectedComponents([])}
                    title="Clear All Components"
                  >
                     Clear
                    <ClearOutlined style={{ fontSize: "18px" }} />
                  </span>
                  </>
                )}
              </div>
            </div>
            <DragableTable
              dataSource={selectedComponents}
              onDragEnd={handleDragEnd}
              onRemoveComponent={handleRemoveComponent}
            />
          </div>
        </Col>

        {/* Right Section */}
        <Col
          span={5}
          className={styles["right-section"]}
          style={{ backgroundColor: "#f5f5f5" }}
        >
          <SectionStructureTree selectedComponents={selectedComponents} />
        </Col>
      </Row>

      {/* Preview Modal */}
      <PreviewModal
        previewComponents={previewComponent}
        onClose={handleClosePreview}
      />
    </>
  );
}

export default SectionBuilderTab;
