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
  Tabs,
  Empty,
  Breadcrumb,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
  SaveOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from "nookies";
import moment from "moment";
import CopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { FaLayerGroup } from "react-icons/fa";
import { CiBoxList } from 'react-icons/ci';
import { LuComponent, LuLayoutTemplate } from 'react-icons/lu';
import { VscSymbolStructure } from 'react-icons/vsc';
import { GoDownload } from "react-icons/go";
import TemplatePreview, { TemplatePreviewRef } from "./TemplatePreview";

// Types
import type {
  TemplateListItem as ImportedTemplateListItem,
  BuilderType,
  ComponentItem,
  SectionItem,
  GroupItem,
  ItemGroupResponse,
} from "../types/TemplateTypes";

// Styles
import styles from "../styles/TemplateBuilderTab.module.css";

// Components
import { DragableTable } from "./DragableTable";
import { TemplateStructureTree } from "./TemplateStructureTree";
import { fetchTemplateBuilderData } from "@services/templateBuilderService";
import { ConfigureTab } from "./ConfigureTab";

// Type guard to check if item is a TemplateListItem
function isTemplateListItem(item: any): item is ImportedTemplateListItem {
  return item && "templateLabel" in item && "templateType" in item;
}

// Update the interface for TemplateDetails to include proper types
interface TemplateDetails {
  templateLabel: string;
  templateVersion: string;
  templateType: string;
  productGroup: string;
  currentVersion: boolean;
  groupIds: GroupId[];
  handle?: string;
}

// Add interface for API response
interface TemplateDetailsResponse {
  templateLabel: string;
  templateVersion: string;
  templateType: string;
  productGroup: string;
  currentVersion: boolean;
  groupIds: GroupId[];
  handle?: string;
}

// Define local GroupId interface
interface GroupId {
  handle: string;
  label: string;
  uniqueId: string;
  groupLabel?: string;
  sectionLabel?: string;
  componentLabel?: string;
  config?: {
    type: 'header' | 'body' | 'footer';
    logo: string;
    pageOccurrence: 'all' | null;
    margin: number;
    height: number;
    alignment: 'left' | 'center' | 'right';
  };
}

