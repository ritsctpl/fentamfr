import React, { useState, useCallback, useEffect } from "react";
import { Row, Col, List, Button, Form, Modal, message } from "antd";
import { parseCookies } from "nookies";
import moment from "moment";
// Styles
import styles from "../styles/SectionBuilderTab.module.css";
// Components
import { SectionBuilderHeader } from "./SectionBuilderHeader";
import { CopySectionModal } from "./CopySectionModal";
import { SectionBuilderLeftPanel } from "./SectionBuilderLeftPanel";
import { SectionBuilderMainPanel } from "./SectionBuilderMainPanel";
import { SectionBuilderRightPanel } from "./SectionBuilderRightPanel";
// Types
import {
  ComponentDataType,
  SectionDataType,
  SectionType,
  ComponentId,
  SectionBuilderResponse,
} from "../types/SectionBuilderTypes";

// Services
import { fetchSectionBuilderData } from "@/services/sectionBuilderService";

// Context
import { useSectionForm } from "../context/SectionFormContext";

// Type guard to check if item is a SectionDataType
function isSectionDataType(item: any): item is SectionDataType {
  return item && "handle" in item && "sectionLabel" in item;
}

// Type guard to check if item is a ComponentDataType
function isComponentDataType(item: any): item is ComponentDataType {
  return item && "componentLabel" in item;
}

/**
 * SectionBuilderTab Component
 * Manages the creation, editing, and management of sections and their components
 */
