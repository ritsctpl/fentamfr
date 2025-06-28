import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  Checkbox,
  DatePicker,
  Dropdown,
  Menu,
  message,
  Space,
  Modal
} from "antd";
import {
  DownOutlined,
  DeleteOutlined,
  PlusOutlined,
  FolderAddOutlined,
  EditOutlined,
  FormOutlined,
  FontColorsOutlined
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import "../styles/UniversalSmartTable.css";

export type CellType = "static" | "form" | "group" | "merged" | "hidden";
export type FormFieldType = "text" | "number" | "select" | "checkbox" | "date" | "textarea";

interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  value: any;
  options?: string[];
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

interface UniversalCell {
  id: string;
  type: CellType;
  content: any;
  rowSpan?: number;
  colSpan?: number;
  style?: React.CSSProperties;
  locked?: boolean;
  selected?: boolean;
  editMode?: boolean;
  merged?: boolean;
}

interface UniversalRow {
  id: string;
  cells: UniversalCell[];
  level: number;
  parentId?: string;
  expanded?: boolean;
  isGroup?: boolean;
}

interface MergedCell {
  id: string;
  startRow: number;
  startCol: number;
  rowSpan: number;
  colSpan: number;
  type: CellType;
  content: any;
  style: string; 
}

interface TableState {
  columns: string[];
  rows: UniversalRow[];
  mergedCells: MergedCell[];
  selectedCells: Set<string>;
}

interface Column {
  label: string;
  value: string;
  isEditing?: boolean;
}



const fieldTypeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Select', value: 'select' },
  { label: 'Checkbox', value: 'checkbox' }
] as const;

const defaultColumns: Column[] = [
  { label: "Column 1", value: "column1" },
  { label: "Column 2", value: "column2" }
];

