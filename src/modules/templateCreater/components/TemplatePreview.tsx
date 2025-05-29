import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { getGroupPreview } from "@services/groupBuilderService";
import TablePreview from "./previewComponents/tablePreview";
import FormPreview from "./previewComponents/formPreview";
import { Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
  pageOccurrence: string;
  margin: number;
  height: number;
  alignment: string;
}

type PreviewItem = Group | Section | Component;

// Page dimensions for A4 paper in pixels (96 DPI)
const PAGE_WIDTH = 794; // ~8.3 inches
const PAGE_HEIGHT = 1123; // ~11.7 inches
const PAGE_MARGIN = 40;

// Add export interface for ref
export interface TemplatePreviewRef {
  exportToPdf: () => Promise<void>;
}

// Modify component to use forwardRef
const TemplatePreview = forwardRef<TemplatePreviewRef, { templateId: string | any[], selectedTemplate: any }>(
  ({ templateId, selectedTemplate }, ref) => {
    const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
    const [headerSection, setHeaderSection] = useState<Section | null>(null);
    const [footerSection, setFooterSection] = useState<Section | null>(null);
    const [bodySections, setBodySections] = useState<Section[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    const containerRef = React.useRef<HTMLDivElement>(null);

    console.log('selectedTemplate', selectedTemplate);

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

    // Sort and categorize sections based on their type (header, body, footer)
    useEffect(() => {
      if (!Array.isArray(previewData)) return;

      let header: Section | null = null;
      let footer: Section | null = null;
      let body: Section[] = [];

      previewData.forEach((item: any) => {
        if (isSection(item)) {
          const config = getSectionConfig(item._id);
          if (config?.type === 'header') {
            header = item;
          } else if (config?.type === 'footer') {
            footer = item;
          } else {
            body.push(item);
          }
        } else if (isGroup(item)) {
          // For groups, process each section
          item.sectionIds.forEach((section) => {
            const config = getSectionConfig(section._id);
            if (config?.type === 'header') {
              header = section;
            } else if (config?.type === 'footer') {
              footer = section;
            } else {
              body.push(section);
            }
          });
        }
      });

      setHeaderSection(header);
      setFooterSection(footer);
      setBodySections(body);

      // Calculate total pages based on content
      if (body.length > 0) {
        // Estimate based on typical content size
        setTotalPages(Math.max(1, Math.ceil(body.length / 1.5)));
      }
    }, [previewData]);

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

    // Render the header table on each page
    const renderHeaderContent = () => {
      if (headerSection) {
        return renderSection(headerSection, true);
      }
      
      // Fallback if no header section is defined
      return (
        <div style={{ width: '100%', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
            {selectedTemplate?.templateLabel || "MASTER FORMULA RECORD"}
          </div>
        </div>
      );
    };

    // Render the footer content on each page
    const renderFooterContent = () => {
      if (footerSection) {
        return renderSection(footerSection, true);
      }
      
      // Fallback if no footer section is defined
      return (
        <div style={{ width: '100%', marginTop: '15px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
            <span>Generated by {selectedTemplate?.userId || "System"}</span>
            <span>Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      );
    };

    const renderSection = (section: Section, isFixed: boolean = false) => {
      if (!section) return null;
      
      const sectionConfig = getSectionConfig(section._id);
      const effectiveStructureType = section.structureType || determineSectionType(section.components);
      
      const wrapperStyle: React.CSSProperties = {
        width: "100%",
        marginBottom: "15px",
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

      // Use the section's title as a heading
      return (
        <div key={section._id} style={wrapperStyle}>
          {section.sectionLabel && (
            <div style={{ 
              fontWeight: 'bold', 
              textAlign: 'center', 
              margin: '15px 0',
              fontSize: '14px'
            }}>
              {section.sectionLabel}
            </div>
          )}
          {effectiveStructureType === "structured" ? (
            <FormPreview
              component={section.components}
              styleData={{
                ...section.style,
                textAlignment: sectionConfig?.alignment || section.style?.textAlignment,
                marginsEnabled: sectionConfig?.margin > 0 || section.style?.marginsEnabled
              }}
              title=""
              instruction={section.instructions}
            />
          ) : (
            <TablePreview
              component={section.components}
              title=""
              instruction={section.instructions}
            />
          )}
        </div>
      );
    };

    // Function to export the preview as PDF
    const exportToPdf = async () => {
      if (!containerRef.current) return;
      
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pages = containerRef.current.querySelectorAll('.preview-page');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        const canvas = await html2canvas(page, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(
          imgData, 
          'PNG', 
          0, 
          0, 
          pdf.internal.pageSize.getWidth(), 
          pdf.internal.pageSize.getHeight(), 
          undefined, 
          'FAST'
        );
      }
      
      pdf.save(`${selectedTemplate?.templateLabel || 'template'}_preview.pdf`);
    };

    // Create an array of pages
    const pages = Array.from({ length: totalPages }, (_, i) => i);

    // Distribute body sections across pages
    const getBodySectionsForPage = (pageIndex: number) => {
      const sectionsPerPage = Math.ceil(bodySections.length / totalPages);
      const startIndex = pageIndex * sectionsPerPage;
      return bodySections.slice(startIndex, startIndex + sectionsPerPage);
    };

    // Get the page title (first section on the page)
    const getPageTitle = (pageIndex: number) => {
      const sections = getBodySectionsForPage(pageIndex);
      if (sections.length > 0) {
        return sections[0].sectionLabel || "";
      }
      return "";
    };

    // Expose exportToPdf through ref
    useImperativeHandle(ref, () => ({
      exportToPdf
    }));

    return (
      <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
        {/* <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 1000 }}>
          <Button 
            icon={<FilePdfOutlined />} 
            onClick={exportToPdf}
          >
            Export as PDF
          </Button>
        </div> */}
        
        {pages.map((pageIndex) => (
          <div 
            key={`page-${pageIndex}`} 
            className="preview-page"
            style={{
              width: `${PAGE_WIDTH}px`,
              minHeight: `${PAGE_HEIGHT}px`,
              margin: '0 auto 20px auto',
              padding: `${PAGE_MARGIN}px`,
              boxSizing: 'border-box',
              backgroundColor: 'white',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              pageBreakAfter: 'always',
              pageBreakBefore: pageIndex === 0 ? 'avoid' : 'always',
              breakInside: 'avoid',
              fontFamily: 'Arial, sans-serif',
              fontSize: '12px'
            }}
          >
            {/* Page number in top right corner */}
            <div 
              style={{ 
                position: 'absolute', 
                top: 10, 
                right: PAGE_MARGIN,
                fontSize: '11px',
                color: '#000'
              }}
            >
              Page {pageIndex + 1} of {totalPages}
            </div>
            
            {/* Header - Same on every page */}
            <div 
              style={{ 
                width: '100%',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}>
              {renderHeaderContent()}
            </div>
            
            {/* Body Content - Different for each page */}
            <div 
              style={{ 
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '60%',
                pageBreakInside: 'auto',
                breakInside: 'auto'
              }}
            >
              {getBodySectionsForPage(pageIndex).map((section) => renderSection(section))}
            </div>
            
            {/* Footer - Same on every page */}
            <div style={{ 
              width: '100%', 
              marginTop: 'auto',
              pageBreakInside: 'avoid',
              breakInside: 'avoid'
            }}>
              {renderFooterContent()}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

export default TemplatePreview;
