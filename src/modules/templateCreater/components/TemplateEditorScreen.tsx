import React, { useState, useEffect } from 'react';
import type { MenuProps } from 'antd';
import styles from '@modules/templateCreater/styles/templateBuilder.module.css';
import LeftPanel from './LeftPanel';
import EditorTable from './EditorTable';
import { Switch, message, Input, Button, Modal, Dropdown } from 'antd';
import TemplateTreeView from './TemplateTreeView';
import { FaArrowLeft } from 'react-icons/fa6';
import { DeleteOutlined, DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, Table, TableCell, TableRow as DocxTableRow, TextRun, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface TemplateEditorScreenProps {
  data?: any;
  onClose?: () => void;
  isNewTemplate?: boolean;
}

interface TableRow {
  id: number;
  section: string;
  type: string;
  heading: string;
}

const TemplateEditorScreen: React.FC<TemplateEditorScreenProps> = ({ data, onClose, isNewTemplate = false }) => {
  // const context = useContext(TemplateBuilderContext);
  // if (!context) return null;

  const [editorTableRows, setEditorTableRows] = useState<TableRow[]>([]);
  const [jsonView, setJsonView] = useState<any>({ template: {} });
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TableRow | undefined>(undefined);

  // Initialize based on whether we're creating a new template or editing an existing one
  useEffect(() => {
    // Default is empty table
    setEditorTableRows([]);
    setJsonView({ template: {} });

    // Only load data if it's provided and not a new template
    if (!isNewTemplate && data) {
      if (Array.isArray(data)) {
        setEditorTableRows(data);
      } else if (typeof data === 'object' && data !== null) {
        // If it's a single row, create an array with that row
        setEditorTableRows([data]);
      }
      updateJsonView(Array.isArray(data) ? data : data ? [data] : []);
    }
  }, [data, isNewTemplate]);

  // Update JSON view based on table rows
  const updateJsonView = (rows: TableRow[]) => {
    const template: any = { template: {} };

    // First, create all sections
    rows.forEach((row, index) => {
      if (row.type === "Group") {
        template.template[`group${index}`] = {
          id: row.id,
          section: row.section,
          heading: row.heading,
          type: "Group",
          sections: [
            {
              id: `nested-${row.id}-1`,
              section: "Component 1",
              heading: "Component 1",
              type: "Component",
              component: {
                text: { type: 'text', content: 'Component content' },
                input: { type: 'input', label: 'Input field' },
                button: { type: 'button', label: 'Submit' }
              }
            },
            {
              id: `nested-${row.id}-2`,
              section: "Component 2",
              heading: "Component 2",
              type: "Component",
              component: {
                table: {
                  type: 'table',
                  columns: ['Column 1', 'Column 2'],
                  data: [
                    ['Data 1', 'Data 2'],
                    ['Data 3', 'Data 4']
                  ]
                },
                notes: { type: 'text', content: 'Additional notes' }
              }
            }
          ]
        };
      } else if (row.type === "Section") {
        template.template[`section${index}`] = {
          id: row.id,
          section: row.section,
          heading: row.heading,
          type: "Section",
          component: {
            title: { type: 'text', content: 'Section Title' },
            subtitle: { type: 'text', content: 'Section Subtitle' },
            date: { type: 'input', label: 'Section Date' },
            status: { type: 'input', label: 'Section Status' }
          }
        };
      } else if (row.type === "Component") {
        template.template[`component${index}`] = {
          id: row.id,
          section: row.section,
          heading: row.heading,
          type: "Component",
          component: {
            text: { type: 'text', content: 'Component content' },
            input: { type: 'input', label: 'Component input' },
            button: { type: 'button', label: 'Component button' },
            table: {
              type: 'table',
              columns: ['Item', 'Value'],
              data: [
                ['Item 1', 'Value 1'],
                ['Item 2', 'Value 2']
              ]
            }
          }
        };
      }
    });

    setJsonView(template);
  };

  // Handle row selection from the table
  const handleRowSelect = (row: TableRow) => {
    setSelectedRow(row);
  };

  // Add a row to the table (now called from the save button in LeftPanel)
  const handleAddRow = (type: string, heading: string) => {
    // Check if we're editing an existing row
    if (selectedRow) {
      // Update the existing row
      const updatedRows = editorTableRows.map(row =>
        row.id === selectedRow.id
          ? { ...row, type, section: heading, heading }
          : row
      );

      setEditorTableRows(updatedRows);
      updateJsonView(updatedRows);
      message.success("Row updated successfully");
      setSelectedRow(undefined);
    } else {
      // Create a new row with default component data based on type
      const newRow = {
        id: Date.now(),
        section: heading || type,
        type: type,
        heading: heading,
        component: type === 'Section' ? {
          title: { type: 'text', content: 'New Section Title' },
          subtitle: { type: 'text', content: 'New Section Subtitle' },
          date: { type: 'input', label: 'Section Date' },
          status: { type: 'input', label: 'Section Status' }
        } : type === 'Group' ? {
          sections: [
            {
              id: `nested-${Date.now()}-1`,
              section: "New Component 1",
              heading: "New Component 1",
              type: "Component",
              component: {
                text: { type: 'text', content: 'New component content' },
                input: { type: 'input', label: 'New input field' },
                button: { type: 'button', label: 'New button' }
              }
            }
          ]
        } : {
          text: { type: 'text', content: 'New component content' },
          input: { type: 'input', label: 'New input field' },
          button: { type: 'button', label: 'New button' },
          table: {
            type: 'table',
            columns: ['New Column 1', 'New Column 2'],
            data: [
              ['New Data 1', 'New Data 2'],
              ['New Data 3', 'New Data 4']
            ]
          }
        }
      };

      const updatedRows = [...editorTableRows, newRow];
      setEditorTableRows(updatedRows);
      updateJsonView(updatedRows);
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
    // If the deleted row is currently selected, clear the selection
    if (selectedRow && selectedRow.id === rowId) {
      setSelectedRow(undefined);
    }

    const updatedRows = editorTableRows.filter(row => row.id !== rowId);
    setEditorTableRows(updatedRows);
    updateJsonView(updatedRows);
    message.info("Row deleted");
  };

  // Delete all rows
  const handleDeleteAll = () => {
    setEditorTableRows([]);
    setJsonView({ template: {} });
    setPreviewMode(false);
    setSelectedRow(undefined);
  };

  // Handle cancel button click
  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  // Handle save template (for the main Save button, not the Left Panel one)
  const handleSaveTemplate = () => {
    // In a real implementation, this would call an API to save the template
    console.log('Saving template:', jsonView);
    message.success("Template saved successfully");

    if (onClose) {
      onClose();
    }
  };

  // Left panel save just adds/updates a row but doesn't navigate back
  const handleLeftPanelSave = () => {
    // Clear the selected row after saving changes
    setSelectedRow(undefined);
  };

  // Render component based on type
  const renderComponent = (row: TableRow) => {
    if (!row || !row.type) {
      return <div>Invalid row data</div>;
    }

    const componentData = jsonView.template[`${row.type.toLowerCase()}${editorTableRows.indexOf(row)}`];
    console.log('Component Data:', componentData); // Debug log
    
    switch(row.type) {
      case 'Section':
        return (
          <div key={row.id} className={styles.previewSection}>
            <h3>{row.heading || 'Untitled Section'}</h3>
            {componentData?.component && Object.entries(componentData.component).map(([key, comp]: [string, any]) => {
              switch(comp.type) {
                case 'text':
                  return <p key={key}>{comp.content || ''}</p>;
                case 'input':
                  return <Input key={key} placeholder={comp.label || 'Enter text'} style={{ marginBottom: '10px' }} />;
                case 'button':
                  return <Button key={key} type="primary">{comp.label || 'Button'}</Button>;
                case 'table':
                  return (
                    <div key={key} className={styles.previewTable}>
                      <table>
                        <thead>
                          <tr>
                            {comp.columns?.map((col: string) => (
                              <th key={col}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {comp.data?.map((row: any[], idx: number) => (
                            <tr key={idx}>
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        );
      case 'Component':
        return (
          <div key={row.id} className={styles.previewComponent}>
            <h3>{row.heading || 'Untitled Component'}</h3>
            {componentData?.component && Object.entries(componentData.component).map(([key, comp]: [string, any]) => {
              switch(comp.type) {
                case 'text':
                  return <p key={key}>{comp.content || ''}</p>;
                case 'input':
                  return <Input key={key} placeholder={comp.label || 'Enter text'} style={{ marginBottom: '10px' }} />;
                case 'button':
                  return <Button key={key} type="primary">{comp.label || 'Button'}</Button>;
                case 'table':
                  return (
                    <div key={key} className={styles.previewTable}>
                      <table>
                        <thead>
                          <tr>
                            {comp.columns?.map((col: string) => (
                              <th key={col}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {comp.data?.map((row: any[], idx: number) => (
                            <tr key={idx}>
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        );
      case 'Group':
        return (
          <div key={row.id} className={styles.previewGroup}>
            <h2>{row.heading || 'Untitled Group'}</h2>
            <div className={styles.nestedSections}>
              {componentData?.sections?.map((section: any, index: number) => (
                <div key={section.id || index} className={styles.previewComponent}>
                  <h4>{section.heading || `Component ${index + 1}`}</h4>
                  {section.component && Object.entries(section.component).map(([key, comp]: [string, any]) => {
                    switch(comp.type) {
                      case 'text':
                        return <p key={key}>{comp.content || ''}</p>;
                      case 'input':
                        return <Input key={key} placeholder={comp.label || 'Enter text'} style={{ marginBottom: '10px' }} />;
                      case 'button':
                        return <Button key={key} type="primary">{comp.label || 'Button'}</Button>;
                      case 'table':
                        return (
                          <div key={key} className={styles.previewTable}>
                            <table>
                              <thead>
                                <tr>
                                  {comp.columns?.map((col: string) => (
                                    <th key={col}>{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {comp.data?.map((row: any[], idx: number) => (
                                  <tr key={idx}>
                                    {row.map((cell, cellIdx) => (
                                      <td key={cellIdx}>{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div key={row.id}>Unknown component type: {row.type}</div>;
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

  // Preview component that renders actual components based on the table data
  const PreviewContent = () => {
    if (editorTableRows.length === 0) {
      return <div className={styles.emptyPreview}>No components to preview. Add sections to see the preview.</div>;
    }

    return (
      <div className={styles.previewWrapper}>
        <div className={styles.previewHeader}>
          <h2 className={styles.previewTitle}>{selectedRow?.heading || 'Template Preview'}</h2>
          <Dropdown menu={{ items }} placement="bottomRight">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              aria-label="Download"
              style={{ fontSize: 18 }}
            />
          </Dropdown>
        </div>
        <div className={`preview-content ${styles.previewContainer}`}>
          {editorTableRows.map(row => renderComponent(row))}
        </div>
      </div>
    );
  };

  const handleDeleteTemplate = () => {
    Modal.confirm({
      title: 'Delete Template',
      content: 'Are you sure you want to delete this template?',
      okText: 'Delete',
      cancelText: 'Cancel',
      onOk() {
        setEditorTableRows([]);
        setJsonView({ template: {} });
        message.success('Template deleted');
        // Navigate back to main screen
        if (onClose) {
          onClose();
        }
      },
    });
  };

  return (
    <div className={styles.Editorcontainer}>
      <div className={styles.header}>
        <span style={{ display: 'flex', gap: 10 }}>
          {onClose && (
            <button
              style={{
                background: '#fff',
                border: '1px solid #474444',
                color: '#131010',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'auto',
              }}
              onClick={handleCancel}
            >
              <FaArrowLeft />
            </button>
          )}
          <b>Template Editor</b>
        </span>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          Preview
          <Switch
            checked={previewMode}
            onChange={(checked) => setPreviewMode(checked)}
            style={{ margin: '0 16px 0 8px' }}
          />
          <button
            style={{
              // background: '#005A60',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '6px 16px',
              fontWeight: 500,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
              marginRight: 10,
            }}
            onClick={handleDeleteTemplate}
          >
            <DeleteOutlined />
          </button>
          <button
            style={{
              background: '#00565d',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '6px 16px',
              fontWeight: 500,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
            }}
            onClick={handleSaveTemplate}
          >
            Save Template
          </button>
        </span>
      </div>
      <div className={styles.splitScreen}>
        <div className={styles.tabContent} style={{ maxWidth: 320, minWidth: 260, borderRight: '1px solid #eee', background: '#f9fafc' }}>
          <LeftPanel
            onAddRow={handleAddRow}
            onSave={handleLeftPanelSave}
            selectedRow={selectedRow}
          />
        </div>
        <div className={styles.tabContent} style={{ flex: 1 }}>
          {previewMode ? (
            <PreviewContent />
          ) : (
            <EditorTable
              rows={editorTableRows}
              onMoveRow={handleRowMove}
              onDeleteRow={handleDeleteRow}
              onRowSelect={handleRowSelect}
            />
          )}
        </div>
        <div className={styles.tabContent} style={{ maxWidth: 350, minWidth: 260, borderLeft: '1px solid #eee', background: '#fff' }}>
          <TemplateTreeView templateData={jsonView} />
        </div>
      </div>
      <div className={styles.footer}>
        {/* <button
          style={{
            background: '#fff',
            border: '1px solid #1976d2',
            color: '#1976d2',
            borderRadius: 4,
            padding: '8px 24px',
            marginRight: 12,
            fontWeight: 500,
            fontSize: 16,
            cursor: 'pointer',
          }}
          onClick={handleCancel}
        >
          Cancel
        </button> */}
        {/* <button
          style={{
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '8px 24px',
            fontWeight: 500,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
          }}
          onClick={handleSaveTemplate}
        >
          Save
        </button> */}
      </div>
    </div>
  );
};

export default TemplateEditorScreen; 