function SectionBuilderTab() {
  const [form] = Form.useForm();
  const cookies = parseCookies();

  const { sectionFormValues, setSectionFormValues, resetSectionFormValues } =
    useSectionForm();

  const [sectionData, setSectiondata] = useState<SectionDataType[]>([]);
  const [componentsData, setComponentsData] = useState<ComponentDataType[]>([]);
  const [selectedSection, setSelectedSection] =
    useState<SectionDataType | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<
    (ComponentDataType & { id: string })[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sectionDetails, setSectionDetails] = useState<SectionType | null>(
    null
  );

  // Add new state for create mode
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState("");

  // Add more specific loading states
  const [isLeftSectionLoading, setIsLeftSectionLoading] = useState(false);
  const [isMainFormLoading, setIsMainFormLoading] = useState(false);
  const [leftSectionLoadingMessage, setLeftSectionLoadingMessage] =
    useState("");
  const [mainFormLoadingMessage, setMainFormLoadingMessage] = useState("");

  // Add state for copy modal
  const [isCopyModalVisible, setIsCopyModalVisible] = useState(false);
  const [copySectionLabel, setCopySectionLabel] = useState("");

  // State to track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // State to store the original section state for comparison
  const [originalSectionState, setOriginalSectionState] = useState({
    sectionLabel: "",
    instructions: "",
    effectiveDateTime: "",
    componentIds: [],
  });
  const [previewComponent, setPreviewComponent] = useState<any>([]);

  // Add new state for preview
  const [isPreview, setIsPreview] = useState(false);

  // Update original section state when a section is selected
  useEffect(() => {
    if (selectedSection) {
      setOriginalSectionState({
        sectionLabel: selectedSection.sectionLabel || "",
        instructions: selectedSection.instructions || "",
        effectiveDateTime: selectedSection.effectiveDateTime || "",
        componentIds: sectionFormValues.componentIds,
      });
    }
  }, [selectedSection, sectionFormValues.componentIds]);

  // Track form changes
  useEffect(() => {
    // Check if there are any meaningful changes compared to the original state
    const hasChanges =
      sectionFormValues.sectionLabel.trim() !==
        originalSectionState.sectionLabel.trim() ||
      sectionFormValues.instructions.trim() !==
        originalSectionState.instructions.trim() ||
      sectionFormValues.effectiveDateTime !==
        originalSectionState.effectiveDateTime ||
      JSON.stringify(sectionFormValues.componentIds) !==
        JSON.stringify(originalSectionState.componentIds);

    setHasUnsavedChanges(hasChanges);
  }, [sectionFormValues, originalSectionState]);

  const fetchData = useCallback(
    async (searchValue: string = "") => {
      setIsLeftSectionLoading(true);
      setLeftSectionLoadingMessage("Loading sections...");
      try {
        const payloads = {
          site: cookies.site,
          sectionLabel: searchValue,
        };
        const payloadc = {
          site: cookies.site,
          componentLabel: searchValue,
        };

        const sectionResponse = await fetchSectionBuilderData(
          payloads,
          "sectionbuilder-service",
          "getAllSection"
        );

        const componentResponse = (await fetchSectionBuilderData(
          payloadc,
          "componentbuilder-service",
          "getAllComponent"
        )) as ComponentDataType[];

        const sectionData = sectionResponse.map((section: SectionType) => ({
          sectionLabel: section.sectionLabel,
          instructions: section.instructions,
          effectiveDateTime: section.effectiveDateTime,
          handle: section.handle,
        }));

        setComponentsData(componentResponse);
        setSectiondata(sectionData);
      } catch (error) {
        setSectiondata([]);
        setComponentsData([]);
        console.error("Failed to fetch Section & components:", error);
        message.error("Failed to load sections and components");
      } finally {
        setIsLeftSectionLoading(false);
        setLeftSectionLoadingMessage("");
      }
    },
    [cookies.site]
  );

  const fetchSectionDetails = useCallback(
    async (sectionLabel: string) => {
      setIsLeftSectionLoading(true);
      setLeftSectionLoadingMessage("Loading section details...");
      try {
        const payload = {
          site: cookies.site,
          sectionLabel: sectionLabel,
        };

        const response = (await fetchSectionBuilderData(
          payload,
          "sectionbuilder-service",
          "getSectionById"
        )) as SectionType;

        setSectionDetails(response);

        // Convert componentIds to ComponentDataType with unique id
        const sectionComponents: (ComponentDataType & { id: string })[] =
          response.componentIds.map((component: ComponentId) => ({
            handle: component.handle,
            componentLabel: component.label,
            dataType: component.dataType,
            defaultValue: null,
            required: false,
            id: `${Date.now()}-${component.label}-${component.handle}`, // Ensure unique id
          }));

        setSelectedComponents(sectionComponents);

        // Update section form values with full section details
        setSectionFormValues({
          sectionLabel: response.sectionLabel,
          instructions: response.instructions,
          effectiveDateTime: response.effectiveDateTime,
          structureType:
            response.structureType === "structured" ||
            response.structureType === "unstructured"
              ? response.structureType
              : "structured", // Fallback with explicit type check
          componentIds: response.componentIds.map((component) => ({
            handle: component.handle,
            label: component.label,
            dataType: component.dataType,
            componentId: component.label,
          })),
          style: response.style || {
            marginsEnabled: false,
            textAlignment: "left",
            tableAlignment: "left",
            splitColumns: 1,
          },
        });

        // Call preview API for section components
        await handlePreviewComponents(sectionComponents);

        // Update form values
        form.setFieldsValue({
          sectionLabel: response.sectionLabel,
          instructions: response.instructions,
          effectiveDateTime: response.effectiveDateTime
            ? moment(response.effectiveDateTime)
            : null,
          structureType: response.structureType,
        });

        // Additional metadata mapping
        setSelectedSection({
          handle: response.handle,
          sectionLabel: response.sectionLabel,
          instructions: response.instructions,
          effectiveDateTime: response.effectiveDateTime,
        });
      } catch (error) {
        console.error("Failed to fetch Section details:", error);
        setSectionDetails(null);
        setSelectedComponents([]);
        setPreviewComponent([]);
        message.error("Failed to load section details");
      } finally {
        setIsLeftSectionLoading(false);
        setLeftSectionLoadingMessage("");
      }
    },
    [cookies.site, form]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Update form values when sectionFormValues changes
    if (selectedSection) {
      form.setFieldsValue({
        sectionLabel: sectionFormValues.sectionLabel,
        instructions: sectionFormValues.instructions,
        effectiveDateTime: sectionFormValues.effectiveDateTime
          ? moment(sectionFormValues.effectiveDateTime)
          : null,
      });
    }
  }, [selectedSection, sectionFormValues, form]);

  const handleSectionClick = async (section: SectionDataType) => {
    // Reset preview state when a new section is selected
    setIsPreview(false);

    // Existing section click logic
    setSelectedSection(section);
    setSearchTerm("");

    // If section has a handle (existing section), fetch its details
    if (section.handle) {
      await fetchSectionDetails(section.sectionLabel);
    } else {
      // For new section, reset form and components
      setSelectedComponents([]);
      setPreviewComponent([]);
      setSectionDetails(null);

      // Reset section form values for new section
      setSectionFormValues({
        sectionLabel: "",
        instructions: "",
        effectiveDateTime: "",
        structureType: "structured", // Explicitly set to structured for new sections
        componentIds: [],
        style: {
          marginsEnabled: false,
          textAlignment: "left",
          tableAlignment: "left",
          splitColumns: 1,
        },
      });
    }
  };

  const handleBackToSections = () => {
    // If there are unsaved changes, show confirmation modal
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: "Unsaved Changes",
        content:
          "You have unsaved changes. Are you sure you want to go back? All changes will be lost.",
        okText: "Discard Changes",
        cancelText: "Cancel",
        okType: "danger",
        centered: true,
        onOk: () => {
          // Reset all states
          setSelectedSection(null);
          setSearchTerm("");
          setSelectedComponents([]);
          setSectionDetails(null);
          setPreviewComponent([]); // Reset preview component

          // Reset form values
          setSectionFormValues({
            sectionLabel: "",
            instructions: "",
            effectiveDateTime: "",
            structureType: "structured",
            componentIds: [],
            style: {
              marginsEnabled: false,
              textAlignment: "left",
              tableAlignment: "left",
              splitColumns: 1,
            },
          });

          // Fetch fresh data
          fetchData();

          // Reset unsaved changes flag
          setHasUnsavedChanges(false);
        },
      });
    } else {
      // If no changes, proceed normally
      setSelectedSection(null);
      setSearchTerm("");
      setSelectedComponents([]);
      setSectionDetails(null);
      setPreviewComponent([]); // Reset preview component
      fetchData();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    // Determine whether we're searching sections or components
    if (selectedSection) {
      // Searching components when a section is selected
      const payloadc = {
        site: cookies.site,
        componentLabel: searchTerm,
      };

      fetchSectionBuilderData(
        payloadc,
        "componentbuilder-service",
        "getAllComponent"
      )
        .then((componentResponse: ComponentDataType[]) => {
          setComponentsData(componentResponse);
        })
        .catch((error) => {
          console.error("Failed to fetch components:", error);
          setComponentsData([]);
        });
    } else {
      // Searching sections when no section is selected
      const payloads = {
        site: cookies.site,
        sectionLabel: searchTerm,
      };

      fetchSectionBuilderData(
        payloads,
        "sectionbuilder-service",
        "getAllSection"
      )
        .then((sectionResponse: SectionType[]) => {
          const sectionData = sectionResponse.map((section: SectionType) => ({
            sectionLabel: section.sectionLabel,
            instructions: section.instructions,
            effectiveDateTime: section.effectiveDateTime,
            handle: section.handle,
          }));
          setSectiondata(sectionData);
        })
        .catch((error) => {
          console.error("Failed to fetch sections:", error);
          setSectiondata([]);
        });
    }
  };

  const handleAddComponent = useCallback(
    async (component: ComponentDataType) => {
      // Add a new instance of the component with a unique id
      const newComponent = {
        ...component,
        id: `${Date.now()}-${component.componentLabel}`, // Ensure unique id
      };

      const updatedSelectedComponents = [...selectedComponents, newComponent];
      setSelectedComponents(updatedSelectedComponents);

      // Update section form values with component IDs
      setSectionFormValues((prev) => ({
        ...prev,
        componentIds: [
          ...prev.componentIds,
          {
            handle: component.handle,
            label: component.componentLabel,
            dataType: component.dataType,
            componentId: component.componentLabel,
          },
        ],
      }));

      // Call preview API
      await handlePreviewComponents(updatedSelectedComponents);
    },
    [selectedComponents]
  );

  const handleRemoveComponent = useCallback(
    async (record: ComponentDataType & { id: string }) => {
      // Remove from selected components
      const updatedComponents = selectedComponents.filter(
        (component) => component.id !== record.id
      );
      setSelectedComponents(updatedComponents);

      // Update section form values with remaining component IDs
      setSectionFormValues((prev) => ({
        ...prev,
        componentIds: updatedComponents.map((component) => ({
          handle: component.handle,
          label: component.componentLabel,
          dataType: component.dataType || "Text",
          componentId: component.componentLabel,
        })),
      }));

      // Call preview API
      await handlePreviewComponents(updatedComponents);
    },
    [selectedComponents]
  );

  const handleDragEnd = (dragIndex: number, dropIndex: number) => {
    const newComponents = [...selectedComponents];
    const [removed] = newComponents.splice(dragIndex, 1);
    newComponents.splice(dropIndex, 0, removed);

    // Update selected components
    setSelectedComponents(newComponents);

    // Reorder componentIds based on the new order
    setSectionFormValues((prev) => ({
      ...prev,
      componentIds: newComponents.map((component) => ({
        handle: component.handle,
        label: component.componentLabel,
        dataType: component.dataType || "Text",
        componentId: component.componentLabel,
      })),
    }));
  };

  const handleOpenPreview = async () => {
    // Only toggle preview if there are components to preview
    if (selectedComponents.length > 0) {
      // If toggling to preview, re-fetch preview components
      if (!isPreview) {
        await handlePreviewComponents(selectedComponents);
      }

      // Toggle preview state
      setIsPreview(!isPreview);
    } else {
      // Optionally show a message if no components are available for preview
      message.info("No components available for preview");
    }
  };

  const handleCopySection = () => {
    if (!selectedSection) return;

    const defaultCopyLabel = `${selectedSection.sectionLabel}_COPY`;
    setCopySectionLabel(defaultCopyLabel);
    setIsCopyModalVisible(true);
  };

  const handleConfirmCopySection = async () => {
    if (!selectedSection) return;

    if (!copySectionLabel) {
      message.error("Please enter a new section label");
      return;
    }

    const isDuplicate = sectionData.some(
      (section) => section.sectionLabel === copySectionLabel
    );

    if (isDuplicate) {
      message.error("A section with this label already exists");
      return;
    }

    setIsMainFormLoading(true);
    setMainFormLoadingMessage("Copying section...");

    try {
      const payload = {
        site: cookies.site,
        sectionLabel: copySectionLabel,
        instructions: sectionFormValues.instructions,
        effectiveDateTime: sectionFormValues.effectiveDateTime,
        structureType: sectionFormValues.structureType,
        componentIds: sectionFormValues.componentIds.map((component) => ({
          handle: component.handle,
          label: component.label,
          dataType: component.dataType,
        })),
        style: sectionFormValues.style, // Include style in copy
      };

      const response = await fetchSectionBuilderData(
        payload,
        "sectionbuilder-service",
        "createSection"
      );

      if (
        response?.message_details &&
        response.message_details.msg_type === "S"
      ) {
        message.success(
          response.message_details.msg || "Section copied successfully."
        );

        setIsCopyModalVisible(false);
        setCopySectionLabel("");

        // Reset context and local state
        resetSectionFormValues();
        setSelectedSection(null);
        setSelectedComponents([]);
        fetchData();
      } else {
        const errorMsg =
          response?.message_details?.msg || "Failed to copy section";
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("Error copying section:", error);
      message.error("Failed to copy section");
    } finally {
      setIsMainFormLoading(false);
      setMainFormLoadingMessage("");
    }
  };

  const handleDeleteSection = async () => {
    if (!selectedSection) return;

    Modal.confirm({
      title: "Delete Section",
      content: `Are you sure you want to delete the section "${selectedSection.sectionLabel}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        setIsMainFormLoading(true);
        setMainFormLoadingMessage("Deleting section...");

        try {
          const payload = {
            site: cookies.site,
            sectionLabel: selectedSection.sectionLabel,
          };

          const response = await fetchSectionBuilderData(
            payload,
            "sectionbuilder-service",
            "deleteSection"
          );

          if (
            response?.message_details &&
            response.message_details.msg_type === "S"
          ) {
            message.success(
              response.message_details.msg || "Section deleted successfully."
            );

            // Reset context and local state
            resetSectionFormValues();
            setSelectedSection(null);
            setSelectedComponents([]);
            fetchData();
          } else {
            const errorMsg =
              response?.message_details?.msg || "Failed to delete section";
            message.error(errorMsg);
          }
        } catch (error) {
          console.error("Error deleting section:", error);
          message.error("Failed to delete section");
        } finally {
          setIsMainFormLoading(false);
          setMainFormLoadingMessage("");
        }
      },
    });
  };

  const handleClearComponents = () => {
    // Clear all selected components
    setSelectedComponents([]);
    setPreviewComponent([]);

    // Update section form values to remove all component IDs
    setSectionFormValues((prev) => ({
      ...prev,
      componentIds: [],
    }));
  };

  // Add handler for plus button to enter create mode
  const handleAddSection = () => {
    // Create a temporary section object similar to existing sections
    const newSection: SectionDataType = {
      handle: "",
      sectionLabel: "",
      instructions: "",
      effectiveDateTime: "",
    };

    // Reset original section state for new section
    setOriginalSectionState({
      sectionLabel: "",
      instructions: "",
      effectiveDateTime: "",
      componentIds: [],
    });

    // Use the existing section click handler
    handleSectionClick(newSection);
  };

  const handleCancelCreateMode = () => {
    setIsCreateMode(false);
    setNewSectionLabel("");
    setSectionFormValues({
      sectionLabel: "",
      instructions: "",
      effectiveDateTime: "",
      structureType: "structured",
      componentIds: [],
      style: {
        marginsEnabled: false,
        textAlignment: "left",
        tableAlignment: "left",
        splitColumns: 1,
      },
    });
    setSelectedComponents([]);
    fetchData(); // Refresh the section list
  };

  // Modify existing renderListItem to handle create mode
  const renderListItem = (
    item: SectionDataType | ComponentDataType,
    index: number
  ) => {
    let itemName = "";
    let secondaryText = "";
    let isSection = false;

    if (!selectedSection && isSectionDataType(item)) {
      // Section item
      itemName = item.sectionLabel;
      secondaryText = "";
      isSection = true;
    } else if (
      (selectedSection && isComponentDataType(item)) ||
      (isCreateMode && isComponentDataType(item))
    ) {
      // Component item
      itemName = item.componentLabel;
      secondaryText = item.dataType;

      return (
        <List.Item
          key={index}
          className={styles["list-item"]}
          onClick={() => handleAddComponent(item)}
        >
          <div className={styles["list-item-content"]}>
            <div className={styles["list-item-content"]}>
              <span
                className={styles["list-item-text"]}
                style={{
                  fontSize: itemName.length > 30 ? "0.7em" : "0.9em",
                }}
              >
                {itemName}
              </span>
              {secondaryText && (
                <span className={styles["list-item-secondary"]}>
                  {secondaryText}
                </span>
              )}
            </div>
          </div>
        </List.Item>
      );
    }

    return (
      <List.Item
        key={index}
        className={styles["list-item"]}
        onClick={() =>
          !selectedSection && isSectionDataType(item)
            ? handleSectionClick(item)
            : null
        }
      >
        <div className={styles["list-item-content"]}>
          <div className={styles["list-item-content"]}>
            <span
              className={styles["list-item-text"]}
              style={{
                fontSize: "0.9em",
              }}
            >
              {itemName}
            </span>
            {secondaryText && (
              <span className={styles["list-item-secondary"]}>
                {secondaryText}
              </span>
            )}
          </div>
        </div>
      </List.Item>
    );
  };

  // Modify handleSaveOrCreate to add validation and use context values
  const handleSaveOrCreate = async () => {
    console.log(sectionFormValues);
    const isNewSection = !selectedSection?.handle;

    // Validate section label
    if (!sectionFormValues.sectionLabel) {
      message.error("Please fill all required fields - Section Label");
      return;
    }

    // Validate effective date time for new sections
    if (isNewSection && !sectionFormValues.effectiveDateTime) {
      message.error("Please fill all required fields - Effective Date Time");
      return;
    }

    // Prepare payload using context values
    const payload = {
      site: cookies.site,
      sectionLabel: sectionFormValues.sectionLabel,
      instructions: sectionFormValues.instructions,
      effectiveDateTime: sectionFormValues.effectiveDateTime,
      structureType: sectionFormValues.structureType,
      componentIds: sectionFormValues.componentIds.map((component) => ({
        handle: component.handle,
        label: component.label,
        dataType: component.dataType,
      })),
      style: sectionFormValues.style,
    };

    setIsMainFormLoading(true);
    setMainFormLoadingMessage(
      isNewSection ? "Creating section..." : "Updating section..."
    );

    try {
      const response = await fetchSectionBuilderData(
        payload,
        "sectionbuilder-service",
        isNewSection ? "createSection" : "updateSection"
      );

      if (
        response?.message_details &&
        response.message_details.msg_type === "S"
      ) {
        message.success(
          response.message_details.msg ||
            (isNewSection
              ? "Section created successfully."
              : "Section updated successfully.")
        );

        // Reset form and state
        resetSectionFormValues(); // Use context reset method
        setIsCreateMode(false);
        setSelectedSection(null);
        setSelectedComponents([]);
        fetchData();
      } else {
        // Handle error response
        const errorMsg =
          response?.message_details?.msg || "Failed to Create/save the section";
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("Error saving/creating section:", error);
      message.error("Failed to Create/save the section");
    } finally {
      setIsMainFormLoading(false);
      setMainFormLoadingMessage("");
    }
  };

  // Add handler for canceling section creation/editing
  const handleCancelSection = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: "Unsaved Changes",
        content:
          "You have unsaved changes. Are you sure you want to cancel? All changes will be lost.",
        okText: "Discard Changes",
        cancelText: "Keep Editing",
        okType: "danger",
        centered: true,
        onOk: () => {
          // Reset selected section and form values
          resetSectionFormValues(); // Use context reset method
          setSelectedSection(null);
          setSelectedComponents([]);

          // Reset unsaved changes flag
          setHasUnsavedChanges(false);

          // Refresh the section list
          fetchData();
        },
      });
    } else {
      // If no changes, proceed normally
      resetSectionFormValues(); // Use context reset method
      setSelectedSection(null);
      setSelectedComponents([]);

      // Refresh the section list
      fetchData();
    }
  };

  // New function to handle preview API call
  const handlePreviewComponents = async (components: any[]) => {
    if (components.length === 0) {
      // Clear preview when no components
      setPreviewComponent([]);
      return;
    }

    const payload = {
      site: "1004",
      componentIds: components,
    };
    try {
      const previewResponse = (await fetchSectionBuilderData(
        payload,
        "sectionbuilder-service",
        "preview"
      )) as SectionBuilderResponse;

      setPreviewComponent(previewResponse?.componentList || []);
    } catch (error) {
      message.error(
        `Something went wrong while previewing: ${
          error instanceof Error ? error.message : error
        }`
      );
      setPreviewComponent([]);
    }
  };

  return (
    <>
      <SectionBuilderHeader
        selectedSection={selectedSection}
        isPreview={isPreview}
        onOpenPreview={handleOpenPreview}
        onCopySection={handleCopySection}
        onDeleteSection={handleDeleteSection}
      />

      <Row className={styles["section-builder-container"]}>
        <Col span={5}>
          <SectionBuilderLeftPanel
            isLoading={isLeftSectionLoading}
            loadingMessage={leftSectionLoadingMessage}
            selectedSection={selectedSection}
            sectionData={sectionData}
            componentsData={componentsData}
            searchTerm={searchTerm}
            structureType={sectionFormValues.structureType}
            onBackToSections={handleBackToSections}
            onAddSection={handleAddSection}
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
            onItemClick={
              selectedSection ? handleAddComponent : handleSectionClick
            }
          />
        </Col>

        <Col span={14}>
          <SectionBuilderMainPanel
            form={form}
            isLoading={isMainFormLoading}
            loadingMessage={mainFormLoadingMessage}
            selectedSection={selectedSection}
            selectedComponents={selectedComponents}
            sectionFormValues={sectionFormValues}
            isPreview={isPreview}
            onSectionLabelChange={(value) => {
              setSectionFormValues((prev) => ({
                ...prev,
                sectionLabel: value,
              }));
              setSelectedSection((prev) =>
                prev ? { ...prev, sectionLabel: value } : null
              );
            }}
            onInstructionsChange={(value) =>
              setSectionFormValues((prev) => ({
                ...prev,
                instructions: value,
              }))
            }
            onEffectiveDateChange={(date) =>
              setSectionFormValues((prev) => ({
                ...prev,
                effectiveDateTime: date ? date.toISOString() : "",
              }))
            }
            onDragEnd={handleDragEnd}
            onRemoveComponent={handleRemoveComponent}
            onClearComponents={handleClearComponents}
            previewComponent={previewComponent}
            onStructureTypeChange={(value) =>
              setSectionFormValues((prev) => ({
                ...prev,
                structureType: value,
              }))
            }
          />
        </Col>

        <Col span={5}>
          <SectionBuilderRightPanel
            selectedSection={selectedSection}
            isCreateMode={isCreateMode}
            previewComponent={previewComponent}
            isPreview={isPreview}
          />
        </Col>
      </Row>

      <CopySectionModal
        isVisible={isCopyModalVisible}
        copySectionLabel={copySectionLabel}
        onCancel={() => {
          setIsCopyModalVisible(false);
          setCopySectionLabel("");
        }}
        onConfirm={handleConfirmCopySection}
        onLabelChange={setCopySectionLabel}
      />

      {/* Footer */}
      {(selectedSection || isCreateMode) && (
        <div className={styles.footer}>
          <Button
            onClick={handleCancelSection}
            className={styles["footer-cancel-button"]}
          >
            Cancel
          </Button>
          <Button type="primary" onClick={handleSaveOrCreate}>
            {selectedSection?.handle ? "Update" : "Create"}
          </Button>
        </div>
      )}
    </>
  );
}

export default SectionBuilderTab;
