import React, { useState, useEffect, useMemo } from 'react';
import { Button, Space, Tooltip, Form, Pagination, Modal, message } from 'antd';
import { 
    PlusOutlined, 
    DeleteOutlined, 
    SettingOutlined,
    FolderAddOutlined
} from '@ant-design/icons';
import { TableContainer, ToolbarContainer, StyledTable } from './UniversalTable.styles';
import { TableSettingsModal } from './TableSettings';
import EditableCell from './EditCell';
import { ColumnConfigModal } from './ColumConfiguration';
import { HeaderStructure, TemplateData, Column, UserData } from './types';
import TableHeader from './TableHeader';
import HeaderGroupManager from './HeaderGroupManager';

const UniversalTable = ({ editMode }: { editMode?: boolean }) => {
    const [templateData, setTemplateData] = useState<TemplateData>({
        columns: [],
        header_structure: [],
        row_controls: {
            mode: 'growing',
            min_rows: 1,
            max_rows: 10,
            allow_add_remove: true,
            initial_rows: 1
        },
        pagination: {
            enabled: false,
            rows_per_page: 10
        },
        column_layout: {
            column_count: 1,
            column_width_mode: 'auto',
            sticky_headers: true,
            resizable_columns: true
        },
        style: {
            table_border: true,
            striped_rows: true,
            alternate_row_color: '#ffffff',
            header_color: '#f0f0f0',
            header_font_color: '#000000'
        },
        preload_rows: []
    });
    
    const [userData, setUserData] = useState<UserData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isColumnModalVisible, setIsColumnModalVisible] = useState(false);
    const [editingColumn, setEditingColumn] = useState<Column | null>(null);
    const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
    const [resizingColumn, setResizingColumn] = useState<string | null>(null);
    const [form] = Form.useForm();
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const [isHeaderModalVisible, setIsHeaderModalVisible] = useState(false);
    const [editingHeaderId, setEditingHeaderId] = useState<string | null>(null);

    // Load sample data
    useEffect(() => {
        // Initialize user data with preloaded rows if not in edit mode
        if (!editMode && templateData.preload_rows && templateData.preload_rows.length > 0) {
            setUserData(templateData.preload_rows);
        }
    }, [editMode]);

    // This effect handles the switching between edit mode and view mode
    useEffect(() => {
        if (editMode) {
            if (userData.length > 0) {
                setTemplateData(prev => ({
                    ...prev,
                    preload_rows: userData
                }));
                // Clear userData as we're in edit mode now
                setUserData([]);
            }
        } else {
            // When switching to view mode, load data from preload_rows
            if (templateData.preload_rows && templateData.preload_rows.length > 0) {
                setUserData(templateData.preload_rows);
            }
        }
    }, [editMode]);

    useEffect(() => {
        console.log(templateData, 'templateData');
        console.log(userData, 'userData');
    }, [templateData, userData]);

    const evaluateFormula = (formula: string, rowData: UserData): number | string => {
        try {
            // Simple formula evaluation - replace field references with values
            let evaluatedFormula = formula;
            
            // First replace all field references with their values
            Object.keys(rowData).forEach(key => {
                evaluatedFormula = evaluatedFormula.replace(
                    new RegExp(`\\{${key}\\}`, 'g'),
                    // Convert to number if possible, otherwise use string
                    isNaN(Number(rowData[key])) ? `"${rowData[key] || ''}"` : (rowData[key] || 0)
                );
            });

            // Handle any remaining unreplaced field references (treat as 0)
            evaluatedFormula = evaluatedFormula.replace(/\{[^}]+\}/g, '0');
            
            // Evaluate the formula
            const result = eval(evaluatedFormula);
            
            // If the result is a number, format it according to the column's precision
            if (typeof result === 'number') {
                const formulaColumn = templateData.columns.find(col => col.formula === formula);
                if (formulaColumn?.precision !== undefined) {
                    return Number(result.toFixed(formulaColumn.precision));
                }
                return result;
            }
            
            return result;
        } catch (error) {
            console.error('Formula evaluation error:', error);
            return 'Error';
        }
    };

    const handleCellChange = (rowIndex: number, fieldId: string, value: any) => {
        // In edit mode, update preload_rows; otherwise, update userData
        if (editMode) {
            setTemplateData(prev => {
                const newPreloadRows = [...(prev.preload_rows || [])];
                
                // Ensure the row exists
                if (!newPreloadRows[rowIndex]) {
                    newPreloadRows[rowIndex] = {};
                }
                
                // Update the field
                newPreloadRows[rowIndex] = {
                    ...newPreloadRows[rowIndex],
                    [fieldId]: value
                };
                
                // Update formula fields
                prev.columns.forEach(column => {
                    if (column.formula) {
                        newPreloadRows[rowIndex][column.field_id] = evaluateFormula(
                            column.formula,
                            newPreloadRows[rowIndex]
                        );
                    }
                });
                
                return {
                    ...prev,
                    preload_rows: newPreloadRows
                };
            });
        } else {
            setUserData(prevData => {
                const newData = [...prevData];
                
                // Ensure the row exists
                if (!newData[rowIndex]) {
                    newData[rowIndex] = {};
                }
                
                // Update the field
                newData[rowIndex] = {
                    ...newData[rowIndex],
                    [fieldId]: value
                };
                
                // Update formula fields
                templateData.columns.forEach(column => {
                    if (column.formula) {
                        newData[rowIndex][column.field_id] = evaluateFormula(
                            column.formula,
                            newData[rowIndex]
                        );
                    }
                });
                
                return newData;
            });
        }
    };

    const showColumnModal = (column?: Column) => {
        setEditingColumn(column || null);
        setIsColumnModalVisible(true);
        if (column) {
            // Initialize form with column values
            const formValues = { ...column };
            
            // Ensure validation is properly set
            if (!formValues.validation) {
                formValues.validation = {};
            }
            
            // Ensure precision is set for number fields
            if (column.field_type === 'number' && formValues.precision === undefined) {
                formValues.precision = 1;
            }

            // For select/enum fields, ensure default value is in options
            if ((column.field_type === 'select' || column.field_type === 'enum') && column.options) {
                if (!column.options.some(opt => opt.value === column.default_value)) {
                    formValues.default_value = column.options.length > 0 ? column.options[0].value : '';
                }
            }
            
            form.setFieldsValue(formValues);
        } else {
            form.resetFields();
            
            // Initialize empty validation object for new columns
            form.setFieldValue('validation', {});
        }
    };

    const handleColumnSave = async () => {
        try {
            const values = await form.validateFields();
            
            // Process validation data into the correct format
            if (values.validation) {
                Object.keys(values.validation).forEach(key => {
                    if (values.validation[key] === undefined || values.validation[key] === null || values.validation[key] === '') {
                        delete values.validation[key];
                    }
                });
                
                if (Object.keys(values.validation).length === 0) {
                    values.validation = undefined;
                }
            }
            
            // Handle boolean fields
            values.required = !!values.required;
            values.read_only = !!values.read_only;
            values.multiline = !!values.multiline;
            values.capture_camera = !!values.capture_camera;
            
            // Handle arrays
            if (values.file_types && !Array.isArray(values.file_types)) {
                values.file_types = [values.file_types];
            }
            
            if (values.signed_by_role && !Array.isArray(values.signed_by_role)) {
                values.signed_by_role = [values.signed_by_role];
            }
            
            // Set default values for specific field types
            if (values.field_type === 'number') {
                if (values.precision === undefined) {
                    values.precision = 1;
                }
            }
            
            // Generate field_id from field_name if not editing an existing column
            const field_id = editingColumn?.field_id || generateFieldId(values.field_name);
            
            const newColumn: Column = {
                ...values,
                field_id
            };

            // Update the column in templateData
            setTemplateData(prev => {
                const newTemplateData = {
                    ...prev,
                    columns: editingColumn
                        ? prev.columns.map(col => 
                            col.field_id === editingColumn.field_id ? newColumn : col
                          )
                        : [...prev.columns, newColumn]
                };

                // Always update existing rows when column configuration changes
                const updateExistingRows = (rows: UserData[]): UserData[] => {
                    return rows.map(row => {
                        const updatedRow = { ...row };

                        // For new columns, apply default value
                        if (!editingColumn) {
                            if (newColumn.default_value !== undefined) {
                                updatedRow[field_id] = newColumn.default_value;
                            }
                        } 
                        // For existing columns
                        else {
                            // If field type changed, reset to default value
                            if (editingColumn.field_type !== newColumn.field_type) {
                                updatedRow[field_id] = newColumn.default_value;
                            }
                            // If default value changed and current value is undefined/null
                            else if (newColumn.default_value !== editingColumn.default_value && 
                                    (updatedRow[field_id] === undefined || updatedRow[field_id] === null)) {
                                updatedRow[field_id] = newColumn.default_value;
                            }
                        }

                        // Handle formula fields
                        if (newColumn.field_type === 'formula' && newColumn.formula) {
                            updatedRow[field_id] = evaluateFormula(newColumn.formula, updatedRow);
                        }

                        // Handle number precision changes
                        if (newColumn.field_type === 'number' && typeof updatedRow[field_id] === 'number') {
                            updatedRow[field_id] = Number(updatedRow[field_id].toFixed(newColumn.precision || 0));
                        }

                        // Handle validation constraints
                        if (newColumn.validation) {
                            const { min, max } = newColumn.validation;
                            if (typeof updatedRow[field_id] === 'number') {
                                if (min !== undefined && updatedRow[field_id] < min) {
                                    updatedRow[field_id] = min;
                                }
                                if (max !== undefined && updatedRow[field_id] > max) {
                                    updatedRow[field_id] = max;
                                }
                            }
                        }

                        return updatedRow;
                    });
                };

                // Update both preload_rows and userData
                if (editMode && newTemplateData.preload_rows) {
                    newTemplateData.preload_rows = updateExistingRows(newTemplateData.preload_rows);
                } else {
                    setUserData(prevUserData => updateExistingRows(prevUserData));
                }

                return newTemplateData;
            });

            setIsColumnModalVisible(false);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Helper function to convert field name to snake_case for field_id
    const generateFieldId = (fieldName: string): string => {
        if (!fieldName) return `col_${Date.now()}`;
        
        // Convert to lowercase and replace spaces and special chars with underscore
        return fieldName
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '') // Remove special characters
            .replace(/\s+/g, '_')    // Replace spaces with underscores
            .replace(/_+/g, '_');    // Replace multiple underscores with single one
    };

    const deleteColumn = (fieldId: string) => {
        setTemplateData(prev => ({
            ...prev,
            columns: prev.columns.filter(col => col.field_id !== fieldId)
        }));
    };

    const addRow = () => {
        const newRow = templateData.columns.reduce((acc, column) => {
            let defaultValue = column.default_value;
            
            // For select/enum fields, validate that default value is in options
            if ((column.field_type === 'select' || column.field_type === 'enum') && column.options) {
                // If default value is not in options, use first option or null
                if (!column.options.some(opt => opt.value === defaultValue)) {
                    defaultValue = column.options.length > 0 ? column.options[0].value : null;
                }
            }
            
            return {
                ...acc,
                [column.field_id]: defaultValue
            };
        }, {});
        
        if (editMode) {
            setTemplateData(prev => ({
                ...prev,
                preload_rows: [...(prev.preload_rows || []), newRow]
            }));
        } else {
            setUserData([...userData, newRow]);
        }
    };

    const deleteRow = (rowIndex: number) => {
        if (editMode) {
            setTemplateData(prev => {
                const newPreloadRows = [...(prev.preload_rows || [])];
                newPreloadRows.splice(rowIndex, 1);
                return {
                    ...prev,
                    preload_rows: newPreloadRows
                };
            });
        } else {
            setUserData(userData.filter((_, index) => index !== rowIndex));
        }
    };

    // Get the data to display based on edit mode
    const displayData = useMemo(() => {
        return editMode ? (templateData.preload_rows || []) : userData;
    }, [editMode, templateData.preload_rows, userData]);

    const paginatedData = useMemo(() => {
        if (!templateData.pagination?.enabled) return displayData;
        
        const startIndex = (currentPage - 1) * (templateData.pagination.rows_per_page || 10);
        const endIndex = startIndex + (templateData.pagination.rows_per_page || 10);
        return displayData.slice(startIndex, endIndex);
    }, [displayData, currentPage, templateData.pagination]);

    // Add this function to handle settings save
    const handleSettingsSave = (newSettings: TemplateData) => {
        setTemplateData(prev => ({
            ...prev,
            ...newSettings
        }));
    };

    // Process hierarchical headers
    const processHeaderStructure = useMemo(() => {
        if (!templateData.header_structure || templateData.header_structure.length === 0) {
            return {
                headers: templateData.header_structure || [],
                leafColumns: templateData.columns.map(col => col.field_id),
                columnsNotInStructure: []
            };
        }

        // Ensure all header groups have IDs
        const ensureIds = (groups: HeaderStructure[]): HeaderStructure[] => {
            return groups.map(group => ({
                ...group,
                id: group.id || `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                children: group.children ? ensureIds(group.children) : group.children
            }));
        };

        const headersWithIds = ensureIds(templateData.header_structure);

        // Get all leaf-level columns
        const leafColumns = new Set<string>();
        const extractColumns = (headers: HeaderStructure[]) => {
            headers.forEach(header => {
                if (header.columns) {
                    header.columns.forEach(col => leafColumns.add(col));
                }
                
                if (header.children) {
                    extractColumns(header.children);
                }
            });
        };

        extractColumns(headersWithIds);

        return { 
            headers: headersWithIds,
            leafColumns: Array.from(leafColumns),
            columnsNotInStructure: templateData.columns
                .map(col => col.field_id)
                .filter(id => !leafColumns.has(id))
        };
    }, [templateData.header_structure, templateData.columns]);

    // Get the ordered list of columns to display in the table body
    const orderedColumns = useMemo(() => {
        const { leafColumns, columnsNotInStructure } = processHeaderStructure;
        const allOrderedColumnIds = [...leafColumns, ...columnsNotInStructure];
        return allOrderedColumnIds
            .map(id => templateData.columns.find(col => col.field_id === id))
            .filter(Boolean) as Column[];
    }, [processHeaderStructure, templateData.columns]);

    const renderCell = (column: Column, value: any, rowIndex: number) => {
        return (
            <EditableCell
                value={value}
                column={column}
                rowIndex={rowIndex}
                onUpdate={handleCellChange}
            />
        );
    };

    const addParentColumn = () => {
        // Ensure all existing groups have IDs
        const ensureIds = (groups: HeaderStructure[]): HeaderStructure[] => {
            return groups.map(group => ({
                ...group,
                id: group.id || `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                children: group.children ? ensureIds(group.children) : group.children
            }));
        };

        setTemplateData(prev => ({
            ...prev,
            header_structure: ensureIds(prev.header_structure)
        }));
        setIsHeaderModalVisible(true);
    };

    const handleHeaderStructureUpdate = (newStructure: HeaderStructure[]) => {
        setTemplateData(prev => ({
            ...prev,
            header_structure: newStructure
        }));
    };

    const handleEditHeader = (headerId: string) => {
        // Find the header in the structure
        const findHeader = (headers: HeaderStructure[]): HeaderStructure | null => {
            for (const header of headers) {
                if (header.id === headerId) return header;
                if (header.children) {
                    const found = findHeader(header.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const header = findHeader(templateData.header_structure);
        if (header) {
            setEditingHeaderId(headerId);
            setIsHeaderModalVisible(true);
        }
    };

    const handleDeleteHeader = (headerId: string) => {
        // Remove the header from the structure
        const removeHeader = (headers: HeaderStructure[]): HeaderStructure[] => {
            return headers.filter(header => {
                if (header.id === headerId) return false;
                if (header.children) {
                    header.children = removeHeader(header.children);
                }
                return true;
            });
        };

        setTemplateData(prev => ({
            ...prev,
            header_structure: removeHeader(prev.header_structure)
        }));

        message.success('Header group deleted successfully');
    };

    const handleEditColumn = (columnId: string) => {
        const column = templateData.columns.find(col => col.field_id === columnId);
        if (column) {
            showColumnModal(column);
        }
    };

    const handleDeleteColumn = (columnId: string) => {
        deleteColumn(columnId);
        message.success('Column deleted successfully');
    };

    return (
        <div>
            <ToolbarContainer>
                <Space>
                    {templateData.row_controls?.allow_add_remove && (
                        <Tooltip title="Add Row">
                            <Button 
                                icon={<PlusOutlined />}
                                onClick={addRow}
                            >
                                Add Row
                            </Button>
                        </Tooltip>
                    )}
                    {editMode && (
                        <Space>
                            <Button 
                                icon={<PlusOutlined />}
                                onClick={() => showColumnModal()}
                            >
                                Add Column
                            </Button>
                            <Button 
                                icon={<FolderAddOutlined />}
                                onClick={addParentColumn}
                            >
                                Manage Header Groups
                            </Button>
                        </Space>
                    )}
                </Space>
                <Space>
                    {editMode && (
                        <Tooltip title="Table Settings">
                            <Button 
                                icon={<SettingOutlined />} 
                                onClick={() => setIsSettingsModalVisible(true)}
                            />
                        </Tooltip>
                    )}
                </Space>
            </ToolbarContainer>
            
            <TableContainer $stickyHeaders={templateData.column_layout?.sticky_headers}>
                <StyledTable
                    $tableBorder={templateData.style?.table_border}
                    $stripedRows={templateData.style?.striped_rows}
                    $alternateRowColor={templateData.style?.alternate_row_color}
                    $headerColor={templateData.style?.header_color}
                    $headerFontColor={templateData.style?.header_font_color}
                >
                    <TableHeader 
                        headerStructure={processHeaderStructure.headers}
                        columns={orderedColumns}
                        showActions={templateData.row_controls?.allow_add_remove}
                        onEditHeader={editMode ? handleEditHeader : undefined}
                        onDeleteHeader={editMode ? handleDeleteHeader : undefined}
                        onEditColumn={editMode ? handleEditColumn : undefined}
                        onDeleteColumn={editMode ? handleDeleteColumn : undefined}
                    />
                    <tbody>
                        {paginatedData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {orderedColumns.map((column) => (
                                    <td 
                                        key={`${rowIndex}-${column.field_id}`}
                                        style={{ 
                                            width: 'auto',
                                            minWidth: column.field_type === 'boolean' ? '80px' : '120px',
                                            maxWidth: column.field_type === 'text' ? '200px' : undefined
                                        }}
                                    >
                                        {renderCell(column, row[column.field_id], rowIndex)}
                                    </td>
                                ))}
                                {templateData.row_controls?.allow_add_remove && (
                                    <td style={{ 
                                        width: '80px', 
                                        textAlign: 'center',
                                        position: 'sticky',
                                        right: 0,
                                        backgroundColor: '#fff',
                                        boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.1)',
                                        zIndex: 1
                                    }}>
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => deleteRow(rowIndex)}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td 
                                    colSpan={orderedColumns.length + (templateData.row_controls?.allow_add_remove ? 1 : 0)} 
                                    style={{ 
                                        textAlign: 'center', 
                                        padding: '20px',
                                        position: 'relative'  // Ensure proper stacking context
                                    }}
                                >
                                    No data available. {templateData.row_controls?.allow_add_remove && 'Click "Add Row" to add data.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </StyledTable>
            </TableContainer>
            
            {templateData.pagination?.enabled && displayData.length > 0 && (
                <div style={{ padding: '16px', textAlign: 'right' }}>
                    <Pagination
                        current={currentPage}
                        onChange={setCurrentPage}
                        total={displayData.length}
                        pageSize={templateData.pagination.rows_per_page}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `Total ${total} items`}
                    />
                </div>
            )}
            {editMode && (
                <>
                    <ColumnConfigModal
                        editingColumn={editingColumn}
                        isColumnModalVisible={isColumnModalVisible}
                        setIsColumnModalVisible={setIsColumnModalVisible}
                        handleColumnSave={handleColumnSave}
                        templateData={templateData}
                        form={form}
                    />
                    <TableSettingsModal
                        visible={isSettingsModalVisible}
                        onClose={() => setIsSettingsModalVisible(false)}
                        settings={templateData}
                        onSave={handleSettingsSave}
                    />
                    <Modal
                        title={editingHeaderId ? "Edit Header Group" : "Manage Header Groups"}
                        open={isHeaderModalVisible}
                        onCancel={() => {
                            setIsHeaderModalVisible(false);
                            setEditingHeaderId(null);
                        }}
                        width={1000}
                        footer={null}
                    >
                        <HeaderGroupManager
                            headerStructure={templateData.header_structure}
                            columns={templateData.columns}
                            onUpdate={(newStructure) => {
                                handleHeaderStructureUpdate(newStructure);
                                if (editingHeaderId) {
                                    // Close the modal after editing a specific header
                                    setIsHeaderModalVisible(false);
                                    setEditingHeaderId(null);
                                }
                            }}
                            editingHeaderId={editingHeaderId}
                        />
                    </Modal>
                </>
            )}
        </div>
    );
};

export default UniversalTable;


