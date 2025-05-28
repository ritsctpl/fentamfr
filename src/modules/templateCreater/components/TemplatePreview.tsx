import React, { useEffect, useState } from "react";
import { getGroupPreview } from "@services/groupBuilderService";
import TablePreview from "./previewComponents/tablePreview";
import FormPreview from "./previewComponents/formPreview";

interface Component {
  _id: string;
  componentLabel: string;
  dataType: string;
  unit?: string;
  defaultValue?: string;
  required: boolean;
  validation?: string;
  tableConfig?: any;
}

interface Style {
  marginsEnabled: boolean;
  textAlignment: string;
  tableAlignment: string;
  splitColumns: number;
}

interface Section {
  _id: string;
  sectionLabel: string;
  instructions?: string;
  structureType?: string;
  style: Style;
  components: Component[];
}

interface Group {
  _id: string;
  groupLabel: string;
  sectionIds: Section[];
}

interface SectionConfig {
  type: 'header' | 'body' | 'footer';
  logo: string;
  pageOccurrence: 'all' | null;
  margin: number;
  height: number;
  alignment: string;
}

type PreviewItem = Group | Section | Component;

function TemplatePreview({ templateId, selectedTemplate }: { templateId: string | any[], selectedTemplate: any }) {
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);

  // Get section config from selectedTemplate.groupIds
  const getSectionConfig = (sectionId: string): SectionConfig | undefined => {
    if (!selectedTemplate?.groupIds) return undefined;
    
    const sectionConfig = selectedTemplate.groupIds.find(
      (group: any) => group.handle === sectionId
    )?.config;

    return sectionConfig;
  };

  useEffect(() => {
    // Case 1: If templateId is a string (ID), fetch data from API
    if (typeof templateId === 'string') {
      const fetchPreviewData = async () => {
        const response = await getGroupPreview({
          siteId: '1004',
          sectionsIds: templateId,
        });
        setPreviewData(response);
      };
      fetchPreviewData();
    } 
    // Case 2: If templateId is already an array (from preview mode), use it directly
    else if (Array.isArray(templateId)) {
      setPreviewData(templateId);
    }
  }, [templateId]);

  // Helper function to determine if an item is a Group
  const isGroup = (item: PreviewItem): item is Group => {
    return 'groupLabel' in item && Array.isArray((item as Group).sectionIds);
  };

  // Helper function to determine if an item is a Section
  const isSection = (item: PreviewItem): item is Section => {
    return 'sectionLabel' in item && Array.isArray((item as Section).components);
  };

  // Helper function to determine if an item is a Component
  const isComponent = (item: PreviewItem): item is Component => {
    return 'componentLabel' in item && !('components' in item) && !('sectionIds' in item);
  };

  // Helper function to determine section type based on components
  const determineSectionType = (components: Component[]): string => {
    // If any component has dataType "Table", treat it as unstructured
    const hasTableComponent = components.some(comp => comp.dataType === "Table");
    return hasTableComponent ? "unstructured" : "structured";
  };

  // Default style if not provided
  const defaultStyle: Style = {
    marginsEnabled: false,
    textAlignment: "left",
    tableAlignment: "left",
    splitColumns: 1
  };

  const renderPreviewItem = (item: PreviewItem) => {
    console.log('renderPreviewItem', item);
      // Case 1: Group with sections
    if (isGroup(item)) {
      console.log('case 1');
      return (
        <div key={item._id} style={{ width: "100%" }}>
          {item.sectionIds.map((section) => renderPreviewItem(section))}
        </div>
      );
    }
    
    // Case 2: Section with components
    else if (isSection(item)) {
      console.log('case 2');
      const sectionConfig = getSectionConfig(item._id);
      const effectiveStructureType = item.structureType || determineSectionType(item.components);
      
      // Create wrapper styles based on section config
      const wrapperStyle: React.CSSProperties = {
        width: "100%",
        marginBottom: "20px",
        ...(sectionConfig?.type === "header" && {
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 100,
          borderBottom: "1px solid #ddd"
        }),
        ...(sectionConfig?.type === "footer" && {
          position: "sticky",
          bottom: 0,
          backgroundColor: "white",
          zIndex: 100,
          // borderTop: "1px solid #ddd"
        }),
        ...(sectionConfig?.margin && {
          margin: `${sectionConfig.margin}px 0`
        }),
        ...(sectionConfig?.height && {
          minHeight: `${sectionConfig.height}px`
        }),
        ...(sectionConfig?.alignment && {
          textAlign: sectionConfig.alignment as any
        })
      };

      return (
        <div key={item._id} style={wrapperStyle}>
          {effectiveStructureType === "structured" ? (
            <FormPreview
              component={item.components}
              styleData={{
                ...item.style,
                textAlignment: sectionConfig?.alignment || item.style?.textAlignment,
                marginsEnabled: sectionConfig?.margin > 0 || item.style?.marginsEnabled
              }}
              title={item.sectionLabel}
              instruction={item.instructions}
            />
          ) : (
            <TablePreview
              component={item.components}
              title={item.sectionLabel}
              instruction={item.instructions}
            />
          )}
        </div>
      );
    }
    
    // Case 3: Single component (rare, but possible)
    else if (isComponent(item)) {
      console.log('case 3');
      return (
        <div key={item._id} style={{ width: "100%" }}>
          <FormPreview
            component={[item]}
            styleData={defaultStyle}
            title={""}
            instruction=""
          />
        </div>
      );
    }
    
    // Fallback for unknown types
    return null;
  };

  // Sort sections to ensure header appears first and footer appears last
  const sortedPreviewData = React.useMemo(() => {
    if (!Array.isArray(previewData)) return previewData;

    return [...previewData].sort((a: any, b: any) => {
      const aConfig = getSectionConfig(a._id);
      const bConfig = getSectionConfig(b._id);

      if (aConfig?.type === "header") return -1;
      if (bConfig?.type === "header") return 1;
      if (aConfig?.type === "footer") return 1;
      if (bConfig?.type === "footer") return -1;
      return 0;
    });
  }, [previewData]);

  return (
    <div
      style={{
        width: `calc(100vw * 0.412)`,
        margin: "0 auto",
        padding: "5mm",
        boxSizing: "border-box",
        backgroundColor: "white",
        // boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "2rem",
        overflowY: "auto",
        position: "relative", // For sticky header/footer
        minHeight: "100%"
      }}
    >
      {sortedPreviewData.map((item) => renderPreviewItem(item))}
    </div>
  );
}

export default TemplatePreview;