function TemplateBuilderTab() {
  const [form] = Form.useForm();
  const [leftTemplateForm] = Form.useForm();
  const cookies = parseCookies();

  const [templateData, setTemplateData] = useState<ImportedTemplateListItem[]>([]);
  const [templatesData, setTemplatesData] = useState<GroupId[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetails | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<GroupId[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  // const [templateDetails, setTemplateDetails] = useState<TemplateDetails | null>(null);
  const [templateFormValues, setTemplateFormValues] = useState<{
    templateLabel: string;
    templateVersion: string;
    templateType: string;
    productGroup: string;
    currentVersion: boolean;
    groupIds: GroupId[];
  }>({
    templateLabel: "",
    templateVersion: "",
    templateType: "",
    productGroup: "",
    currentVersion: false,
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
    currentVersion: false,
  });
  const [previewGroup, setPreviewGroup] = useState<any[]>([]);
  const [selectedBuilderType, setSelectedBuilderType] = useState<BuilderType>("Group");
  const [componentsList, setComponentsList] = useState<ComponentItem[]>([]);
  const [sectionsList, setSectionsList] = useState<SectionItem[]>([]);
  const [groupsList, setGroupsList] = useState<GroupItem[]>([]);

  console.log(previewGroup, 'previewGroup');


  // Add new state for the new form fields
  const [ItemGroupVisible, setItemGroupVisible] = useState(false);
  const [itemGroupData, setItemGroupData] = useState<any[]>([]);

  // Inside the TemplateBuilderTab component, add state for selected row and active tab
  const [selectedRow, setSelectedRow] = useState<GroupId | null>(null);
  const [activeTab, setActiveTab] = useState<string>("structure");

  // Add state for preview mode
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);

  // Add ref for TemplatePreview
  const previewRef = React.useRef<TemplatePreviewRef>(null);

  // Update original template state when a template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setOriginalTemplateState({
        templateLabel: selectedTemplate.templateLabel || "",
        templateVersion: selectedTemplate.templateVersion || "",
        templateType: selectedTemplate.templateType || "",
        productGroup: selectedTemplate.productGroup || "",
        currentVersion: selectedTemplate.currentVersion === true,
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
        ) as ImportedTemplateListItem[];

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
          currentVersion: currentVersion === true,
        };

        const response = await fetchTemplateBuilderData(
          payload,
          "templatebuilder-service",
          "getTemplate"
        ) as TemplateDetailsResponse;

        // Reset selected row when loading new template
        setSelectedRow(null);

        // Add unique IDs to groupIds
        const normalizedResponse: any = {
          ...response,
          currentVersion: response.currentVersion,
          groupIds: response.groupIds.map(group => ({
            ...group,
            uniqueId: `${group.handle}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            config: group.config || {
              type: "body",
              logo: "",
              pageOccurrence: "",
              margin: 0,
              height: 0,
              alignment: "left"
            }
          }))
        };

        // setTemplateDetails(normalizedResponse);
        setSelectedTemplate(normalizedResponse);
        setSelectedComponents(normalizedResponse.groupIds);
        setTemplateFormValues({
          ...normalizedResponse,
          templateLabel: normalizedResponse.templateLabel,
          templateVersion: normalizedResponse.templateVersion,
          templateType: normalizedResponse.templateType,
          productGroup: normalizedResponse.productGroup,
          currentVersion: normalizedResponse.currentVersion === true,
          groupIds: normalizedResponse.groupIds,
        });

        // Call preview API after setting up the template details
        const previewPayload = {
          site: "1004",
          groupIds: normalizedResponse.groupIds.map((group) => ({
            handle: group.handle,
            label: group.label,
            config: group.config
          })),
        };

        const previewResponse = await fetchTemplateBuilderData(
          previewPayload,
          "templatebuilder-service",
          "preview"
        ) as any;

        // Transform the preview response to match the tree structure
        const transformedData = previewResponse?.map((item: any) => {
          if (item.groupLabel) {
            // Handle Group
            return {
              _id: item._id,
              groupLabel: item.groupLabel,
              sectionIds: item.sectionIds?.map((section: any) => ({
                _id: section._id,
                sectionLabel: section.sectionLabel,
                components: section.components || []
              })) || []
            };
          } else if (item.sectionLabel) {
            // Handle Section
            return {
              _id: item._id,
              sectionLabel: item.sectionLabel,
              components: item.components || []
            };
          } else {
            // Handle Component
            return {
              _id: item._id,
              componentLabel: item.componentLabel,
              dataType: item.dataType
            };
          }
        }) || [];

        setPreviewGroup(transformedData);

      } catch (error) {
        console.error("Failed to fetch Template details:", error);
        // setTemplateDetails(null);
        setSelectedComponents([]);
        setPreviewGroup([]);
        // message.error("Failed to load template details");
      } finally {
        setIsLeftTemplateLoading(false);
        setLeftTemplateLoadingMessage("");
      }
    },
    [cookies.site, cookies.rl_user_id]
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
        currentVersion: templateFormValues.currentVersion === true,
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
    setActiveTab("structure"); // Set default tab to structure when template is loaded

    if (isNewTemplate) {
      // Reset form for a new template
      setTemplateFormValues({
        templateLabel: updatedTemplate.templateLabel,
        templateVersion: "",
        templateType: "",
        productGroup: "",
        currentVersion: false,
        groupIds: [],
      });
      setSelectedComponents([]);
    } else {
      // Existing flow for existing templates
      fetchTemplateDetails(
        template.templateLabel,
        template.templateVersion,
        template.currentVersion === true
      );
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
          // setTemplateDetails(null);
          setPreviewGroup([]); // Reset preview component
          setSelectedBuilderType("Group");
          // Reset form values
          setTemplateFormValues({
            templateLabel: "",
            templateVersion: "",
            templateType: "",
            productGroup: "",
            currentVersion: false,
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
      // setTemplateDetails(null);
      setSelectedBuilderType("Group");
      setPreviewGroup([]); // Reset preview component
      setIsPreviewMode(false);
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
    console.log("searchValue", searchValue);
    
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
    // Only search builder items when a template is selected
    if (selectedTemplate) {
      switch (selectedBuilderType) {
        case "Component":
          fetchComponents(searchTerm);
          break;
        case "Section":
          console.log("searchTermss", searchTerm);
          fetchSections(searchTerm);
          break;
        case "Group":
          fetchGroups(searchTerm);
          break;
      }
    } else {
      fetchData(searchTerm);
    }
  }, [selectedBuilderType, searchTerm, fetchComponents, fetchSections, fetchGroups, fetchData, selectedTemplate]);

  useEffect(() => {
    if (selectedTemplate) {
      handleSearch();
    }
  }, [selectedBuilderType, selectedTemplate, handleSearch]);

  // Update handleAddGroup function
  const handleAddGroup = useCallback(
    async (group: any) => {
      setSelectedRow(null);
      // Generate a unique ID based on the type of item
      const itemType = group.groupLabel ? 'group' :
        group.sectionLabel ? 'section' :
          group.componentLabel ? 'component' : 'item';

      const uniqueId = `${group.handle}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add a new instance of the group with a unique id, proper label, and default config
      const newGroup = {
        ...group,
        uniqueId: uniqueId, // Use the generated uniqueId
        label: group.groupLabel || group.sectionLabel || group.componentLabel || group.label,
        config: {
          type: 'body',
          logo: '',
          pageOccurrence: '',
          margin: 0,
          height: 0,
          alignment: 'left',
        }
      };

      const updatedSelectedComponents = [...selectedComponents, newGroup];
      setSelectedComponents(updatedSelectedComponents);

      // Update template form values with group IDs, labels, and config
      setTemplateFormValues((prev) => ({
        ...prev,
        groupIds: [
          ...prev.groupIds,
          {
            handle: group.handle,
            label: group.groupLabel || group.sectionLabel || group.componentLabel || group.label,
            uniqueId: uniqueId, // Add the same uniqueId to groupIds
            config: newGroup.config,
            groupLabel: group.groupLabel,
            sectionLabel: group.sectionLabel,
            componentLabel: group.componentLabel,
          },
        ],
      }));

      // Call preview API
      await handlePreviewGroups(updatedSelectedComponents);
    },
    [selectedComponents]
  );

  const handleRemoveComponent = useCallback(
    async (record: any & { uniqueId: string }) => {
      if (selectedRow?.uniqueId === record.uniqueId) {
        setSelectedRow(null);
      }
      // Remove from selected components using uniqueId
      const updatedComponents = selectedComponents.filter(
        (component) => component.uniqueId !== record.uniqueId
      );
      setSelectedComponents(updatedComponents);

      // Update template form values with remaining component IDs and their labels
      setTemplateFormValues((prev) => ({
        ...prev,
        groupIds: updatedComponents.map((component) => ({
          handle: component.handle,
          label: component.groupLabel || component.sectionLabel || component.componentLabel || component.label,
          uniqueId: component.uniqueId,
          config: component.config,
          groupLabel: component.groupLabel,
          sectionLabel: component.sectionLabel,
          componentLabel: component.componentLabel,
        })),
      }));

      // Call preview API
      await handlePreviewGroups(updatedComponents);
    },
    [selectedComponents, selectedRow]
  );

  const handleDragEnd = async (dragIndex: number, dropIndex: number) => {
    const newComponents = [...selectedComponents];
    const [removed] = newComponents.splice(dragIndex, 1);
    newComponents.splice(dropIndex, 0, removed);

    // Update selected components
    setSelectedComponents(newComponents);

    // Reorder groupIds based on the new order, maintaining all properties
    setTemplateFormValues((prev: any) => ({
      ...prev,
      groupIds: newComponents.map((component) => ({
        handle: component.handle,
        label: component.groupLabel || component.sectionLabel || component.componentLabel || component.label,
        ...(component.groupLabel && { groupLabel: component.groupLabel }),
        ...(component.sectionLabel && { sectionLabel: component.sectionLabel }),
        ...(component.componentLabel && { componentLabel: component.componentLabel }),
      })),
    }));

    // Call preview API after reordering
    await handlePreviewGroups(newComponents);
  };

  const handleOpenPreview = async () => {
    if (isPreviewMode) {
      setIsPreviewMode(false);
      return;
    }

    const groupIds = selectedComponents.map((group) => ({
      handle: group.handle,
      label: group.groupLabel || group.sectionLabel || group.componentLabel || group.label,
      config: group.config
    }));

    const payload = {
      site: "1004",
      groupIds: groupIds,
    };

    try {
      const previewResponse = await fetchTemplateBuilderData(
        payload,
        "templatebuilder-service",
        "preview"
      ) as any;

      if (!Array.isArray(previewResponse)) {
        throw new Error("Invalid preview response format");
      }

      // Transform the preview response to match the expected format
      const transformedData = previewResponse.map((item: any) => {
        // Case 1: Group with sections
        if (item._id?.startsWith('GroupBO:')) {
          return {
            _id: item._id,
            groupLabel: item.groupLabel,
            sectionLabel: item.groupLabel,
            instructions: item.instructions || "",
            style: {
              marginsEnabled: false,
              textAlignment: "left",
              tableAlignment: "left",
              splitColumns: 1
            },
            sectionIds: item.sectionIds?.map((section: any) => ({
              _id: section._id,
              sectionLabel: section.sectionLabel,
              style: section.style || {
                marginsEnabled: false,
                textAlignment: "left",
                tableAlignment: "left",
                splitColumns: 1
              },
              components: section.components?.map((comp: any) => ({
                ...comp,
                _id: comp._id,
                componentLabel: comp.componentLabel,
                dataType: comp.dataType,
                unit: comp.unit,
                defaultValue: comp.defaultValue || "",
                required: comp.required || false,
                validation: comp.validation,
                tableConfig: comp.tableConfig
              })) || []
            })) || [],
            components: item.sectionIds?.flatMap((section: any) =>
              section.components?.map((comp: any) => ({
                ...comp,
                _id: comp._id,
                componentLabel: comp.componentLabel,
                dataType: comp.dataType,
                unit: comp.unit,
                defaultValue: comp.defaultValue || "",
                required: comp.required || false,
                validation: comp.validation,
                tableConfig: comp.tableConfig
              })) || []
            ) || []
          };
        }
        // Case 2: Section with components
        else if (item._id?.startsWith('SectionBO:')) {
          return {
            _id: item._id,
            sectionLabel: item.sectionLabel,
            instructions: item.instructions || "",
            style: item.style || {
              marginsEnabled: false,
              textAlignment: "left",
              tableAlignment: "left",
              splitColumns: 1
            },
            components: item.components?.map((comp: any) => ({
              ...comp,
              _id: comp._id,
              componentLabel: comp.componentLabel,
              dataType: comp.dataType,
              unit: comp.unit || "",
              defaultValue: comp.defaultValue || "",
              required: comp.required || false,
              validation: comp.validation,
              tableConfig: comp.tableConfig
            })) || []
          };
        }
        // Case 3: Single component
        else if (item._id?.startsWith('ComponentBO:')) {
          return {
            _id: item._id,
            sectionLabel: item.componentLabel,
            instructions: item.instructions || "",
            style: {
              marginsEnabled: false,
              textAlignment: "left",
              tableAlignment: "left",
              splitColumns: 1
            },
            components: [{
              _id: item._id,
              componentLabel: item.componentLabel,
              dataType: item.dataType,
              unit: item.unit || "",
              defaultValue: item.defaultValue || "",
              required: item.required || false,
              validation: item.validation,
              tableConfig: item.tableConfig
            }]
          };
        }
        return null;
      }).filter(Boolean);

      console.log("Preview data:", transformedData);
      setPreviewContent(transformedData);
      setIsPreviewMode(true);
    } catch (error) {
      message.info('Please add at least one table row to preview')
      // message.error(
      //   `Something went wrong while previewing: ${error instanceof Error ? error.message : error}`
      // );
    }
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
          currentVersion: false,
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
            userId: cookies.rl_user_id,
            templateLabel: selectedTemplate.templateLabel,
            templateVersion: selectedTemplate.templateVersion,
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
              currentVersion: false,
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
      currentVersion: false,
    };

    // Reset original template state for new template
    setOriginalTemplateState({
      templateLabel: "",
      templateVersion: "",
      templateType: "",
      productGroup: "",
      currentVersion: false,
    });

    // Use the existing template click handler
    handleTemplateClick(newTemplate);
    setSelectedRow(null);
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
            border: "1px solid rgba(0, 0, 0, 0.16)",
            marginBottom: "8px",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "all 0.3s ease",
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
          onClick={() => handleTemplateClick(item)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <span><LuLayoutTemplate /></span>
              <span>{item.templateLabel}</span>
            </div>
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
          border: "1px solid rgba(0, 0, 0, 0.16)",
          marginBottom: "8px",
          borderRadius: "4px",
          cursor: "pointer",
          transition: "all 0.3s ease",
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
        onClick={() => handleAddGroup(item)}
      >
        <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", gap: "10px" }}>
          <span>
            {
              selectedBuilderType === "Group" ? <FaLayerGroup /> :
                selectedBuilderType === "Section" ? <CiBoxList /> :
                  <LuComponent />
            }
          </span>
          <span style={{ paddingBottom: "4px" }}>{itemLabel}</span>
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

    if (!templateFormValues.templateVersion) {
      message.error("Please fill all required fields - Template Version");
      return;
    }

    if (!templateFormValues.templateType) {
      message.error("Please fill all required fields - Template Type");
      return;
    }

    // Prepare payload with config data
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
        config: group.config || {
          type: "body",
          logo: "",
          pageOccurrence: "",
          margin: 0,
          height: 0,
          alignment: "left",
        }
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
        setSelectedBuilderType("Group");
        setIsPreviewMode(false);
        setTemplateFormValues({
          templateLabel: "",
          templateVersion: "",
          templateType: "",
          productGroup: "",
          currentVersion: false,
          groupIds: [],
        });
        setSelectedComponents([]);
        fetchData();
      } else {
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
            currentVersion: false,
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
        currentVersion: false,
        groupIds: [],
      });
      setSelectedComponents([]);
      setPreviewGroup([]);
      setSelectedBuilderType("Group");
      setPreviewGroup([]);
      setIsPreviewMode(false);
      setIsMainFormLoading(false);
      setMainFormLoadingMessage("");
      // Refresh the template list
      fetchData();
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
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_\-\(\)]/g, "");

    // Update form value
    form.setFieldsValue({ [key]: value });

    // Update template form values
    setTemplateFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
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
          "retrieveAll"
        ) as ItemGroupResponse :
        await fetchTemplateBuilderData(
          { site },
          "itemgroup-service",
          "retrieveTop50"
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
      const value = selectedRow.itemGroup;

      // Update form value
      form.setFieldsValue({ productGroup: value });

      // Update template form values
      setTemplateFormValues((prev) => ({
        ...prev,
        productGroup: value,
      }));
    }
    setItemGroupVisible(false);
  };

  const ItemGroupColumn = [
    { title: "Item Group", dataIndex: "itemGroup", key: "itemGroup" },
    { title: "Group Description", dataIndex: "groupDescription", key: "groupDescription" },
  ];

  console.log(selectedComponents, 'selectedComponents');


  // Add handlePreviewGroups function here
  const handlePreviewGroups = async (groups: any[]) => {
    if (groups.length === 0) {
      setPreviewGroup([]);
      return;
    }

    const groupIds = groups.map((group) => ({
      handle: group.handle,
      label: group.groupLabel || group.sectionLabel || group.componentLabel || group.label,
    }));

    const payload = {
      site: "1004",
      groupIds: groupIds,
    };

    try {
      const previewResponse = await fetchTemplateBuilderData(
        payload,
        "templatebuilder-service",
        "preview"
      ) as any[];

      if (!Array.isArray(previewResponse)) {
        setPreviewGroup([]);
        return;
      }

      // Transform the preview response to match the tree structure
      const transformedData = previewResponse.map((item: any) => {
        // Case 1: Group object
        if (item._id?.startsWith('GroupBO:')) {
          return {
            _id: item._id,
            groupLabel: item.groupLabel,
            sectionIds: item.sectionIds?.map((section: any) => ({
              _id: section._id,
              sectionLabel: section.sectionLabel,
              components: section.components?.map((comp: any) => ({
                _id: comp._id,
                componentLabel: comp.componentLabel,
                dataType: comp.dataType,
                unit: comp.unit,
                defaultValue: comp.defaultValue,
                required: comp.required,
                validation: comp.validation,
                tableConfig: comp.tableConfig
              }))
            })) || []
          };
        }
        // Case 2: Section object
        else if (item._id?.startsWith('SectionBO:')) {
          return {
            _id: item._id,
            sectionLabel: item.sectionLabel,
            components: item.components?.map((comp: any) => ({
              _id: comp._id,
              componentLabel: comp.componentLabel,
              dataType: comp.dataType,
              unit: comp.unit,
              defaultValue: comp.defaultValue,
              required: comp.required,
              validation: comp.validation,
              tableConfig: comp.tableConfig
            }))
          };
        }
        // Case 3: Component object
        else if (item._id?.startsWith('ComponentBO:')) {
          return {
            _id: item._id,
            componentLabel: item.componentLabel,
            dataType: item.dataType,
            unit: item.unit,
            defaultValue: item.defaultValue,
            required: item.required,
            validation: item.validation,
            tableConfig: item.tableConfig
          };
        }
        return null;
      }).filter(Boolean);

      setPreviewGroup(transformedData);
    } catch (error) {
      message.info('Please add at least one table row to preview')
      // message.error(
      //   `Something went wrong while previewing: ${error instanceof Error ? error.message : error
      //   }`
      // );
      setPreviewGroup([]);
    }
  };

  // Add handleRowClick function
  const handleRowClick = useCallback((record: GroupId) => {
    // Ensure the record has a config object with default values if not present
    const recordWithConfig = {
      ...record,
      config: record.config || {
        type: "body",
        logo: "",
        pageOccurrence: "all",
        margin: 10,
        height: 10,
        alignment: "center"
      }
    };

    setSelectedRow(recordWithConfig);
    setActiveTab("configure"); // Switch to configure tab when row is clicked
  }, []);

  // Add handleConfigChange function
  const handleConfigChange = (handle: string, config: any) => {
    setSelectedComponents((prevComponents) =>
      prevComponents.map((component) =>
        component.handle === handle
          ? { ...component, config }
          : component
      )
    );

    setTemplateFormValues((prev) => ({
      ...prev,
      groupIds: prev.groupIds.map((group) =>
        group.handle === handle
          ? { ...group, config }
          : group
      ),
    }));
  };

  // Add handler for PDF download
  const handlePdfDownload = async () => {
    if (previewRef.current) {
      await previewRef.current.exportToPdf();
    }
  };

  // Add helper functions for visibility
  const shouldShowFooter = selectedTemplate || isCreateMode;
  const shouldShowRightSection = selectedTemplate || isCreateMode;

  return (
    <>
      {/* Full-width header */}
      <div
        style={{
          zIndex: 10,
          fontWeight: 500,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "6%",
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
          <Breadcrumb>
            <Breadcrumb.Item>
              <div style={{ color: '#666', fontWeight: '400' }}>
                Template Builder
              </div>
            </Breadcrumb.Item>
            {selectedTemplate && (
              <Breadcrumb.Item>
                <div style={{ color: '#666', fontWeight: '500' }}>
                  {selectedTemplate.templateLabel}
                </div>
              </Breadcrumb.Item>
            )}
          </Breadcrumb>
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
              {
                isPreviewMode ? (
                  <>
                    <Tooltip title="Download Pdf">
                      <GoDownload
                        style={{
                          color: "#006768",
                          cursor: "pointer",
                          fontSize: "22px",
                        }}
                        onClick={handlePdfDownload} 
                        />
                    </Tooltip>
                    <Tooltip title="Un Preview Template Builder">
                      <EyeInvisibleOutlined
                        style={{
                          color: "#1890ff",
                          cursor: "pointer",
                          fontSize: "22px",
                        }}
                        onClick={handleOpenPreview}
                      />
                    </Tooltip>
                  </>
                ) : (
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
                )
              }
              {
                selectedTemplate.handle && (
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
                )
              }
              {
                selectedTemplate.handle && (
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
                )
              }

            </>
          )}
        </div>
      </div>

      {/* Adjust main content to account for fixed header */}
      <Row
        className={styles["template-builder-container"]}
        style={{
          height: "87%",
          position: "relative",
        }}
      >
        {/* Left Section - Available Templates */}
        <Col
          span={shouldShowRightSection ? 5 : 6}
          className={styles["left-section"]}
          style={{
            height: shouldShowFooter ? "calc(100vh - 195px)" : "calc(100vh - 145px)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
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
                padding: "10px 8px 15px 0",
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
                  ? `List of ${selectedBuilderType}`
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
                  placeholder={selectedTemplate ? `Search ${selectedBuilderType}...` : "Search Templates..."}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onSearch={handleSearch}
                  value={searchTerm}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Form>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                maxHeight: "calc(100vh - 250px)",
                paddingRight: "8px",
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

        <Col
          span={shouldShowRightSection ? 13 : 18}
          className={styles["main-section"]}
          style={{
            position: "relative",
            height: shouldShowFooter ? "calc(100vh - 195px)" : "calc(100vh - 145px)"
          }}
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

          {isPreviewMode ? (
            <div style={{ position: 'relative', padding: '20px', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              <TemplatePreview 
                ref={previewRef}
                templateId={previewContent} 
                selectedTemplate={selectedTemplate} 
              />
            </div>
          ) : (
            <div>
              {!selectedTemplate && !isCreateMode ? (
                <span
                  style={{
                    color: "#999",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "79vh",
                    width: "100%",
                    padding: "20px",
                    boxSizing: "border-box",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <Empty style={{ fontSize: '14px', color: '#888' }} description="Please select a template or create a new one from the list of templates" />
                    <Button type='default' icon={<PlusOutlined />} onClick={handleAddTemplate} style={{ marginTop: '10px' }}>
                      Create New Template
                    </Button>
                  </div>
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
                              setTemplateFormValues((prev) => ({
                                ...prev,
                                templateLabel: value,
                              }));
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="templateVersion"
                          label="Version"
                          rules={[{ required: true, message: 'Please enter template version' }]}
                        >
                          <Input
                            disabled={selectedTemplate?.handle ? true : false}
                            onChange={(e) => {
                              const value = e.target.value;
                              setTemplateFormValues((prev) => ({
                                ...prev,
                                templateVersion: value,
                              }));
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="templateType"
                          label="Template Type"
                          rules={[{ required: true, message: 'Please select template type' }]}
                        >
                          <Select
                            options={[
                              { value: "MFR", label: "MFR" },
                              { value: "BMR", label: "BMR" },
                              { value: "BPR", label: "BPR" },
                            ]}
                            placeholder="Select Template Type"
                            onChange={(value) => {
                              setTemplateFormValues((prev) => ({
                                ...prev,
                                templateType: value,
                              }));
                            }}
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
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_\-\(\)]/g, "");
                              setTemplateFormValues((prev) => ({
                                ...prev,
                                productGroup: value,
                              }));
                              handleInputChange(e, 'productGroup');
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="currentVersion"
                          label="Current Version"
                          valuePropName="checked"
                          getValueProps={(value: boolean) => ({
                            checked: value === true
                          })}
                        >
                          <Switch
                            onChange={(checked: boolean) => {
                              const booleanValue = checked ? true : false;

                              // Update form value
                              form.setFieldsValue({ currentVersion: booleanValue });

                              // Update template form values state
                              setTemplateFormValues((prev) => ({
                                ...prev,
                                currentVersion: booleanValue,
                              }));

                              // Update selected template if it exists
                              if (selectedTemplate) {
                                setSelectedTemplate((prev) =>
                                  prev ? {
                                    ...prev,
                                    currentVersion: booleanValue,
                                  }
                                    : null
                                );
                              }
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>

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
                        id: component.handle || `${Date.now()}-${component.label}`,
                      }))}
                      onDragEnd={handleDragEnd}
                      onRemoveComponent={handleRemoveComponent}
                      onClearComponents={handleClearGroups}
                      onRowClick={handleRowClick}
                      selectedRow={selectedRow}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </Col>

        {/* Right Section */}
        {shouldShowRightSection && (
          <Col
            span={6}
            className={styles["right-section"]}
            style={{
              height: shouldShowFooter ? "calc(100vh - 195px)" : "calc(100vh - 145px)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key)}
              items={[
                {
                  key: "structure",
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <VscSymbolStructure />
                      Template Structure
                    </span>
                  ),
                  children: (
                    <TemplateStructureTree
                      selectedGroups={previewGroup}
                    />
                  ),
                },
                {
                  key: "configure",
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SettingOutlined />
                      Configure
                    </span>
                  ),
                  children: (
                    <ConfigureTab
                      selectedRow={selectedRow}
                      onConfigChange={handleConfigChange}
                    />
                  ),
                },
              ]}
            />
          </Col>
        )}

        {shouldShowFooter && (
          <div
            style={{
              height: "7%",
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "0 16px",
              borderTop: "1px solid #f0f0f0",
              backgroundColor: "#fff",
              zIndex: 100,
            }}
          >
            <Button
              icon={selectedTemplate?.handle ? <SaveOutlined /> : <PlusOutlined />}
              onClick={handleSaveOrCreate}
              style={{ marginRight: "12px" }}
            >
              {selectedTemplate?.handle ? "Save" : "Create"}
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancelTemplate}
            >
              Cancel
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
