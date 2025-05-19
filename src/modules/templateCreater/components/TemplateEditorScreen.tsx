import React, { useState, useEffect } from 'react';
import styles from '@modules/templateCreater/styles/templateBuilder.module.css';
import LeftPanel from './LeftPanel';
import EditorTable from './EditorTable';
import { Switch, message, Input, Button, Modal } from 'antd';
import TemplateTreeView from './TemplateTreeView';
import { FaArrowLeft } from 'react-icons/fa6';
import { DeleteOutlined } from '@ant-design/icons';

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
      if (row.type === "SectionGroup") {
        template.template[`sectionGroup${index}`] = {
          id: row.id,
          section: row.section,
          heading: row.heading,
          type: "SectionGroup",
          sections: [
            // Add some sample nested sections
            {
              id: `nested-${row.id}-1`,
              section: "Nested Section 1",
              heading: "Nested Section 1",
              type: "Section",
              component: {
                text1: { type: "text", content: "Some text content" },
                input1: { type: "input", label: "Input field" }
              }
            },
            {
              id: `nested-${row.id}-2`,
              section: "Nested Section 2",
              heading: "Nested Section 2",
              type: "Text Section",
              content: "This is a text section inside a section group"
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
            text1: { type: "text", content: "Sample text component" },
            input1: { type: "input", label: "Sample input field" },
            button1: { type: "button", label: "button" }
          }
        };
      } else if (row.type === "Text Section") {
        template.template[`textSection${index}`] = {
          id: row.id,
          section: row.section,
          heading: row.heading,
          type: "Text Section",
          content: "This is a sample text content for the section"
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
      // Create a new row
      const newRow = {
        id: Date.now(), // Generate unique ID
        section: heading || type,
        type: type,
        heading: heading
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
    switch(row.type) {
      case 'Section':
        return (
          <div key={row.id} className={styles.previewSection}>
            <h3>{row.heading}</h3>
            <p>Sample text component</p>
            <Input placeholder="Sample input field" style={{ marginBottom: '10px' }} />
            <Button type="primary">button</Button>
          </div>
        );
      case 'Text Section':
        return (
          <div key={row.id} className={styles.previewTextSection}>
            <h3>{row.heading}</h3>
            <p>This is a sample text content for the section</p>
          </div>
        );
      case 'SectionGroup':
        return (
          <div key={row.id} className={styles.previewSectionGroup}>
            <h2>{row.heading}</h2>
            <div className={styles.nestedSections}>
              <div className={styles.previewSection}>
                <h4>Nested Section 1</h4>
                <p>Some text content</p>
                <Input placeholder="Input field" style={{ marginBottom: '10px' }} />
              </div>
              <div className={styles.previewTextSection}>
                <h4>Nested Section 2</h4>
                <p>This is a text section inside a section group</p>
              </div>
            </div>
          </div>
        );
      default:
        return <div key={row.id}>Unknown component type: {row.type}</div>;
    }
  };

  // Preview component that renders actual components based on the table data
  const PreviewContent = () => {
    if (editorTableRows.length === 0) {
      return <div className={styles.emptyPreview}>No components to preview. Add sections to see the preview.</div>;
    }

    return (
      <div className={styles.previewContainer}>
        {editorTableRows.map(row => renderComponent(row))}
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