const UniversalTable: React.FC = () => {
  const [state, setState] = useState<TableState>({
    columns: defaultColumns.map(col => col.value),
    rows: [],
    mergedCells: [],
    selectedCells: new Set()
  });

  const [selectionMode, setSelectionMode] = useState(false);
  const [dragSelecting, setDragSelecting] = useState(false);
  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<{ rowId: string, cellId: string } | null>(null);
  const [dragStart, setDragStart] = useState<{ rowIndex: number; cellIndex: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ rowIndex: number; cellIndex: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    console.log(state);
  }, [state]);

  const addRow = useCallback(() => {
    const newRow: UniversalRow = {
      id: uuidv4(),
      cells: state.columns.map(() => ({
        id: uuidv4(),
        type: "static",
        content: "",
        editMode: false
      })),
      level: 0,
      expanded: true,
      isGroup: false
    };

    setState(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  }, [state.columns]);

  const addGroup = useCallback(() => {
    const groupRow: UniversalRow = {
      id: uuidv4(),
      cells: [{
        id: uuidv4(),
        type: "group",
        content: "",
        colSpan: state.columns.length,
        editMode: false
      }],
      level: 0,
      expanded: true,
      isGroup: true
    };

    setState(prev => ({
      ...prev,
      rows: [...prev.rows, groupRow]
    }));
  }, [state.columns.length]);

  const addChildRow = useCallback((parentId: string) => {
    setState(prev => {
      const parentIndex = prev.rows.findIndex(r => r.id === parentId);
      if (parentIndex === -1) return prev;

      const newRow: UniversalRow = {
        id: uuidv4(),
        cells: state.columns.map(() => ({
          id: uuidv4(),
          type: "static",
          content: "",
          editMode: false
        })),
        level: prev.rows[parentIndex].level + 1,
        parentId: parentId,
        expanded: true,
        isGroup: false
      };

      const lastChildIndex = prev.rows.reduce((lastIndex, row, index) => {
        if (row.parentId === parentId) {
          return index;
        }
        return lastIndex;
      }, parentIndex);

      const newRows = [
        ...prev.rows.slice(0, lastChildIndex + 1),
        newRow,
        ...prev.rows.slice(lastChildIndex + 1)
      ];

      return {
        ...prev,
        rows: newRows
      };
    });
  }, [state.columns]);

  const switchCellType = useCallback((rowId: string, cellId: string, newType: CellType) => {
    setState(prev => {
      const mergedCell = prev.mergedCells.find(mc => mc.id === cellId);
      if (mergedCell) {
        return {
          ...prev,
          mergedCells: prev.mergedCells.map(mc =>
            mc.id === cellId
              ? {
                ...mc,
                type: newType,
                content: newType === "form" ? [] : ""
              }
              : mc
          )
        };
      }

      return {
        ...prev,
        rows: prev.rows.map(row => {
          if (row.id !== rowId) return row;
        return {
          ...row,
            cells: row.cells.map(cell =>
              cell.id === cellId
                ? {
                  ...cell,
                  type: newType,
                  content: newType === "form" ? [] : "",
                  editMode: false
                }
                : cell
          ),
        };
      })
  };
    });
  }, []);

  const addFormField = useCallback((rowId: string, cellId: string, fieldType: FormFieldType) => {
    const field: FormField = {
      id: uuidv4(),
      type: fieldType,
      label: "New Field",
      value: "",
      required: false,
      validation: {}
    };

    setState(prev => {
      const mergedCell = prev.mergedCells.find(mc => mc.id === cellId);
      if (mergedCell) {
        return {
          ...prev,
          mergedCells: prev.mergedCells.map(mc =>
            mc.id === cellId
              ? {
                ...mc,
                content: Array.isArray(mc.content) ? [...mc.content, field] : [field]
              }
              : mc
          )
        };
      }

      return {
        ...prev,
        rows: prev.rows.map(row => {
          if (row.id !== rowId) return row;
        return {
          ...row,
            cells: row.cells.map(cell =>
            cell.id === cellId && Array.isArray(cell.content)
              ? { ...cell, content: [...cell.content, field] }
              : cell
          ),
        };
      })
      };
    });
  }, []);

  const handleCellClick = useCallback((cell: UniversalCell, rowId: string, cellId: string, event: React.MouseEvent) => {

    if (activeCell?.rowId === rowId && activeCell?.cellId === cellId) {
      return;
    }

    if (selectionMode) {
      const key = `${rowId}_${cellId}`;
      setState(prev => {
        const newSelectedCells = new Set(prev.selectedCells);
        if (newSelectedCells.has(key)) {
          newSelectedCells.delete(key);
        } else {
          newSelectedCells.add(key);
        }
        return { ...prev, selectedCells: newSelectedCells };
      });
    } else if (!cell.locked) {
      if (activeCell) {
        setState(prev => {
          const prevMergedCell = prev.mergedCells.find(mc => mc.id === activeCell.cellId);
          if (prevMergedCell) {
            return {
              ...prev,
              mergedCells: prev.mergedCells.map(mc =>
                mc.id === activeCell.cellId
                  ? { ...mc, editMode: false }
                  : mc
              )
            };
          }

          return {
            ...prev,
            rows: prev.rows.map(row => ({
              ...row,
              cells: row.cells.map(c =>
                c.id === activeCell.cellId ? { ...c, editMode: false } : c
              )
            }))
          };
        });
      }

      setActiveCell({ rowId, cellId });
      setState(prev => {
        const mergedCell = prev.mergedCells.find(mc => mc.id === cellId);
        if (mergedCell) {
          return {
            ...prev,
            mergedCells: prev.mergedCells.map(mc =>
              mc.id === cellId
                ? { ...mc, editMode: true }
                : mc
            )
          };
        }

        return {
          ...prev,
          rows: prev.rows.map(row => ({
            ...row,
            cells: row.cells.map(c =>
              c.id === cellId ? { ...c, editMode: true } : c
            )
          }))
        };
      });
    }
  }, [selectionMode, activeCell, state.mergedCells]);

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (activeCell && !(event.target as Element)?.closest('.universal-cell')) {
      setState(prev => ({
        ...prev,
        rows: prev.rows.map(row => ({
          ...row,
          cells: row.cells.map(c =>
            c.id === activeCell.cellId ? { ...c, editMode: false } : c
          )
        }))
      }));
      setActiveCell(null);
    }
  }, [activeCell]);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  const handleMouseDown = (rowIndex: number, cellIndex: number, event: React.MouseEvent) => {
    if (!selectionMode || event.button !== 0) return;

    setIsDragging(true);
    setDragStart({ rowIndex, cellIndex });
    setDragEnd({ rowIndex, cellIndex });

    if (!event.shiftKey) {
      setState(prev => ({
        ...prev,
        selectedCells: new Set()
      }));
    }
  };

  const handleMouseMove = (rowIndex: number, cellIndex: number) => {
    if (!isDragging || !selectionMode) return;

    setDragEnd({ rowIndex, cellIndex });
    updateSelection(dragStart!, { rowIndex, cellIndex });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const updateSelection = (start: { rowIndex: number; cellIndex: number }, end: { rowIndex: number; cellIndex: number }) => {
    const startRow = Math.min(start.rowIndex, end.rowIndex);
    const endRow = Math.max(start.rowIndex, end.rowIndex);
    const startCell = Math.min(start.cellIndex, end.cellIndex);
    const endCell = Math.max(start.cellIndex, end.cellIndex);

    setState(prev => {
      const newSelectedCells = new Set<string>();

      for (let i = startRow; i <= endRow; i++) {
        for (let j = startCell; j <= endCell; j++) {
          const row = prev.rows[i];
          if (row && !row.isGroup) {
            const cell = row.cells[j];
            if (cell) {
              newSelectedCells.add(`${row.id}_${cell.id}`);
            }
          }
        }
      }

      return {
        ...prev,
        selectedCells: newSelectedCells
      };
    });
  };

  const mergeCells = useCallback(() => {
    if (state.selectedCells.size < 2) {
      message.warning("Select at least 2 cells to merge");
      return;
    }

    const selectedCoords: Array<{ rowIndex: number; cellIndex: number; rowId: string; cellId: string }> = [];
    state.rows.forEach((row, rowIndex) => {
      row.cells.forEach((cell, cellIndex) => {
        if (state.selectedCells.has(`${row.id}_${cell.id}`)) {
          selectedCoords.push({ rowIndex, cellIndex, rowId: row.id, cellId: cell.id });
        }
      });
    });

    const rowIndices = selectedCoords.map(coord => coord.rowIndex);
    const cellIndices = selectedCoords.map(coord => coord.cellIndex);
    const minRow = Math.min(...rowIndices);
    const maxRow = Math.max(...rowIndices);
    const minCell = Math.min(...cellIndices);
    const maxCell = Math.max(...cellIndices);

    const isRectangular = selectedCoords.length === (maxRow - minRow + 1) * (maxCell - minCell + 1);
    if (!isRectangular) {
      message.error("Selected cells must form a rectangle");
      return;
    }

    const firstCell = state.rows[minRow].cells[minCell];
    const mergedCellId = uuidv4();
    
    setState(prev => {
      const newRows = [...prev.rows];
      
      for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCell; j <= maxCell; j++) {
          newRows[i].cells[j] = {
            id: i === minRow && j === minCell ? mergedCellId : newRows[i].cells[j].id,
            type: "hidden",
            content: "",
            editMode: false,
            merged: true
          };
        }
      }

      const newMergedCell: MergedCell = {
        id: mergedCellId,
        startRow: minRow,
        startCol: minCell,
        rowSpan: maxRow - minRow + 1,
        colSpan: maxCell - minCell + 1,
        type: firstCell.type,
        content: firstCell.content,
        style: firstCell.style ? JSON.stringify(firstCell.style) : '{}'
      };

      return {
        ...prev,
        rows: newRows,
        mergedCells: [...prev.mergedCells, newMergedCell],
        selectedCells: new Set()
      };
    });

    message.success("Cells merged successfully");
  }, [state.rows, state.selectedCells]);

  const handleColumnEdit = (columnId: string, newLabel: string) => {
    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.value === columnId ? { ...col, label: newLabel } : col
      )
    );
    setEditingColumnId(null);
  };

  const handleColumnDelete = (columnId: string) => {
    if (columns.length <= 2) {
      message.error('Cannot delete column. Minimum 2 columns required.');
      return;
    }

    Modal.confirm({
      title: 'Delete Column',
      content: 'Are you sure you want to delete this column? This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {

        setColumns(prevColumns => prevColumns.filter(col => col.value !== columnId));

        setState(prev => {
          const columnIndex = prev.columns.indexOf(columnId);
          if (columnIndex === -1) return prev;

          return {
            ...prev,
            columns: prev.columns.filter(col => col !== columnId),
            rows: prev.rows.map(row => ({
              ...row,
              cells: row.cells.filter((_, index) => index !== columnIndex)
            })),
          };
        });
      }
    });
  };

  const handleRowDelete = useCallback((rowId: string) => {
    const row = state.rows.find(r => r.id === rowId);
    const childRows = state.rows.filter(r => r.parentId === rowId);

    if (row?.isGroup && childRows.length > 0) {
      Modal.confirm({
        title: 'Delete Group',
        content: `This group contains ${childRows.length} row(s). Deleting it will also delete all its child rows. Are you sure?`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: () => {
          setState(prev => ({
            ...prev,
            rows: prev.rows.filter(r => r.id !== rowId && r.parentId !== rowId)
          }));
        }
      });
    } else {
      setState(prev => ({
        ...prev,
        rows: prev.rows.filter(r => r.id !== rowId)
      }));
    }
  }, [state.rows]);

  const handleAddColumn = () => {
    const columnNumber = columns.length + 1;
    const newColumn: Column = {
      label: `Column ${columnNumber}`,
      value: `column_${columnNumber}`
    };

    setColumns(prevColumns => [...prevColumns, newColumn]);
    
    setState(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn.value],
      rows: prev.rows.map(row => {
        if (row.isGroup) {
          return {
            ...row,
            cells: [{
              ...row.cells[0],
              colSpan: prev.columns.length + 1
            }]
          };
        }
        return {
          ...row,
          cells: [...row.cells, {
            id: uuidv4(),
            type: 'static',
            content: "",
            editMode: false
          }]
        };
      })
    }));
  };

  useEffect(() => {
    setState(prev => {
      const updatedRows = prev.rows.map(row => {
        if (row.isGroup) {
          return {
            ...row,
            cells: [{
              ...row.cells[0],
              colSpan: prev.columns.length
            }]
          };
        }

        if (row.cells.length === prev.columns.length) return row;

        if (row.cells.length < prev.columns.length) {
          const additionalCells: UniversalCell[] = Array(prev.columns.length - row.cells.length)
            .fill(null)
            .map(() => ({
              id: uuidv4(),
              type: "static" as CellType,
              content: "Click to edit",
              editMode: false
            }));
          return {
            ...row,
            cells: [...row.cells, ...additionalCells]
          };
        }

        return {
          ...row,
          cells: row.cells.slice(0, prev.columns.length)
        };
      });

      if (JSON.stringify(updatedRows) === JSON.stringify(prev.rows)) return prev;

      return {
        ...prev,
        rows: updatedRows
      };
    });
  }, [state.columns.length]);

  const renderFormField = useCallback((field: FormField, rowId: string, cellId: string) => {
    const isEditing = editingLabelId === field.id;
    const mergedCellData = state.mergedCells.find(mc => mc.id === cellId);

    const handleFieldUpdate = (fieldId: string, newLabel: string) => {
      setState(prev => {
        if (mergedCellData) {
          return {
            ...prev,
            mergedCells: prev.mergedCells.map(mc =>
              mc.id === cellId
                ? {
                  ...mc,
                  content: mc.content.map((f: FormField) =>
                    f.id === fieldId
                      ? { ...f, label: newLabel }
                      : f
                  )
                }
                : mc
            )
          };
        }

        return {
          ...prev,
          rows: prev.rows.map(row =>
            row.id === rowId
              ? {
                ...row,
                cells: row.cells.map(cell =>
                  cell.id === cellId
                    ? {
                      ...cell,
                      content: cell.content.map((f: FormField) =>
                        f.id === fieldId
                          ? { ...f, label: newLabel }
                          : f
                      )
                    }
                    : cell
                )
              }
              : row
          )
        };
      });
    };

    const handleFieldDelete = (fieldId: string) => {
      setState(prev => {
        if (mergedCellData) {
          return {
            ...prev,
            mergedCells: prev.mergedCells.map(mc =>
              mc.id === cellId
                ? {
                  ...mc,
                  content: mc.content.filter((f: FormField) => f.id !== fieldId)
                }
                : mc
            )
          };
        }

        return {
          ...prev,
          rows: prev.rows.map(row =>
            row.id === rowId
              ? {
                ...row,
                cells: row.cells.map(cell =>
                  cell.id === cellId
                    ? {
                      ...cell,
                      content: cell.content.filter((f: FormField) => f.id !== fieldId)
                    }
                    : cell
                )
              }
              : row
          )
        };
      });
    };

    return (
      <div className="form-field" key={field.id}>
        <div className="field-header">
          {isEditing ? (
            <Input
              className="label-edit-input"
              value={field.label}
              onChange={e => handleFieldUpdate(field.id, e.target.value)}
              onPressEnter={() => setEditingLabelId(null)}
              onBlur={() => setEditingLabelId(null)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span
              className="field-label"
              onClick={(e) => {
                e.stopPropagation();
                setEditingLabelId(field.id);
              }}
            >
              {field.label}
            </span>
          )}
          <DeleteOutlined
            onClick={(e) => {
              e.stopPropagation();
              handleFieldDelete(field.id);
            }}
            className="delete-field-icon"
          />
        </div>
        <div className="field-content">
          {field.type === "text" && (
            <Input
              value={field.value}
              onChange={e => {
                // Update field value logic
              }}
              placeholder="Enter text"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {field.type === "number" && (
            <Input
              type="number"
              value={field.value}
              onChange={e => {
                // Update field value logic
              }}
              min={field.validation?.min}
              max={field.validation?.max}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {field.type === "select" && (
            <Select
              style={{ width: "100%" }}
              options={(field.options || []).map(o => ({ label: o, value: o }))}
              value={field.value}
              onChange={value => {
                // Update field value logic
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {field.type === "checkbox" && (
            <Checkbox
              checked={field.value}
              onChange={e => {
                // Update field value logic
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {field.label}
            </Checkbox>
          )}
          {field.type === "date" && (
            <DatePicker
              style={{ width: "100%" }}
              value={field.value ? dayjs(field.value) : null}
              onChange={date => {
                // Update field value logic
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {field.type === "textarea" && (
            <Input.TextArea
              value={field.value}
              onChange={e => {
                // Update field value logic
              }}
              placeholder="Enter text"
              autoSize={{ minRows: 2, maxRows: 6 }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
        {field.required && (
          <div className="field-required-badge">Required</div>
        )}
      </div>
    );
  }, [editingLabelId, setState, state.mergedCells]);

  const renderCell = useCallback((cell: UniversalCell, rowId: string, rowIndex: number, cellIndex: number) => {
    if (cell.type === "hidden" && (!cell.merged || cell.id !== state.mergedCells.find(mc => mc.id === cell.id)?.id)) {
      return null;
    }

    const mergedCellData = cell.merged ? state.mergedCells.find(mc => mc.id === cell.id) : null;
    
    const cellToRender = mergedCellData ? {
      ...cell,
      type: mergedCellData.type,
      content: mergedCellData.content,
      rowSpan: mergedCellData.rowSpan,
      colSpan: mergedCellData.colSpan
    } : cell;

    const renderFormFields = () => {
      const formContent = cell.merged ? mergedCellData?.content : cellToRender.content;
      
      if (!Array.isArray(formContent)) {
        return null;
      }

      return formContent.map((field: FormField) =>
        renderFormField(field, rowId, cell.id)
      );
    };

    const getPlaceholder = (type: CellType) => {
      switch (type) {
        case "static":
          return "Click to add value";
        case "group":
          return "Enter group name";
        case "form":
          return "Add form fields";
        default:
          return "Click to edit";
      }
    };

    const menu = (
      <Menu>
        <Menu.Item key="static" onClick={() => switchCellType(rowId, cell.id, "static")}>
          <FontColorsOutlined /> &nbsp; Static
        </Menu.Item>
        <Menu.Item key="form" onClick={() => switchCellType(rowId, cell.id, "form")}>
          <FormOutlined /> &nbsp; Form
        </Menu.Item>
      </Menu>
    );

    const selected = state.selectedCells.has(`${rowId}_${cell.id}`);
    const isActive = activeCell?.rowId === rowId && activeCell?.cellId === cell.id;
    const cellClassName = `
      universal-cell
      ${selected ? "selected" : ""}
      ${cellToRender.type}-cell
      ${isActive ? "editing" : ""}
      ${isDragging ? "dragging" : ""}
      ${cell.merged ? "merged-cell" : ""}
      ${!cellToRender.content ? "empty-cell" : ""}
    `.trim();

    const cellStyle: React.CSSProperties = {
      ...cellToRender.style,
      ...(mergedCellData?.style ? JSON.parse(mergedCellData.style) : {}),
    };

    const handleContentChange = (newContent: any) => {
      setState(prev => {
        if (cell.merged) {
          return {
            ...prev,
            mergedCells: prev.mergedCells.map(mc =>
              mc.id === cell.id
                ? { ...mc, content: newContent }
                : mc
            )
          };
        }
        return {
          ...prev,
          rows: prev.rows.map(row => ({
            ...row,
            cells: row.cells.map(c =>
              c.id === cell.id
                ? { ...c, content: newContent }
                : c
            )
          }))
        };
      });
    };

    return (
      <td
        key={cell.id}
        className={cellClassName}
        onClick={(e) => handleCellClick(cell, rowId, cell.id, e)}
        onMouseDown={(e) => handleMouseDown(rowIndex, cellIndex, e)}
        onMouseMove={() => handleMouseMove(rowIndex, cellIndex)}
        tabIndex={0}
        rowSpan={cellToRender.rowSpan}
        colSpan={cellToRender.colSpan}
        style={cellStyle}
      >
        <div className="cell-content">
          {cellToRender.type === "group" ? (
            <div className="group-cell">
              <div className="group-header">
                {isActive ? (
                  <Input
                    value={cellToRender.content}
                    onChange={e => handleContentChange(e.target.value)}
                    onPressEnter={() => setActiveCell(null)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    placeholder={getPlaceholder("group")}
                  />
                ) : (
                  <span className={!cellToRender.content ? "placeholder" : ""}>
                    {cellToRender.content || getPlaceholder("group")}
                  </span>
                )}
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    addChildRow(rowId);
                  }}
                />
              </div>
            </div>
          ) : cellToRender.type === "form" ? (
            <div className="form-cell">
              <div className="form-header">
                <span className="cell-badge form">Form</span>
                <Dropdown overlay={
                  <Menu>
                    {fieldTypeOptions.map(f => (
                      <Menu.Item
                        key={f.value}
                        onClick={() => {
                          addFormField(rowId, cell.id, f.value);
                        }}
                      >
                        {f.label}
                      </Menu.Item>
                    ))}
                  </Menu>
                }>
                  <Button
                    size="small"
                    icon={<PlusOutlined size={10} />}
                    className="add-field-button"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </div>
              <div className="form-fields">
                {renderFormFields() || (
                  <div className="placeholder form-placeholder">{getPlaceholder("form")}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="static-content">
              {isActive ? (
                <Input
                  value={cellToRender.content}
                  onChange={e => handleContentChange(e.target.value)}
                  onPressEnter={() => setActiveCell(null)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  placeholder={getPlaceholder("static")}
                />
              ) : (
                <span className={!cellToRender.content ? "placeholder" : ""}>
                  {cellToRender.content || getPlaceholder("static")}
                </span>
              )}
            </div>
          )}
        </div>
        {!cellToRender.type.includes("group") && (
          <div className="cell-type-dropdown">
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                size="small"
                className="cell-type-button"
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        )}
      </td>
    );
  }, [
    state.selectedCells,
    state.mergedCells,
    activeCell,
    isDragging,
    selectionMode,
    handleCellClick,
    switchCellType,
    addFormField,
    renderFormField,
    addChildRow,
    setState
  ]);

  const renderColumnHeader = useCallback((column: Column) => {
    const isEditing = editingColumnId === column.value;

    return (
      <th key={column.value} className="table-header">
        <div className="header-content">
          {isEditing ? (
            <Input
              className="header-edit-input"
              value={column.label}
              onChange={e => handleColumnEdit(column.value, e.target.value)}
              onPressEnter={() => setEditingColumnId(null)}
              onBlur={() => setEditingColumnId(null)}
              autoFocus
            />
          ) : (
            <>
              <span>{column.label}</span>
              <Space>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => setEditingColumnId(column.value)}
                  style={{ color: 'white' }}
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleColumnDelete(column.value)}
                  style={{ color: 'white' }}
                />
              </Space>
            </>
          )}
        </div>
      </th>
    );
  }, [editingColumnId, handleColumnEdit, handleColumnDelete]);

  const renderActionCell = useCallback((rowId: string) => (
    <td className="universal-cell actions-cell">
      <Button
        type="text"
        className="delete-action-button"
        onClick={(e) => {
          e.stopPropagation();
          handleRowDelete(rowId);
        }}
      >
        <DeleteOutlined style={{ color: '#ff4d4f' }} />
      </Button>
    </td>
  ), [handleRowDelete]);

  return (
    <div className="universal-table-card">
      <div className="toolbar">
        <Space>
          <Space>
            <Button onClick={() => addRow()}>
              <PlusOutlined size={10} /> Row
            </Button>
            <Button onClick={addGroup}>
              <FolderAddOutlined /> Group
            </Button>
            <Button onClick={handleAddColumn}>
              <PlusOutlined size={10} /> Column
            </Button>
          </Space>

          <Space>
            <Button
              type={selectionMode ? "primary" : "default"}
              onClick={() => setSelectionMode(!selectionMode)}
            >
          {selectionMode ? "Stop Select" : "Select"}
        </Button>
            <Button
              onClick={mergeCells}
              disabled={state.selectedCells.size < 2}
            >
              Merge ({state.selectedCells.size})
            </Button>
          </Space>
        </Space>
      </div>

      <div className="table-container">
        <table className="universal-table">
        <thead>
          <tr>
              {columns.map((col) => renderColumnHeader(col))}
              <th className="table-header actions-header">
                <span>Actions</span>
              </th>
          </tr>
        </thead>
        <tbody>
            {state.rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={`
                  table-row
                  ${row.isGroup ? "group-row" : ""}
                `.trim()}
                data-level={row.level}
              >
                {row.cells.map((cell, cellIndex) =>
                  renderCell(cell, row.id, rowIndex, cellIndex)
                )}
                {renderActionCell(row.id)}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default UniversalTable;