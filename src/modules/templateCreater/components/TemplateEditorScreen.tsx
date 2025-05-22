import React, { useState, useEffect, useRef, useContext } from 'react';
import type { MenuProps } from 'antd';
import styles from '@modules/templateCreater/styles/templateBuilder.module.css';
import LeftPanel from './LeftPanel';
import EditorTable from './EditorTable';
import { message, Input, Button, Modal, Dropdown, Form, Tooltip, Table as AntTable, Select } from 'antd';
import TemplateTreeView from './TemplateTreeView';
import { DownloadOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Document, Packer, Paragraph, Table, TableCell, TableRow as DocxTableRow, TextRun, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { FormInstance } from 'antd/lib';
import { createTemplate, deleteTemplate, getTemplatePreview, updateTemplate } from '@services/templateService';
import { parseCookies } from 'nookies';
import { TemplateBuilderContext } from '../hooks/TemplateBuilderContext';
import CopyIcon from '@mui/icons-material/FileCopy';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

interface TemplateEditorScreenProps {
  data?: any;
  onClose?: () => void;
  isNewTemplate?: boolean;
  rowData?: any;
}

interface TableRow {
  id: number;
  section: string;
  type: string;
  heading: string;
  handle?: string; // Add handle property to store the API handle
  componentIds?: any[]; // For sections
  sectionIds?: any[]; // For groups
}

const TemplateEditorScreen: React.FC<TemplateEditorScreenProps> = ({ data, onClose, rowData: initialRowData, isNewTemplate = false }) => {
  const context = useContext(TemplateBuilderContext);
  const { t } = useTranslation()
  if (!context) return null;
  const { call, setCall, setShowEditor, setIsFromTableClick } = context;
  const [editorTableRows, setEditorTableRows] = useState<TableRow[]>([]);
  const [jsonView, setJsonView] = useState<any>({ template: {} });
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TableRow | undefined>(undefined);
  const [rowData, setRowData] = useState<any>(initialRowData);
  const formRef = useRef<FormInstance>(null);
  const [selectedTypeData, setSelectedTypeData] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [templateStyles, setTemplateStyles] = useState<any>(null);

  console.log(editorTableRows, 'editorTableRows');

  // Initialize based on whether we're creating a new template or editing an existing one
  useEffect(() => {
    // Initialize rowData from props if provided
    if (initialRowData) {
      setRowData(initialRowData);
    }
  }, [initialRowData]);

  // Update editorTableRows based on rowData changes
  useEffect(() => {
    setEditorTableRows([]);
    setJsonView({ template: {} });
    
    if (!isNewTemplate && rowData) {
      // If we have rowData with groupIds from retrieved template, map it to editorTableRows
      if (rowData.groupIds && Array.isArray(rowData.groupIds)) {
        const parsedRows = rowData.groupIds.map((item: any) => {
          // Extract type from handle (e.g., "ComponentBO:", "GroupBO:", "SectionBO:")
          let type = 'Component'; // Default
          if (item.handle.includes('ComponentBO:')) {
            type = 'Component';
          } else if (item.handle.includes('GroupBO:')) {
            type = 'Group';
          } else if (item.handle.includes('SectionBO:')) {
            type = 'Section';
          }
          
          return {
            id: Date.now() + Math.random(), // Generate unique ID
            section: item.label,
            type: type, 
            heading: item.label,
            handle: item.handle
          };
        });
        
        setEditorTableRows(parsedRows);
        updateJsonView(parsedRows);
      } else if (Array.isArray(data)) {
        setEditorTableRows(data);
        updateJsonView(data);
      } else if (typeof data === 'object' && data !== null) {
        setEditorTableRows([data]);
        updateJsonView([data]);
      }
    }
  }, [data, isNewTemplate, rowData]);

  // Update JSON view based on table rows
  const updateJsonView = (rows: TableRow[]) => {
    const template: any = { template: {} };

    // Create sections based on row data
    rows.forEach((row, index) => {
      if (row.type === "Group") {
        template.template[`group${index}`] = {
          id: row.id,
          section: row.section,
          heading: row.heading,
          type: "Group",
          sectionIds: selectedTypeData && selectedTypeData.type === "Group" && row.section === selectedTypeData.groupLabel
            ? selectedTypeData.sectionIds || []
            : []
        };
      } else if (row.type === "Section") {
        template.template[`section${index}`] = {
          id: row.id,
          section: row.section,
          heading: row.heading,
          type: "Section",
          componentIds: selectedTypeData && selectedTypeData.type === "Section" && row.section === selectedTypeData.sectionLabel
            ? selectedTypeData.componentIds || {}
            : {}
        };
      } else if (row.type === "Component") {
        template.template[`component${index}`] = {
          id: row.id,
          section: row.section,
          heading: row.heading,
          type: "Component",
          ...(selectedTypeData && selectedTypeData.type === "Component" && row.section === selectedTypeData.componentLabel
            ? { componentData: selectedTypeData.componentData || {} }
            : {})
        };
      }
    });

    setJsonView(template);
  };

  // Handle row selection from the editor table
  const handleEditorTableRowClick = (row: TableRow) => {
    setSelectedRow(row);
  };

  // Handle row selection from the main table (to load a template)
  // const handleRowSelect = async (row: any) => {
  //   const cookies = parseCookies();
  //   const site = cookies.site;
  //   const userId = cookies.rl_user_id;

  //   const payload = {
  //     site: site,
  //     userId: userId,
  //     templateLabel: row.templateLabel,
  //     templateVersion: row.templateVersion,
  //     currentVersion: row.currentVersion,
  //   }

  //   try {
  //     const response = await retrieveTemplates(payload);
      
  //     // We don't need to map the response here anymore as useEffect will handle it
  //     setIsFromTableClick(true);
  //     setShowEditor(true);
  //     setRowData(response); // This will trigger the useEffect above
  //   } catch (error) {
  //     console.error('Error fetching templates:', error);
  //   }
  // };

  // Add a row to the table (now called from the save button in LeftPanel)
  const handleAddRow = (type: string, heading: string, apiData: any = null) => {
    // Check if we're editing an existing row
    if (selectedRow) {
      // Update the existing row
      const updatedRows = editorTableRows.map(row =>
        row.id === selectedRow.id
          ? { 
              ...row, 
              type, 
              section: heading, 
              heading,
              handle: apiData?.handle || row.handle,
              componentIds: apiData?.componentIds || row.componentIds,
              sectionIds: apiData?.sectionIds || row.sectionIds
            }
          : row
      );

      setEditorTableRows(updatedRows);
      updateJsonView(updatedRows);
      message.destroy();
      message.success("Row updated successfully");
      setSelectedRow(undefined);
    } else {
      // Create a new row with API data
      const newRow = {
        id: Date.now(),
        section: heading || type,
        type: type,
        heading: heading,
        handle: apiData?.handle || '',
        componentIds: apiData?.componentIds || [],
        sectionIds: apiData?.sectionIds || [],
        component: type === 'Section' ? {} : type === 'Group' ? {
          sections: []
        } : {}
      };

      const updatedRows = [...editorTableRows, newRow];
      setEditorTableRows(updatedRows);
      updateJsonView(updatedRows);
      message.destroy();
      message.success("New row added successfully");
    }
  };

  // Move a row up or down
  const handleRowMove = (fromIndex: number, toIndex: number) => {
    const updatedRows = [...editorTableRows];
    const [movedRow] = updatedRows.splice(fromIndex, 1);
    updatedRows.splice(toIndex, 0, movedRow);

    setEditorTableRows(updatedRows);
    updateJsonView(updatedRows);
  };

  // Delete a row
  const handleDeleteRow = (rowId: number) => {
    if (selectedRow && selectedRow.id === rowId) {
      setSelectedRow(undefined);
    }

    const updatedRows = editorTableRows.filter(row => row.id !== rowId);
    setEditorTableRows(updatedRows);
    updateJsonView(updatedRows);
    message.destroy();
    message.info("Row deleted");
  };

  // Delete all rows
  const handleDeleteAll = () => {
    setEditorTableRows([]);
    setJsonView({ template: {} });
    setPreviewMode(false);
    setSelectedRow(undefined);
    message.destroy();
    message.info("All rows deleted");
  };

  // Handle cancel button click
  const handleCancel = () => {
    setShowEditor(false);
    setIsFromTableClick(false);
    setCall(call + 1);
  };

  // Handle save template (for the main Save button, not the Left Panel one)
  const handleSaveTemplate = () => {
    const cookies = parseCookies();
    const site = cookies.site;
    const userId = cookies.rl_user_id;
    
    // Create an array of objects with proper format for API
    const groupIdsPayload = editorTableRows.map(row => {
      // Determine the prefix based on type
      const prefix = row.type === 'Component' ? 'ComponentBO:' : 
                    row.type === 'Group' ? 'GroupBO:' : 
                    row.type === 'Section' ? 'SectionBO:' : '';
      
      // Use existing handle if available, otherwise create new one
      const handle = row.handle || `${prefix}${site},${row.heading}`;
      
      return {
        handle: handle,
        label: row.heading || row.section
      };
    });
    
    const payload = {
      site,
      userId,
      templateLabel: rowData?.templateLabel || '',
      templateType: rowData?.templateType || '',
      templateVersion: rowData?.templateVersion || '',
      currentVersion: rowData?.currentVersion || '',
      productGroup: rowData?.productGroup || null,
      groupIds: groupIdsPayload,
    }

    console.log(payload, 'Template Payload');
    
    // Call API to save template with the updated payload
    const saveTemplate = async () => {
      try {
        const response = await updateTemplate(payload);
        if (response.message_details) {
          message.destroy();
          message.success(response.message_details.msg)
          setShowEditor(false);
          setIsFromTableClick(false);
          setCall(call + 1);
        } else {
          message.destroy();
          message.error(response?.message || 'Failed to save template');
        }
      } catch (error) {
        console.error('Error saving template:', error);
        message.destroy();
        message.error('An error occurred while saving the template');
      }
    };
    
    saveTemplate();
  };

  // Left panel save just adds/updates a row but doesn't navigate back
  const handleLeftPanelSave = () => {
    setSelectedRow(undefined);
  };

  // Create a component renderer function that displays components based on their dataType
  const renderComponent = (component: any) => {
    if (!component) return null;
    
    const dataType = component.dataType;
    
    switch (dataType) {
      case 'Input':
        return (
          <div key={component._id} className={styles.previewInputComponent}>
            <div className={styles.componentLabel}>{component.componentLabel}</div>
            <Input 
              placeholder={component.defaultValue || 'Enter value'}
              addonAfter={component.unit} 
              required={component.required}
              style={{ marginBottom: '10px', width: '100%' }}
            />
          </div>
        );
      case 'Table':
        // Get table configuration from the component
        const tableConfig = component.tableConfig || {};
        const columnNames = tableConfig.columnNames || [];
        const rowData = tableConfig.rowData || [];
        
        // Generate columns from the columnNames array
        const columns = columnNames.map((col: any) => ({
          title: col.title,
          dataIndex: col.dataIndex,
          key: col.dataIndex,
          render: (text: string, record: any) => {
            // Render based on the column type
            switch (col.type) {
              case 'Input':
                return <Input placeholder={text || ''} size="small" defaultValue={text} />;
              case 'Select':
                return <Select style={{ width: '100%' }} size="small" placeholder={text || ''} />;
              case 'Number':
                return <Input type="number" placeholder={text || '0'} size="small" defaultValue={text} />;
              default:
                return text;
            }
          }
        }));
        
        // Create a consistent data source with keys for the table
        const dataSource = rowData.map((row: any, index: number) => ({
          key: index.toString(),
          ...row
        }));
        
        return (
          <div key={component._id} className={styles.previewTableComponent}>
            {/* <div className={styles.componentLabel}>{component.componentLabel}</div> */}
            <div className={styles.tableContainer}>
              <AntTable
                bordered
                size="small"
                pagination={false}
                columns={columns}
                dataSource={dataSource}
              />
              {component.unit && <div className={styles.tableUnit}>{component.unit}</div>}
            </div>
          </div>
        );
      // case 'Reference Table':
      //   return (
      //     <div key={component._id} className={styles.previewTableComponent}>
      //       <div className={styles.componentLabel}>{component.componentLabel}</div>
      //       <div className={styles.tableContainer}>
      //         <AntTable
      //           bordered
      //           size="small"
      //           pagination={false}
      //           columns={component.columns || [
      //             { title: 'Reference', dataIndex: 'reference', key: 'reference' },
      //             { title: 'Value', dataIndex: 'value', key: 'value' },
      //           ]}
      //           dataSource={component.data || [
      //             { key: '1', reference: 'Ref 1', value: '' },
      //             { key: '2', reference: 'Ref 2', value: '' },
      //           ]}
      //         />
      //       </div>
      //     </div>
      //   );
      default:
        return (
          <div key={component._id} className={styles.previewComponent}>
            <div className={styles.componentLabel}>{component.componentLabel}</div>
            <div className={styles.componentValue}>
              <Input placeholder="Component value" />
            </div>
          </div>
        );
    }
  };

  const convertHtmlToDocxContent = (element: Element): any[] => {
    const children = Array.from(element.children);
    const content: any[] = [];

    children.forEach(child => {
      switch (child.tagName.toLowerCase()) {
        case 'h1':
          content.push(new Paragraph({
            text: child.textContent || '',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 }
          }));
          break;
        case 'h2':
          content.push(new Paragraph({
            text: child.textContent || '',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }));
          break;
        case 'p':
          content.push(new Paragraph({
            text: child.textContent || '',
            spacing: { before: 100, after: 100 }
          }));
          break;
        case 'table':
          const rows = Array.from(child.querySelectorAll('tr'));
          const tableRows = rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            return new DocxTableRow({
              children: cells.map(cell => new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({
                    text: cell.textContent || '',
                    bold: cell.tagName.toLowerCase() === 'th'
                  })]
                })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 }
                }
              }))
            });
          });
          content.push(new Table({ rows: tableRows }));
          break;
        case 'ol':
        case 'ul':
          const items = Array.from(child.querySelectorAll('li'));
          items.forEach((item, index) => {
            content.push(new Paragraph({
              text: `${child.tagName === 'OL' ? `${index + 1}.` : '•'} ${item.textContent}`,
              spacing: { before: 100, after: 100 },
              indent: { left: 720 } // 0.5 inch indent
            }));
          });
          break;
        default:
          if (child.children.length > 0) {
            content.push(...convertHtmlToDocxContent(child));
          } else if (child.textContent?.trim()) {
            content.push(new Paragraph({ text: child.textContent }));
          }
      }
    });

    return content;
  };

  const handleDownloadDOCX = async () => {
    try {
      const content = document.querySelector('.preview-content');
      if (!content) {
        message.error('Content not found');
        return;
      }

      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: convertHtmlToDocxContent(content)
        }]
      });

      // Generate and save document
      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `template-${Date.now()}.docx`);
      message.success('DOCX downloaded successfully');

    } catch (error) {
      console.error('Error generating DOCX:', error);
      message.error('Failed to generate DOCX');
    }
  };

  const handleDownloadPDF = async () => {
    const content = document.querySelector('.preview-content');
    if (!content) {
      message.error('Content not found');
      return;
    }
    // Dynamically import html2pdf.js only on client
    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin: 0.5,
      filename: `template-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    html2pdf().set(opt).from(content).save()
      .then(() => message.success('PDF downloaded successfully'))
      .catch((error: any) => {
        console.error('Error generating PDF:', error);
        message.error('Failed to generate PDF');
      });
  };

  const items: MenuProps['items'] = [
    {
      key: 'pdf',
      label: 'Download as PDF',
      onClick: handleDownloadPDF,
    },
    // {
    //   key: 'docx',
    //   label: 'Download as DOCX',
    //   onClick: handleDownloadDOCX,
    // },
  ];

  // Handle preview button click
  const handlePreviewClick = async () => {
    setIsPreviewLoading(true);
    
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;
      
      // Create payload from current template data and rows
      const previewPayload = {
        site: site,
        // userId: userId,
        // templateLabel: rowData?.templateLabel || '',
        // templateVersion: rowData?.templateVersion || '',
        // templateType: rowData?.templateType || '',
        // currentVersion: rowData?.currentVersion || false,
        groupIds: editorTableRows.map(row => ({
          handle: row.handle || '',
          label: row.heading || row.section
        }))
      };
      
      // Call the preview API
      const response = await getTemplatePreview(previewPayload);
      setPreviewData(response);
      
      // Set preview mode to true after data is loaded
      setPreviewMode(true);
    } catch (error) {
      console.error('Error fetching preview data:', error);
      message.destroy();
      message.error('Failed to load template preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Preview component that properly renders hierarchical structure
  const PreviewContent = () => {
    if (isPreviewLoading) {
      return <div className={styles.previewLoading}>Loading preview...</div>;
    }

    if (previewData) {
      // Process template structure while preserving hierarchy
      const processedComponents: any[] = [];

      if (Array.isArray(previewData)) {
        // Process groups first (they contain sections)
        const groups = previewData.filter(item => item._id && item._id.includes('GroupBO:'));
        groups.forEach(group => {
          const groupContainer = document.createElement('div');
          groupContainer.className = styles.previewGroupContainer;
          
          // Process sections in this group
          if (group.sectionIds && Array.isArray(group.sectionIds)) {
            group.sectionIds.forEach(section => {
              const sectionContainer = document.createElement('div');
              sectionContainer.className = styles.previewSectionContainer;
              
              // Add components in this section
              if (section.components && Array.isArray(section.components)) {
                section.components.forEach(component => {
                  processedComponents.push({
                    ...component,
                    _groupId: group._id,
                    _groupLabel: group.groupLabel,
                    _sectionId: section._id,
                    _sectionLabel: section.sectionLabel
                  });
                });
              }
            });
          }
        });
        
        // Process standalone sections
        const sections = previewData.filter(item => 
          (item._id && item._id.includes('SectionBO:')) || item.sectionLabel);
        sections.forEach(section => {
          if (section.components && Array.isArray(section.components)) {
            section.components.forEach(component => {
              // Only add if not already added as part of a group
              const alreadyProcessed = processedComponents.some(pc => 
                pc._id === component._id && pc._sectionId === section._id);
              
              if (!alreadyProcessed) {
                processedComponents.push({
                  ...component,
                  _sectionId: section._id,
                  _sectionLabel: section.sectionLabel
                });
              }
            });
          }
        });
        
        // Add standalone components
        const components = previewData.filter(item => 
          item._id && item._id.includes('ComponentBO:') && item.dataType);
        components.forEach(component => {
          // Only add if not already added as part of a section or group
          const alreadyProcessed = processedComponents.some(pc => pc._id === component._id);
          if (!alreadyProcessed) {
            processedComponents.push(component);
          }
        });
      }

      return (
        <div className={styles.previewWrapper}>
          <div className={styles.previewHeader}>
            <h2 className={styles.previewTitle}>Template Preview</h2>
            <div>
              <EyeInvisibleOutlined onClick={() => {
                setPreviewMode(false);
                setPreviewData(null);
              }} style={{ margin: '0 16px 0 8px', cursor: 'pointer' }} />
              <Dropdown menu={{ items }} placement="bottomRight">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  aria-label="Download"
                  style={{ fontSize: 18 }}
                />
              </Dropdown>
            </div>
          </div>
          <div className={`preview-content ${styles.previewContainer}`}>
            {processedComponents.length > 0 ? (
              <div className={styles.previewComponents}>
                {processedComponents.map(component => renderComponent(component))}
              </div>
            ) : (
              <div className={styles.emptyPreview}>No preview data available</div>
            )}
          </div>
        </div>
      );
    }

    // Fallback to simple component list if no API data
    if (editorTableRows.length === 0) {
      return <div className={styles.emptyPreview}>No components to preview. Add sections to see the preview.</div>;
    }

    // Simplified fallback display of components
    return (
      <div className={styles.previewWrapper}>
        <div className={styles.previewHeader}>
          <h2 className={styles.previewTitle}>Template Preview</h2>
          <div>
            <EyeInvisibleOutlined onClick={() => setPreviewMode(false)} style={{ margin: '0 16px 0 8px', cursor: 'pointer' }} />
            <Dropdown menu={{ items }} placement="bottomRight">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                aria-label="Download"
                style={{ fontSize: 18 }}
              />
            </Dropdown>
          </div>
        </div>
        <div className={`preview-content ${styles.previewContainer}`}>
          {editorTableRows.map(row => (
            <div key={row.id} className={styles.previewComponent}>
              <div className={styles.componentLabel}>{row.heading || row.section}</div>
              <div className={styles.componentValue}>
                <Input placeholder="Component value" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleDeleteTemplate = async () => {
    Modal.confirm({
      title: 'Delete Template',
      content: 'Are you sure you want to delete this template?',
      okText: 'Delete',
      cancelText: 'Cancel',
      onOk: async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;

        try {
          const payload = {
            site,
            userId,
            templateLabel: rowData?.templateLabel,
            templateVersion: rowData?.templateVersion
          };
          const response = await deleteTemplate(payload);
          if (response.message_details) {
            message.destroy();
            message.success(response.message_details.msg);
            setShowEditor(false);
            setIsFromTableClick(false);
            setCall(call + 1);
          } else {
            message.destroy();
            console.error('Failed to delete template:', response.error);
            message.error('Failed to delete template');
          }
        } catch (error) {
          console.error('Error deleting template:', error);
          message.destroy();
          message.error('Error deleting template');
        }
      },
    });
  };

  const handleCopyTemplate = () => {
    const initialTemplateName = (rowData && rowData.templateLabel ? rowData.templateLabel : 'Template') + '_copy';
    const initialTemplateVersion = (rowData && rowData.templateVersion ? rowData.templateVersion : 'A');
    let modalInstance: any = null;
    const handleFinish = async (values: any) => {
      try {
        // Create a clean copy of the rowData without reference
        const templateCopy = { ...rowData };
        // Update with new values
        templateCopy.templateLabel = values.templateLabel;
        templateCopy.templateVersion = values.templateVersion;
        
        // Ensure the groupIds are properly preserved
        if (templateCopy.groupIds && Array.isArray(templateCopy.groupIds)) {
          templateCopy.groupIds = [...templateCopy.groupIds];
        }
        
        const response = await createTemplate(templateCopy);
        if (response.message_details) {
          message.destroy();
          message.success(response.message_details.msg);
          setShowEditor(false);
          setIsFromTableClick(false);
          setCall(call + 1);
          if (modalInstance) modalInstance.destroy();
        } else {
          message.destroy();
          message.error('Failed to copy template');
        }
      } catch (error) {
        console.error('Error copying template:', error);
        message.destroy();
        message.error('Failed to copy template');
      }
    };
    let formInstance: any = null;
    modalInstance = Modal.confirm({
      title: 'Copy Template',
      icon: null,
      content: (
        <Form
          layout="vertical"
          ref={ref => { formInstance = ref; }}
          initialValues={{ templateLabel: initialTemplateName, templateVersion: initialTemplateVersion }}
          onFinish={handleFinish}
        >
          <Form.Item
            name="templateLabel"
            label="Template Label"
            rules={[{ required: true, message: 'Please enter template Label' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="templateVersion"
            label="Template Version"
          >
            <Input />
          </Form.Item>
        </Form>
      ),
      okText: 'Copy Template',
      cancelText: 'Cancel',
      onOk() {
        if (formInstance) {
          formInstance.submit();
        }
      },
      onCancel() {
        if (formInstance) {
          formInstance.resetFields();
        }
      },
    });
  };

  // Apply template styles to preview
  useEffect(() => {
    if (templateStyles) {
      // Create CSS variables for the styles
      const root = document.documentElement;
      
      // Font styles
      root.style.setProperty('--template-title-font', templateStyles.fonts.titleFont);
      root.style.setProperty('--template-body-font', templateStyles.fonts.bodyFont);
      root.style.setProperty('--template-title-size', `${templateStyles.fonts.titleSize}px`);
      root.style.setProperty('--template-body-size', `${templateStyles.fonts.bodySize}px`);
      root.style.setProperty('--template-title-color', templateStyles.fonts.titleColor);
      root.style.setProperty('--template-body-color', templateStyles.fonts.bodyColor);
      
      // Layout styles
      root.style.setProperty('--template-page-width', templateStyles.layout.pageWidth);
      root.style.setProperty('--template-page-margin', templateStyles.layout.pageMargin);
      root.style.setProperty('--template-column-gap', templateStyles.layout.columnGap);
      
      // Color styles
      root.style.setProperty('--template-primary-color', templateStyles.colors.primary);
      root.style.setProperty('--template-secondary-color', templateStyles.colors.secondary);
      root.style.setProperty('--template-accent-color', templateStyles.colors.accent);
      
      // Add styling classes to preview elements based on component styles
      const previewContainer = document.querySelector(`.${styles.previewContainer}`);
      if (previewContainer) {
        previewContainer.classList.add(styles.templateStyled);
        
        // Apply column layout
        previewContainer.classList.remove(styles.singleColumn, styles.twoColumns, styles.threeColumns);
        if (templateStyles.layout.columns === 1) {
          previewContainer.classList.add(styles.singleColumn);
        } else if (templateStyles.layout.columns === 2) {
          previewContainer.classList.add(styles.twoColumns);
        } else if (templateStyles.layout.columns === 3) {
          previewContainer.classList.add(styles.threeColumns);
        }
        
        // Apply table styles
        const tables = previewContainer.querySelectorAll('table');
        tables.forEach(table => {
          table.classList.add(styles.styledTable);
          if (templateStyles.components.tableBorder) {
            table.classList.add(styles.hasBorders);
          } else {
            table.classList.remove(styles.hasBorders);
          }
          if (templateStyles.components.tableStripes) {
            table.classList.add(styles.hasStripes);
          } else {
            table.classList.remove(styles.hasStripes);
          }
        });
        
        // Apply input styles
        const inputs = previewContainer.querySelectorAll('input');
        inputs.forEach(input => {
          input.classList.add(styles.styledInput);
          if (templateStyles.components.inputBorder) {
            input.classList.add(styles.hasBorders);
          } else {
            input.classList.remove(styles.hasBorders);
          }
          if (templateStyles.components.roundedCorners) {
            input.classList.add(styles.hasRoundedCorners);
          } else {
            input.classList.remove(styles.hasRoundedCorners);
          }
        });
      }
    }
  }, [templateStyles, styles]);

  // Handle template style changes from StyleEditor
  const handleApplyTemplateStyles = (styles: any) => {
    setTemplateStyles(styles);
  };

  return (
    <div className={styles.Editorcontainer}>
      <div className={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '22px', fontWeight: '600' }}>{rowData?.templateLabel || ''} <span style={{ fontSize: '14px', fontWeight: '400' }}>( Template Editor )</span></span>
          <span style={{ marginTop: '10px', fontSize: '14px' }}>Created on: {rowData?.createdDateTime || ''}</span>
          <span style={{ marginTop: '3px', fontSize: '14px' }}>Modified on: {rowData?.updatedDateTime || ''}</span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }} className={styles.actionButtons}>
          <Tooltip title={t("copy")}>
            <Button onClick={handleCopyTemplate} className={styles.actionButton}>
              <CopyIcon />
            </Button>
          </Tooltip>
          <Tooltip title={t("delete")}>
            <Button onClick={handleDeleteTemplate} className={styles.actionButton}>
              <DeleteIcon />
            </Button>
          </Tooltip>
          <Tooltip title={t("close")}>
            <Button onClick={handleCancel} className={styles.actionButton}>
              <CloseIcon />
            </Button>
          </Tooltip>
        </span>
      </div>
      <div className={styles.splitScreen}>
        <div className={styles.tabContent} style={{ maxWidth: 320, minWidth: 260, borderRight: '1px solid #eee', background: '#f9fafc' }}>
          <LeftPanel
            onAddRow={(type, heading, apiData) => handleAddRow(type, heading, apiData)}
            onSave={handleLeftPanelSave}
            selectedRow={selectedRow}
            setSelectedTypeData={setSelectedTypeData}
          />
        </div>
        <div className={styles.tabContent} style={{ flex: 1 }}>
          {previewMode ? (
            <PreviewContent />
          ) : (
            <EditorTable
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              onPreviewClick={handlePreviewClick}
              rows={editorTableRows}
              onMoveRow={handleRowMove}
              onDeleteRow={handleDeleteRow}
              onRowSelect={handleEditorTableRowClick}
            />
          )}
        </div>
        <div className={styles.tabContent} style={{ maxWidth: 350, minWidth: 260, borderLeft: '1px solid #eee', background: '#fff' }}>
          {/* Pass the ordered editorTableRows directly to TemplateTreeView */}
          <TemplateTreeView 
            rows={editorTableRows} 
            previewMode={previewMode} 
            onApplyStyles={handleApplyTemplateStyles} 
          />
        </div>
      </div>
      <div className={styles.footer}>
        <Button
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          type='primary'
          onClick={handleSaveTemplate}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default TemplateEditorScreen;