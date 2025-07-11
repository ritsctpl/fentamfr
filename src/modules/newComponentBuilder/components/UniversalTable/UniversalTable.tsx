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

const UniversalTable = ({ editMode, setTableConfig, templateStructure, userDatas, setUserDatas }: { editMode?: boolean, setTableConfig?: (config: any) => void, templateStructure?: any, userDatas?: any, setUserDatas?: (data: any) => void }) => {
    const [templateData, setTemplateData] = useState<TemplateData>({
        columns: [],
        headerStructure: [],
        rowControls: {
            mode: 'growing',
            minRows: 1,
            maxRows: 10,
            allowAddRemove: true,
            initialRows: 1
        },
        pagination: {
            enabled: false,
            rowsPerPage: 10
        },
        columnLayout: {
            columnCount: 1,
            columnWidthMode: 'auto',
            stickyHeaders: true,
            resizableColumns: true
        },
        style: {
            tableBorder: true,
            stripedRows: true,
            alternateRowColor: '#ffffff',
            headerColor: '#f0f0f0',
            headerFontColor: '#000000'
        },
        preloadRows: []
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
        if (templateStructure) {
            setTemplateData(templateStructure);
    
            // When NOT in edit mode, load from preloadRows or fallback to userDatas
            if (!editMode) {
                if (userDatas?.length > 0) {
                    setUserData(userDatas);
                } else if (templateStructure.preloadRows?.length > 0) {
                    setUserData(templateStructure.preloadRows);
                }
            }
        }
    }, [editMode]);
    
    

    // This effect handles the switching between edit mode and view mode
    useEffect(() => {
        if (editMode) {
            if (userData.length > 0) {
                setTemplateData(prev => ({
                    ...prev,
                    preloadRows: userData
                }));
                // Clear userData as we're in edit mode now
                setUserData([]);
            }
        } else {
            // When switching to view mode, load data from preload_rows
            if (templateData.preloadRows && templateData.preloadRows.length > 0) {
                setUserData(templateData.preloadRows);
            }
        }
    }, [editMode]);

    useEffect(() => {
        if (setTableConfig) {
            setTableConfig(templateData);
        }
    }, [templateData]);

    useEffect(() => {
        if (userDatas) {
            setUserData(userDatas);
        }
    }, [userDatas]);

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
                const newPreloadRows = [...(prev.preloadRows || [])];
                
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
                        newPreloadRows[rowIndex][column.fieldId] = evaluateFormula(
                            column.formula,
                            newPreloadRows[rowIndex]
                        );
                    }
                });
                
                return {
                    ...prev,
                    preloadRows: newPreloadRows
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
                        newData[rowIndex][column.fieldId] = evaluateFormula(
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
            if (column.fieldType === 'number' && formValues.precision === undefined) {
                formValues.precision = 1;
            }

            // For select/enum fields, ensure default value is in options
            if ((column.fieldType === 'select' || column.fieldType === 'enum') && column.options) {
                if (!column.options.some(opt => opt.value === column.defaultValue)) {
                    formValues.defaultValue = column.options.length > 0 ? column.options[0].value : '';
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
            const fieldId = editingColumn?.fieldId || generateFieldId(values.fieldName);
            
            const newColumn: Column = {
                ...values,
                fieldId
            };

            // Update the column in templateData
            setTemplateData(prev => {
                const newTemplateData = {
                    ...prev,
                    columns: editingColumn
                        ? prev.columns.map(col => 
                            col.fieldId === editingColumn.fieldId ? newColumn : col
                          )
                        : [...prev.columns, newColumn]
                };

                // Always update existing rows when column configuration changes
                const updateExistingRows = (rows: UserData[]): UserData[] => {
                    return rows.map(row => {
                        const updatedRow = { ...row };

                        // For new columns, apply default value
                        if (!editingColumn) {
                            if (newColumn.defaultValue !== undefined) {
                                updatedRow[fieldId] = newColumn.defaultValue;
                            }
                        } 
                        // For existing columns
                        else {
                            // If field type changed, reset to default value
                            if (editingColumn.fieldType !== newColumn.fieldType) {
                                updatedRow[fieldId] = newColumn.defaultValue;
                            }
                            // If default value changed and current value is undefined/null
                            else if (newColumn.defaultValue !== editingColumn.defaultValue && 
                                    (updatedRow[fieldId] === undefined || updatedRow[fieldId] === null)) {
                                updatedRow[fieldId] = newColumn.defaultValue;
                            }
                        }

                        // Handle formula fields
                        if (newColumn.fieldType === 'formula' && newColumn.formula) {
                            updatedRow[fieldId] = evaluateFormula(newColumn.formula, updatedRow);
                        }

                        // Handle number precision changes
                        if (newColumn.fieldType === 'number' && typeof updatedRow[fieldId] === 'number') {
                            updatedRow[fieldId] = Number(updatedRow[fieldId].toFixed(newColumn.precision || 0));
                        }

                        // Handle validation constraints
                        if (newColumn.validation) {
                            const { min, max } = newColumn.validation;
                            if (typeof updatedRow[fieldId] === 'number') {
                                if (min !== undefined && updatedRow[fieldId] < min) {
                                    updatedRow[fieldId] = min;
                                }
                                if (max !== undefined && updatedRow[fieldId] > max) {
                                    updatedRow[fieldId] = max;
                                }
                            }
                        }

                        return updatedRow;
                    });
                };

                // Update both preload_rows and userData
                if (editMode && newTemplateData.preloadRows) {
                    newTemplateData.preloadRows = updateExistingRows(newTemplateData.preloadRows);
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
            columns: prev.columns.filter(col => col.fieldId !== fieldId)
        }));
    };

    const addRow = () => {
        const newRow = templateData.columns.reduce((acc, column) => {
            let defaultValue = column.defaultValue;
            
            // For select/enum fields, validate that default value is in options
            if ((column.fieldType === 'select' || column.fieldType === 'enum') && column.options) {
                // If default value is not in options, use first option or null
                if (!column.options.some(opt => opt.value === defaultValue)) {
                    defaultValue = column.options.length > 0 ? column.options[0].value : null;
                }
            }
            
            return {
                ...acc,
                [column.fieldId]: defaultValue
            };
        }, {});
        
        if (editMode) {
            setTemplateData(prev => ({
                ...prev,
                preloadRows: [...(prev.preloadRows || []), newRow]
            }));
        } else {
            setUserData([...userData, newRow]);
        }
    };

    const deleteRow = (rowIndex: number) => {
        if (editMode) {
            setTemplateData(prev => {
                const newPreloadRows = [...(prev.preloadRows || [])];
                newPreloadRows.splice(rowIndex, 1);
                return {
                    ...prev,
                    preloadRows: newPreloadRows
                };
            });
        } else {
            setUserData(userData.filter((_, index) => index !== rowIndex));
        }
    };

    // Get the data to display based on edit mode
    const displayData = useMemo(() => {
        return editMode ? (templateData.preloadRows || []) : userData;
    }, [editMode, templateData.preloadRows, userData]);

    const paginatedData = useMemo(() => {
        if (!templateData.pagination?.enabled) return displayData;
        
        const startIndex = (currentPage - 1) * (templateData.pagination.rowsPerPage || 10);
        const endIndex = startIndex + (templateData.pagination.rowsPerPage || 10);
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
        if (!templateData.headerStructure || templateData.headerStructure.length === 0) {
            return {
                headers: templateData.headerStructure || [],
                leafColumns: templateData.columns.map(col => col.fieldId),
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

        const headersWithIds = ensureIds(templateData.headerStructure);

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
                .map(col => col.fieldId)
                .filter(id => !leafColumns.has(id))
        };
    }, [templateData.headerStructure, templateData.columns]);

    // Get the ordered list of columns to display in the table body
    const orderedColumns = useMemo(() => {
        return templateData.columns; // Keep the exact order from user creation
    }, [templateData.columns]);
    

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
            headerStructure: ensureIds(prev.headerStructure)
        }));
        setIsHeaderModalVisible(true);
    };

    const handleHeaderStructureUpdate = (newStructure: HeaderStructure[]) => {
        setTemplateData(prev => ({
            ...prev,
            headerStructure: newStructure
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

        const header = findHeader(templateData.headerStructure);
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
            headerStructure: removeHeader(prev.headerStructure)
        }));

        message.success('Header group deleted successfully');
    };

    const handleEditColumn = (columnId: string) => {
        const column = templateData.columns.find(col => col.fieldId === columnId);
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
                    {templateData.rowControls?.allowAddRemove && (
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
            
            <TableContainer $stickyHeaders={templateData.columnLayout?.stickyHeaders}>
                <StyledTable
                    $tableBorder={templateData.style?.tableBorder}
                    $stripedRows={templateData.style?.stripedRows}
                    $alternateRowColor={templateData.style?.alternateRowColor}
                    $headerColor={templateData.style?.headerColor}
                    $headerFontColor={templateData.style?.headerFontColor}
                >
                    <TableHeader 
                        headerStructure={processHeaderStructure.headers}
                        columns={orderedColumns}
                        showActions={templateData.rowControls?.allowAddRemove}
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
                                        key={`${rowIndex}-${column.fieldId}`}
                                        style={{ 
                                            width: 'auto',
                                            minWidth: column.fieldType === 'boolean' ? '80px' : '120px',
                                            maxWidth: column.fieldType === 'text' ? '200px' : undefined
                                        }}
                                    >
                                        {renderCell(column, row[column.fieldId], rowIndex)}
                                    </td>
                                ))}
                                {templateData.rowControls?.allowAddRemove && (
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
                                    colSpan={orderedColumns.length + (templateData.rowControls?.allowAddRemove ? 1 : 0)} 
                                    style={{ 
                                        textAlign: 'center', 
                                        padding: '20px',
                                        position: 'relative'  // Ensure proper stacking context
                                    }}
                                >
                                    No data available. {templateData.rowControls?.allowAddRemove && 'Click "Add Row" to add data.'}
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
                        pageSize={templateData.pagination.rowsPerPage}
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
                            headerStructure={templateData.headerStructure}
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


