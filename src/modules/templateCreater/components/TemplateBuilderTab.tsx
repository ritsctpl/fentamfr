import React, { useState, useCallback, useEffect } from "react";
import {
  Row,
  Col,
  Input,
  List,
  Button,
  Form,
  DatePicker,
  Tooltip,
  Modal,
  message,
  Spin,
  Select,
  Switch,
  Table,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from "nookies";
import moment from "moment";
import CopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";

// Types
import { TemplateListItem, TemplateDetails, GroupId, BuilderType, ComponentItem, SectionItem, GroupItem, ItemGroupResponse } from "../types/TemplateTypes";

// Styles
import styles from "../styles/TemplateBuilderTab.module.css";

// Components
import { DragableTable } from "./DragableTable";
import { TemplateStructureTree } from "./TemplateStructureTree";
import { fetchTemplateBuilderData } from "@services/templateBuilderService";

// Type guard to check if item is a TemplateListItem
function isTemplateListItem(item: any): item is TemplateListItem {
  return item && "templateLabel" in item && "templateType" in item;
}

function TemplateBuilderTab() {
  const [form] = Form.useForm();
  const [leftTemplateForm] = Form.useForm();
  const cookies = parseCookies();

  const [templateData, setTemplateData] = useState<TemplateListItem[]>([]);
  const [templatesData, setTemplatesData] = useState<GroupId[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetails | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<GroupId[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [templateDetails, setTemplateDetails] = useState<TemplateDetails | null>(null);
  const [templateFormValues, setTemplateFormValues] = useState<{
    templateLabel: string;
    templateVersion: string;
    templateType: string;
    productGroup: string;
    currentVersion: string;
    groupIds: GroupId[];
  }>({
    templateLabel: "",
    templateVersion: "",
    templateType: "",
    productGroup: "",
    currentVersion: "",
    groupIds: [],
  });

  // Add new state for create mode
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newTemplateLabel, setNewTemplateLabel] = useState("");

  // Add more specific loading states
  const [isLeftTemplateLoading, setIsLeftTemplateLoading] = useState(false);
  const [isMainFormLoading, setIsMainFormLoading] = useState(false);
  const [leftTemplateLoadingMessage, setLeftTemplateLoadingMessage] =
    useState("");
  const [mainFormLoadingMessage, setMainFormLoadingMessage] = useState("");

  // Add state for copy modal
  const [isCopyModalVisible, setIsCopyModalVisible] = useState(false);
  const [copyTemplateLabel, setCopyTemplateLabel] = useState("");

  // State to track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // State to store the original template state for comparison
  const [originalTemplateState, setOriginalTemplateState] = useState({
    templateLabel: "",
    templateVersion: "",
    templateType: "",
    productGroup: "",
    currentVersion: "",
  });
  const [previewGroup, setPreviewGroup] = useState<any>([]);
  const [selectedBuilderType, setSelectedBuilderType] = useState<BuilderType>("Group");
  const [componentsList, setComponentsList] = useState<ComponentItem[]>([]);
  const [sectionsList, setSectionsList] = useState<SectionItem[]>([]);
  const [groupsList, setGroupsList] = useState<GroupItem[]>([]);

  // Add new state for the new form fields
  const [ItemGroupVisible, setItemGroupVisible] = useState(false);
  const [itemGroupData, setItemGroupData] = useState<any[]>([]);

  // Update original template state when a template is selected
  useEffect(() => {
    if (selectedTemplate) {
        setOriginalTemplateState({
        templateLabel: selectedTemplate.templateLabel || "",
        templateVersion: selectedTemplate.templateVersion || "",
        templateType: selectedTemplate.templateType || "",
        productGroup: selectedTemplate.productGroup || "",
        currentVersion: selectedTemplate.currentVersion ? "true" : "false",
      });
    }
    }, [selectedTemplate, templateFormValues.groupIds]);

  // Track form changes
  useEffect(() => {
    // Check if there are any meaningful changes compared to the original state
    const hasChanges =
      templateFormValues.templateLabel.trim() !==
        originalTemplateState.templateLabel.trim() ||
      templateFormValues.templateVersion.trim() !==
        originalTemplateState.templateVersion.trim() ||
      templateFormValues.templateType !==
        originalTemplateState.templateType;

    setHasUnsavedChanges(hasChanges);
  }, [templateFormValues, originalTemplateState]);

  const fetchData = useCallback(
    async (searchValue: string = "") => {
      setIsLeftTemplateLoading(true);
      setLeftTemplateLoadingMessage("Loading templates...");
      try {
        const payloads = {
          site: cookies.site,
          templateLabel: searchValue,
        };

        const templateResponse = await fetchTemplateBuilderData(
          payloads,
          "templatebuilder-service",
          "getAllTemplate"
        ) as TemplateListItem[];

        setTemplateData(templateResponse);
        setTemplatesData([]);
      } catch (error) {
        setTemplateData([]);
        setTemplatesData([]);
        console.error("Failed to fetch Template & templates:", error);
        message.error("Failed to load templates and templates");
      } finally {
        setIsLeftTemplateLoading(false);
        setLeftTemplateLoadingMessage("");
      }
    },
    [cookies.site]
  );

  const fetchTemplateDetails = useCallback(
    async (templateLabel: string, templateVersion: string, currentVersion: boolean) => {
      setIsLeftTemplateLoading(true);
      setLeftTemplateLoadingMessage("Loading template details...");
      try {
        const payload = {
          site: cookies.site,
          userId: cookies.rl_user_id,
          templateLabel: templateLabel,
          templateVersion: templateVersion,
          currentVersion: currentVersion,
        };

        const response = await fetchTemplateBuilderData(
          payload,
          "templatebuilder-service",
          "getTemplate"
        ) as TemplateDetails;

        setTemplateDetails(response);
        setSelectedTemplate(response);

        // Update selected components with groupIds
        setSelectedComponents(response.groupIds);

        // Update form values
        const formValues = {
          templateLabel: response.templateLabel,
          templateVersion: response.templateVersion,
          templateType: response.templateType,
          productGroup: response.productGroup,
          currentVersion: response.currentVersion ? "true" : "false",
          groupIds: response.groupIds,
        };

        setTemplateFormValues(formValues);

        // Update form fields
        form.setFieldsValue({
          templateLabel: response.templateLabel,
          templateVersion: response.templateVersion,
          templateType: response.templateType,
          productGroup: response.productGroup,
          currentVersion: response.currentVersion,
        });

      } catch (error) {
        console.error("Failed to fetch Template details:", error);
        setTemplateDetails(null);
        setSelectedComponents([]);
        setPreviewGroup([]);
        message.error("Failed to load template details");
      } finally {
        setIsLeftTemplateLoading(false);
        setLeftTemplateLoadingMessage("");
      }
    },
    [cookies.site, cookies.rl_user_id, form]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Update form values when templateFormValues changes
    if (selectedTemplate) {
      form.setFieldsValue({
        templateLabel: templateFormValues.templateLabel,
        templateVersion: templateFormValues.templateVersion,
        templateType: templateFormValues.templateType,
        productGroup: templateFormValues.productGroup,
        currentVersion: templateFormValues.currentVersion
          ? moment(templateFormValues.currentVersion)
          : null,
      });
    }
  }, [selectedTemplate, templateFormValues, form]);

  // Utility function to detect changes
  const detectUnsavedChanges = () => {
    console.log("Detecting unsaved changes:");
    console.log("Current Form Values:", templateFormValues);
    console.log("Original Template State:", originalTemplateState);

    const labelChanged =
      templateFormValues.templateLabel.trim() !==
      originalTemplateState.templateLabel.trim();
    const instructionsChanged =
      templateFormValues.templateVersion.trim() !==
      originalTemplateState.templateVersion.trim();
    const dateChanged =
      templateFormValues.templateType !==
      originalTemplateState.templateType;
    const componentsChanged =
      JSON.stringify(templateFormValues.productGroup) !==
      JSON.stringify(originalTemplateState.productGroup);

    console.log("Changes detected:", {
      labelChanged,
      instructionsChanged,
      dateChanged,
      componentsChanged,
    });

    return (
      labelChanged || instructionsChanged || dateChanged || componentsChanged
    );
  };

    const handleTemplateClick = (template: any) => {
    // Check if this is a new template
    const isNewTemplate = !template?.templateLabel;

    // Create a mutable copy of the template
    const updatedTemplate = { ...template };
    setSelectedTemplate(updatedTemplate);

    if (isNewTemplate) {
      // Reset form for a new template
      setTemplateFormValues({
        templateLabel: updatedTemplate.templateLabel,
        templateVersion: "",
        templateType: "",
        productGroup: "",
        currentVersion: "",
        groupIds: [],
      });
      setSelectedComponents([]);
    } else {
      // Existing flow for existing templates
      fetchTemplateDetails(template.templateLabel, template.templateVersion, template.currentVersion);
    }
  };

  const handleBackToTemplates = () => {
    const hasChanges = detectUnsavedChanges();

    if (hasChanges) {
      Modal.confirm({
        title: "Unsaved Changes",
        content:
          "You have unsaved changes. Are you sure you want to go back? All changes will be lost.",
        okText: "Discard Changes",
        cancelText: "Keep Editing",
        okType: "danger",
        centered: true,
        onOk: () => {
          // Reset all states to their original values
          setSelectedTemplate(null);
          setSearchTerm("");
          setSelectedComponents([]);
          setTemplateDetails(null);
          setPreviewGroup([]); // Reset preview component

          // Reset form values
          setTemplateFormValues({
            templateLabel: "",
            templateVersion: "",
            templateType: "",
            productGroup: "",
            currentVersion: "",
            groupIds: [],
          });

          // Fetch fresh data
          fetchData();

          // Reset unsaved changes flag
          setHasUnsavedChanges(false);
        },
      });
    } else {
      // If no changes, proceed normally
      setSelectedTemplate(null);
      setSearchTerm("");
      setSelectedComponents([]);
      setTemplateDetails(null);
      setPreviewGroup([]); // Reset preview component
      fetchData();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchComponents = useCallback(async (searchValue: string = "") => {
    try {
      const response = await fetchTemplateBuilderData(
        { site: cookies.site, componentLabel: searchValue },
        "componentbuilder-service",
        "getAllComponent"
      );
      setComponentsList(Array.isArray(response) ? response as ComponentItem[] : []);
    } catch (error) {
      console.error("Failed to fetch components:", error);
      setComponentsList([]);
    }
  }, [cookies.site]);

  const fetchSections = useCallback(async (searchValue: string = "") => {
    try {
      const response = await fetchTemplateBuilderData(
        { site: cookies.site, sectionLabel: searchValue },
        "sectionbuilder-service",
        "getAllSection"
      );
      setSectionsList(Array.isArray(response) ? response as SectionItem[] : []);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      setSectionsList([]);
    }
  }, [cookies.site]);

  const fetchGroups = useCallback(async (searchValue: string = "") => {
    try {
      const response = await fetchTemplateBuilderData(
        { site: cookies.site, groupLabel: searchValue },
        "groupbuilder-service",
        "getAllGroup"
      );
      setGroupsList(Array.isArray(response) ? response as GroupItem[] : []);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      setGroupsList([]);
    }
  }, [cookies.site]);

  const handleSearch = useCallback(() => {
    switch (selectedBuilderType) {
      case "Component":
        fetchComponents(searchTerm);
        break;
      case "Section":
        fetchSections(searchTerm);
        break;
      case "Group":
        fetchGroups(searchTerm);
        break;
    }
  }, [selectedBuilderType, searchTerm, fetchComponents, fetchSections, fetchGroups]);

  useEffect(() => {
    if (selectedTemplate) {
      handleSearch();
    }
  }, [selectedBuilderType, selectedTemplate, handleSearch]);

  const handleAddGroup = useCallback(
    async (group: any) => {
      // Add a new instance of the component with a unique id
      const newGroup = {
        ...group,
        id: `${Date.now()}-${group.label}`, // Ensure unique id
      };

      const updatedSelectedComponents = [...selectedComponents, newGroup];
      setSelectedComponents(updatedSelectedComponents);

    // Update template form values with group IDs
      setTemplateFormValues((prev) => ({
        ...prev,
        groupIds: [
          ...prev.groupIds,
          {
            handle: group.handle,
            label: group.label,
          },
        ],
      }));

      // Call preview API
      await handlePreviewGroups(updatedSelectedComponents);
    },
    [selectedComponents]
  );

  const handleRemoveComponent = useCallback(
    async (record: any & { id: string }) => {
      // Remove from selected components
      const updatedComponents = selectedComponents.filter(
        (component) => component.handle !== record.handle
      );
      setSelectedComponents(updatedComponents);

      // Update template form values with remaining component IDs
      setTemplateFormValues((prev) => ({
        ...prev,
        groupIds: updatedComponents.map((component) => ({
          handle: component.handle,
          label: component.label,
        })),
      }));

      // Call preview API
      await handlePreviewGroups(updatedComponents);
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
    setTemplateFormValues((prev) => ({
      ...prev,
      groupIds: newComponents.map((component) => ({
        handle: component.handle, 
        label: component.label,
      })),
    }));
  };

  const handleOpenPreview = async () => {
    const payload = {
      site: "1004",
      groupIds: selectedComponents,
    };
    try {
      const previewResponse = (await fetchTemplateBuilderData(
        payload,
        "templatebuilder-service",
        "preview"
      )) as any;

      setPreviewGroup(previewResponse?.componentList);
      console.log("Preview Response:", previewResponse?.componentList);
    } catch (error) {
      message.error(
        `Something went wrong while previewing: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
    console.log("Open Preview", selectedComponents);
  };

  // Handler for copying template
  const handleCopyTemplate = () => {
    // Open copy modal with default copy label
    if (!selectedTemplate) return;

    const defaultCopyLabel = `${selectedTemplate.templateLabel}_COPY`;
    setCopyTemplateLabel(defaultCopyLabel);
    setIsCopyModalVisible(true);
  };

  // Confirm copy template
  const handleConfirmCopyTemplate = async () => {
    if (!selectedTemplate) return;

    // Validate copy template label
    if (!copyTemplateLabel) {
      message.error("Please enter a new template label");
      return;
    }

    // Check if template label already exists
    const isDuplicate = templateData.some(
      (template) => template.templateLabel === copyTemplateLabel
    );

    if (isDuplicate) {
      message.error("A template with this label already exists");
      return;
    }

    setIsMainFormLoading(true);
    setMainFormLoadingMessage("Copying template...");

    try {
      // Prepare payload for copying template
      const payload = {
        site: cookies.site,
        templateLabel: copyTemplateLabel,
        templateVersion: templateFormValues.templateVersion,
        templateType: templateFormValues.templateType,
        productGroup: templateFormValues.productGroup,
        currentVersion: templateFormValues.currentVersion,
        groupIds: templateFormValues.groupIds.map((group) => ({
          handle: group.handle,
          label: group.label,
        })),
      };

      const response = await fetchTemplateBuilderData(
        payload,
        "templatebuilder-service",
        "createTemplate"
      );

      if (
        response?.message_details &&
        response.message_details.msg_type === "S"
      ) {
        message.success(
          response.message_details.msg || "Template copied successfully."
        );

        // Reset states
        setIsCopyModalVisible(false);
        setCopyTemplateLabel("");
        setSelectedTemplate(null);
        setTemplateFormValues({
          templateLabel: "",
          templateVersion: "",
          templateType: "",
          productGroup: "",
          currentVersion: "",
          groupIds: [],
        });
        setSelectedComponents([]);
        fetchData();
      } else {
        const errorMsg =
          response?.message_details?.msg || "Failed to copy template";
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("Error copying template:", error);
      message.error("Failed to copy template");
    } finally {
      setIsMainFormLoading(false);
      setMainFormLoadingMessage("");
    }
  };

  // Handler for deleting template
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    // Confirm delete modal
    Modal.confirm({
      title: "Delete Template",
      content: `Are you sure you want to delete the template "${selectedTemplate.templateLabel}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        setIsMainFormLoading(true);
        setMainFormLoadingMessage("Deleting template...");

        try {
          const payload = {
            site: cookies.site,
            templateLabel: selectedTemplate.templateLabel,
          };

          const response = await fetchTemplateBuilderData(
            payload,
            "templatebuilder-service",
            "deleteTemplate"
          );

          if (
            response?.message_details &&
            response.message_details.msg_type === "S"
          ) {
            message.success(
              response.message_details.msg || "Template deleted successfully."
            );

            // Reset states
            setSelectedTemplate(null);
            setTemplateFormValues({
              templateLabel: "",
              templateVersion: "",
              templateType: "",
              productGroup: "",
              currentVersion: "",
              groupIds: [],
            });
            setSelectedComponents([]);
            fetchData();
          } else {
            const errorMsg =
              response?.message_details?.msg || "Failed to delete template";
            message.error(errorMsg);
          }
        } catch (error) {
          console.error("Error deleting template:", error);
          message.error("Failed to delete template");
        } finally {
          setIsMainFormLoading(false);
          setMainFormLoadingMessage("");
        }
      },
    });
  };

  const handleClearGroups = () => {
    // Clear all selected components
    setSelectedComponents([]);
    setPreviewGroup([]);

    // Update template form values to remove all component IDs
    setTemplateFormValues((prev) => ({
      ...prev,
      componentIds: [],
    }));
  };

  // Add handler for plus button to enter create mode
  const handleAddTemplate = () => {
    // Create a temporary template object similar to existing templates
    const newTemplate: any = {
        handle: "",
        templateLabel: "",
      templateVersion: "",
      templateType: "",
      productGroup: "",
      currentVersion: "",   
    };

    // Reset original template state for new template
    setOriginalTemplateState({
      templateLabel: "",
      templateVersion: "",
      templateType: "",
      productGroup: "",
      currentVersion: "",
    });

    // Use the existing template click handler
    handleTemplateClick(newTemplate);
  };

  const handleCancelCreateMode = () => {
    setIsCreateMode(false);
    setNewTemplateLabel("");
    setTemplateFormValues({
      templateLabel: "",
      templateVersion: "",
      templateType: "",
      productGroup: "",
      currentVersion: "",
      groupIds: [],
    });
    setSelectedComponents([]);
    fetchData(); // Refresh the template list
  };

  // Modify existing renderListItem to handle create mode
  const renderListItem = (item: any, index: number) => {
    if (!selectedTemplate) {
      // Render template list item
      return (
        <List.Item
          key={index}
          style={{
            padding: "8px 12px",
            backgroundColor: "#fff",
            marginBottom: "8px",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "1px solid transparent",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
          onClick={() => handleTemplateClick(item)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span>{item.templateLabel}</span>
            <span style={{ color: "#666" }}>{item.templateVersion}</span>
          </div>
        </List.Item>
      );
    }

    // Render builder item based on type
    let itemLabel = "";
    let itemHandle = "";

    switch (selectedBuilderType) {
      case "Component":
        itemLabel = (item as ComponentItem).componentLabel;
        break;
      case "Section":
        itemLabel = (item as SectionItem).sectionLabel;
        break;
      case "Group":
        itemLabel = (item as GroupItem).groupLabel;
        break;
    }

    return (
      <List.Item
        key={index}
        style={{
          padding: "8px 12px",
          backgroundColor: "#fff",
          marginBottom: "8px",
          borderRadius: "4px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          border: "1px solid transparent",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
        onClick={() => handleAddGroup(item)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <span>{itemLabel}</span>
          <span style={{ color: "#666" }}>{itemHandle}</span>
        </div>
      </List.Item>
    );
  };

  // Modify handleSaveOrCreate to add validation
  const handleSaveOrCreate = async () => {
    const isNewTemplate = !selectedTemplate?.handle;

    // Validate template label
    if (!templateFormValues.templateLabel) {
      message.error("Please fill all required fields - Template Label");
      return;
    }

    // Validate effective date time for new templates
    if (isNewTemplate && !templateFormValues.currentVersion) {
      message.error("Please fill all required fields - Current Version");
      return;
    }

    // Prepare payload
    const payload = {
      site: cookies.site,
      templateLabel: templateFormValues.templateLabel,
      templateVersion: templateFormValues.templateVersion,
      templateType: templateFormValues.templateType,
      productGroup: templateFormValues.productGroup,
      currentVersion: templateFormValues.currentVersion,
      groupIds: templateFormValues.groupIds.map((group) => ({
        handle: group.handle,
        label: group.label,
      })),
    };

    setIsMainFormLoading(true);
    setMainFormLoadingMessage(
      isNewTemplate ? "Creating template..." : "Updating template..."
    );

    try {
      const response = await fetchTemplateBuilderData(
        payload,
        "templatebuilder-service",
        isNewTemplate ? "createTemplate" : "updateTemplate"
      );

      if (
        response?.message_details &&
        response.message_details.msg_type === "S"
      ) {
        message.success(
          response.message_details.msg ||
            (isNewTemplate
              ? "Template created successfully."
              : "Template updated successfully.")
        );

        // Reset form and state
        setIsCreateMode(false);
        setSelectedTemplate(null);
        setTemplateFormValues({
          templateLabel: "",
          templateVersion: "",
          templateType: "",
          productGroup: "",
          currentVersion: "",
          groupIds: [],
        });
        setSelectedComponents([]);
        fetchData();
      } else {
        // Handle error response
        const errorMsg =
          response?.message_details?.msg || "Failed to Create/save the template";
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("Error saving/creating template:", error);
      message.error("Failed to Create/save the template");
    } finally {
      setIsMainFormLoading(false);
      setMainFormLoadingMessage("");
    }
  };

  // Add handler for canceling template creation/editing
  const handleCancelTemplate = () => {
    const hasChanges = detectUnsavedChanges();

    if (hasChanges) {
      Modal.confirm({
        title: "Unsaved Changes",
        content:
          "You have unsaved changes. Are you sure you want to cancel? All changes will be lost.",
        okText: "Discard Changes",
        cancelText: "Keep Editing",
        okType: "danger",
        centered: true,
        onOk: () => {
          // Reset all states to their original values
          setSelectedTemplate(null);
          setTemplateFormValues({
            templateLabel: "",
            templateVersion: "",
            templateType: "",
            productGroup: "",
            currentVersion: "",
            groupIds: [],
          });
          setSelectedComponents([]);
          setPreviewGroup([]);
          setHasUnsavedChanges(false);

          // Refresh the template list
          fetchData();
        },
      });
    } else {
      // If no changes, proceed normally
      setSelectedTemplate(null);
      setTemplateFormValues({
        templateLabel: "",
        templateVersion: "",
        templateType: "",
        productGroup: "",
        currentVersion: "",
        groupIds: [],
      });
      setSelectedComponents([]);
      setPreviewGroup([]);

      // Refresh the template list
      fetchData();
    }
  };

  // New function to handle preview API call
  const handlePreviewGroups = async (groups: any[]) => {
    if (groups.length === 0) {
      // Clear preview when no components
      setPreviewGroup([]);
      return;
    }

    const payload = {
      site: "1004",
      groupIds: groups,
    };
    try {
      const previewResponse = (await fetchTemplateBuilderData(
        payload,
        "templatebuilder-service",
        "preview"
      )) as any;

      setPreviewGroup(previewResponse?.componentList || []);
    } catch (error) {
      message.error(
        `Something went wrong while previewing: ${
          error instanceof Error ? error.message : error
        }`
      );
      setPreviewGroup([]);
    }
  };

  // Get the current list based on selected type
  const getCurrentList = () => {
    if (!selectedTemplate) return templateData;
    
    switch (selectedBuilderType) {
      case "Component":
        return componentsList;
      case "Section":
        return sectionsList;
      case "Group":
        return groupsList;
      default:
        return [];
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9_\-\(\)]/g, "");

    const patterns: { [key: string]: RegExp } = {
      productGroup: /^[A-Z0-9_\-\(\)]*$/,
    };

    if (patterns[key]?.test(newValue)) {
      form.setFieldsValue({ [key]: newValue });
    }
  };

  const handleCancel = () => {
    setItemGroupVisible(false);
  };

  const handleProductGroupClick = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const typedValue = form.getFieldValue('productGroup');
    const newValue = { itemGroup: typedValue };

    try {
      let response = typedValue ? 
        await fetchTemplateBuilderData(
          { site, ...newValue },
          "itemgroup-service",
          "getAllItemGroup"
        ) as ItemGroupResponse : 
        await fetchTemplateBuilderData(
          { site },
          "itemgroup-service",
          "getTop50ItemGroup"
        ) as ItemGroupResponse;

      if (response && !response.errorCode) {
        const formattedData = response.groupNameList.map((item, index) => ({ id: index, ...item }));
        setItemGroupData(formattedData);
      } else {
        setItemGroupData([]);
      }
    } catch (error) {
      console.error('Error', error);
      setItemGroupData([]);
    }
    setItemGroupVisible(true);
  };

  const handleItemGroupOk = (selectedRow: any) => {
    if (selectedRow) {
      form.setFieldsValue({ productGroup: selectedRow.itemGroup });
      message.destroy();
      message.success('Product group selected');
    }
    setItemGroupVisible(false);
  };

  const ItemGroupColumn = [
    { title: "Item Group", dataIndex: "itemGroup", key: "itemGroup" },
    { title: "Group Description", dataIndex: "groupDescription", key: "groupDescription" },
  ];

  return (
    <>
      {/* Full-width header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          fontWeight: 500,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "40px",
          padding: "0 16px",
          backgroundColor: "#fff",
          borderBottom: "1px solid #f0f0f0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
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
          <span style={{ fontWeight: 500 }}>Template Builder</span>
          {selectedTemplate && (
            <span style={{ color: "#666", marginLeft: "0px" }}>
            - {selectedTemplate.templateLabel}
            </span>
          )}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            height: "100%",
          }}
        >
          {selectedTemplate && (
            <>
                <Tooltip title="Preview Template Builder">
                <EyeOutlined
                  style={{
                    color: "#1890ff",
                    cursor: "pointer",
                    fontSize: "22px",
                  }}
                  onClick={handleOpenPreview}
                />
              </Tooltip>
              <Tooltip title="Copy Template">
                <CopyIcon
                  style={{
                    color: selectedTemplate.handle ? "#1890ff" : "#d9d9d9",
                    cursor: selectedTemplate.handle ? "pointer" : "not-allowed",
                    fontSize: "22px",
                  }}
                  onClick={
                    selectedTemplate.handle ? handleCopyTemplate : undefined
                  }
                />
              </Tooltip>
              <Tooltip title="Delete Template">
                <DeleteIcon
                  style={{
                    color: selectedTemplate.handle ? "#ff4d4f" : "#d9d9d9",
                    cursor: selectedTemplate.handle ? "pointer" : "not-allowed",
                    fontSize: "22px",
                  }}
                  onClick={
                    selectedTemplate.handle ? handleDeleteTemplate : undefined
                  }
                />
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Adjust main content to account for fixed header */}
      <Row
        className={styles["template-builder-container"]}
        style={{
          marginTop: "40px", // Match header height
          height: "calc(100vh - 40px)", // Adjust total height
          position: "relative", // Add positioning for absolute footer
        }}
      >
        {/* Left Section - Available Templates */}
        <Col
          span={5}
          className={styles["left-section"]}
          style={{
            height: "calc(100vh - 90px)", // Adjust height to account for header and footer
            display: "flex",
            flexDirection: "column",
            position: "relative", // Add positioning for loading overlay
          }}
        >
          {/* Left Section Loading Overlay */}
          {isLeftTemplateLoading && (
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
                tip={leftTemplateLoadingMessage}
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
                {selectedTemplate && (
                  <ArrowLeftOutlined
                    onClick={handleBackToTemplates}
                    style={{
                      marginRight: "8px",
                      cursor: "pointer",
                      color: "#000",
                      fontSize: "14px",
                    }}
                  />
                )}
                {selectedTemplate
                  ? `Template Builder`
                  : `Template Builder (${templateData?.length || 0})`}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  height: "100%",
                }}
              >
                {!selectedTemplate && !isCreateMode && (
                  <PlusOutlined
                    style={{
                      color: "#1890ff",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    onClick={handleAddTemplate}
                    title="Add New Template"
                  />
                )}
              </div>
            </div>

            {/* Type Selector */}
            {selectedTemplate && (
              <Form.Item
                style={{
                  marginBottom: "16px",
                  width: "100%",
                }}
              >
                <Select
                  value={selectedBuilderType}
                  onChange={(value: BuilderType) => setSelectedBuilderType(value)}
                  style={{ width: "100%" }}
                >
                  <Select.Option value="Group">Groups</Select.Option>
                  <Select.Option value="Section">Sections</Select.Option>
                  <Select.Option value="Component">Components</Select.Option>
                </Select>
              </Form.Item>
            )}

            {/* Search Input */}
            <Form
              form={leftTemplateForm}
              layout="inline"
              style={{
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Form.Item
                name="templateSearch"
                style={{
                  flex: 1,
                  marginRight: "8px",
                  marginBottom: 0,
                }}
              >
                <Input.Search
                    placeholder="Search templates..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onSearch={handleSearch}
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
                maxHeight: "calc(100vh - 200px)", // Adjust based on other elements
                paddingRight: "8px", // Add some padding for scrollbar
              }}
            >
              <List
                dataSource={getCurrentList()}
                renderItem={renderListItem}
                style={{
                  height: "100%",
                }}
              />
            </div>
          </div>
        </Col>

        {/* Main Section - Selected Groups */}
        <Col
          span={14}
          className={styles["main-section"]}
          style={{ position: "relative" }} // Add positioning for loading overlay
        >
          {isMainFormLoading && (
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
                size="large"
                tip={mainFormLoadingMessage}
                style={{
                  fontSize: "14px",
                  color: "#1890ff",
                }}
              />
            </div>
          )}

          <div>
            {!selectedTemplate && !isCreateMode ? (
              <span
                style={{
                  color: "#999",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "85vh",
                  width: "100%",
                  padding: "20px",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                Please select a template or create a new one to get started
              </span>
            ) : (
              <>
                <Form
                  form={form}
                  layout="vertical"
                  style={{
                    marginBottom: "16px",
                    width: "100%",
                  }}
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="templateLabel"
                        label="Template Name"
                        rules={[{ required: true, message: 'Please enter template name' }]}
                      >
                        <Input
                          placeholder="Enter Template Name"
                          disabled={selectedTemplate?.handle ? true : false}
                          onChange={(e) => {
                            const value = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z_]/g, "");
                            setTemplateFormValues((prev) => ({
                              ...prev,
                              templateLabel: value,
                            }));
                            setSelectedTemplate((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    templateLabel: value,
                                  }
                                : null
                            );
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="templateVersion"
                        label="Version"
                        initialValue="A"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="templateType"
                        label="Template Type"
                      >
                        <Select
                          options={[
                            { value: "MFR", label: "MFR" },
                            { value: "BMR", label: "BMR" },
                            { value: "BPR", label: "BPR" },
                          ]}
                          placeholder="Select Template Type"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="productGroup"
                        label="Product Group"
                      >
                        <Input
                          autoComplete="off"
                          suffix={
                            <GrChapterAdd
                              style={{ cursor: 'pointer' }}
                              onClick={handleProductGroupClick}
                            />
                          }
                          onChange={(e) => handleInputChange(e, 'productGroup')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="currentVersion"
                        label="Current Version"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>

                {/* Add Modal for Product Group selection */}
                <Modal 
                  title="Select Item Group" 
                  open={ItemGroupVisible} 
                  onCancel={handleCancel} 
                  width={800} 
                  footer={null}
                >
                  <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                      onDoubleClick: () => handleItemGroupOk(record)
                    })}
                    columns={ItemGroupColumn}
                    dataSource={itemGroupData}
                    rowKey="id"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                  />
                </Modal>

                {(selectedTemplate || isCreateMode) && (
                  <DragableTable
                    dataSource={selectedComponents.map((component) => ({
                      ...component,
                      id:
                        component.handle ||
                        `${Date.now()}-${component.label}`,
                    }))}
                    onDragEnd={handleDragEnd}
                    onRemoveComponent={handleRemoveComponent}
                    onClearComponents={handleClearGroups}
                  />
                )}
              </>
            )}
          </div>
        </Col>

        {/* Right Section */}
        <Col
          span={5}
          className={styles["right-section"]}
          style={{
            height: "calc(100vh - 90px)", // Adjust height to account for header and footer
            display: "flex",
            flexDirection: "column",
            position: "relative",
            backgroundColor: "#f5f5f5", // Add positioning for loading overlay
          }}
        >
          {!selectedTemplate && !isCreateMode ? (
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
              Select a template or create a new one to view structure
            </span>
          ) : (
            <TemplateStructureTree
              label={""}
              selectedGroups={previewGroup}
            />
          )}
        </Col>


        {/* Footer */}
        {(selectedTemplate || isCreateMode) && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50px",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "0 16px",
              borderTop: "1px solid #f0f0f0",
              backgroundColor: "#fff",
            }}
          >
            <Button
              onClick={handleCancelTemplate}
              style={{ marginRight: "12px" }}
            >
              Cancel
            </Button>
            <Button type="primary" onClick={handleSaveOrCreate}>
              {selectedTemplate?.handle ? "Update" : "Create"}
            </Button>
          </div>
        )}
      </Row>

      {/* Copy Template Modal */}
      <Modal
        title="Copy Template"
        open={isCopyModalVisible}
        onOk={handleConfirmCopyTemplate}
        onCancel={() => {
          setIsCopyModalVisible(false);
          setCopyTemplateLabel("");
        }}
        centered
        okText="Copy"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item
            label="New Template Label"
            rules={[
              { required: true, message: "Please enter a new template label" },
            ]}
          >
            <Input
              ref={(input) => {
                if (input) {
                  input.focus();
                  input.select();
                }
              }}
              placeholder="Enter new template label"
              value={copyTemplateLabel}
              onChange={(e) => {
                const value = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9_]/g, "");
                setCopyTemplateLabel(value);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default TemplateBuilderTab;
