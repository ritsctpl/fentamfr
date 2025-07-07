import React, { useState, useCallback, useEffect } from "react";
import {Button,
  Input,
  Select,
  Checkbox,
  DatePicker,
  Dropdown,
  Menu,
  message,
  Space,
  Modal,
  InputNumber,
  Tooltip,
  Tag
} from "antd";
import {
  DownOutlined,
  DeleteOutlined,
  PlusOutlined,
  FolderAddOutlined,
  EditOutlined,
  FormOutlined,
  FontColorsOutlined,
  CalculatorOutlined,
  NumberOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  SettingOutlined,
  AlignLeftOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import "../styles/UniversalSmartTable.css";

export type CellType = "static" | "form" | "group" | "merged" | "hidden" | "formula" | "files" | "image" | "number" | "unit" |"date" | "text" | "select" | "checkbox" | "textarea";
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

interface ColumnSettings {
  defaultCellType: CellType;
  defaultFormula?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  width?: number;
  align?: 'left' | 'center' | 'right';
  editable?: boolean;
}

interface Column {
  label: string;
  value: string;
  isEditing?: boolean;
  settings: ColumnSettings;
}

interface CellReference {
  columnName: string;
  rowIndex: number;
}

interface FormulaContext {
  formula: string;
  dependencies: CellReference[];
}

interface CellValue {
  raw: any;
  formatted: string;
  type: CellType;
  unit?: string;
  formula?: FormulaContext;
}

// Add createCell function before it's used
const createCell = (type: CellType, columnSettings: ColumnSettings): UniversalCell => {
  const cell: UniversalCell = {
    id: uuidv4(),
    type,
    editMode: false,
    content: ""
  };

  switch (type) {
    case "unit":
      cell.content = {
        raw: null,
        formatted: "",
        unit: "kg"
      };
      break;
    case "number":
      cell.content = {
        raw: null,
        formatted: ""
      };
      break;
    case "formula":
      cell.content = {
        raw: null,
        formatted: "",
        formula: {
          formula: columnSettings.defaultFormula || "",
          dependencies: []
        }
      };
      break;
    case "form":
      cell.content = [];
      break;
    default:
      cell.content = "";
  }

  return cell;
};

const UNITS = {
  MASS: [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'mg', label: 'Milligrams (mg)' },
  ],
  LENGTH: [
    { value: 'km', label: 'Kilometers (km)' },
    { value: 'm', label: 'Meters (m)' },
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'mm', label: 'Millimeters (mm)' },
  ],
  VOLUME: [
    { value: 'L', label: 'Liters (L)' },
    { value: 'ml', label: 'Milliliters (ml)' },
  ],
  TIME: [
    { value: 'hr', label: 'Hours (hr)' },
    { value: 'min', label: 'Minutes (min)' },
    { value: 'sec', label: 'Seconds (sec)' },
  ]
};

const SIMPLE_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'm', label: 'm' },
  { value: 'cm', label: 'cm' },
  { value: 'L', label: 'L' },
  { value: 'ml', label: 'ml' },
  { value: 'pcs', label: 'pcs' }
];

const fieldTypeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Select', value: 'select' },
  { label: 'Checkbox', value: 'checkbox' }
] as const;

const defaultColumns: Column[] = [
  {
    label: "Column 1",
    value: "column1",
    settings: {
      defaultCellType: "static",
      editable: true,
      align: 'left'
    }
  },
  {
    label: "Column 2",
    value: "column2",
    settings: {
      defaultCellType: "static",
      editable: true,
      align: 'left'
    }
  }
];

const convertToBaseUnit = (value: number, unit: string): number => {
  switch (unit) {
    // Mass conversions
    case 'kg': return value * 1000; // convert to g
    case 'g': return value;
    case 'mg': return value / 1000;
    // Length conversions
    case 'm': return value * 100; // convert to cm
    case 'cm': return value;
    case 'mm': return value / 10;
    // Volume conversions
    case 'L': return value * 1000; // convert to ml
    case 'ml': return value;
    // Default case
    default: return value;
  }
};

const getUnitType = (unit: string): string => {
  if (['kg', 'g', 'mg'].includes(unit)) return 'mass';
  if (['m', 'cm', 'mm'].includes(unit)) return 'length';
  if (['L', 'ml'].includes(unit)) return 'volume';
  return 'other';
};

const convertFromBaseUnit = (value: number, targetUnit: string): number => {
  switch (targetUnit) {
    // Mass conversions
    case 'kg': return value / 1000; // from g
    case 'g': return value;
    case 'mg': return value * 1000;
    // Length conversions
    case 'm': return value / 100; // from cm
    case 'cm': return value;
    case 'mm': return value * 10;
    // Volume conversions
    case 'L': return value / 1000; // from ml
    case 'ml': return value;
    // Default case
    default: return value;
  }
};

// Add formatNumber function
const formatNumber = (value: number | null, unit?: string): string => {
  if (value === null || value === undefined) return unit || 'ERROR';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

// Add ColumnSettingsMenu component
const ColumnSettingsMenu: React.FC<{
  column: Column;
  onSettingsChange: (settings: ColumnSettings) => void;
}> = ({ column, onSettingsChange }) => {
  const cellTypeOptions = [
    { label: 'Static Text', value: 'static', icon: <FontColorsOutlined /> },
    { label: 'Number', value: 'number', icon: <NumberOutlined /> },
    { label: 'Unit', value: 'unit', icon: <FieldTimeOutlined /> },
    { label: 'Formula', value: 'formula', icon: <CalculatorOutlined /> },
    { label: 'Date', value: 'date', icon: <CalendarOutlined /> },
    { label: 'Form', value: 'form', icon: <FormOutlined /> }
  ];

  return (
    <Menu>
      <Menu.SubMenu key="cellType" title="Default Cell Type" icon={<FormOutlined />}>
        {cellTypeOptions.map(option => (
          <Menu.Item
            key={option.value}
            icon={option.icon}
            onClick={() => {
              const newSettings = {
                ...column.settings,
                defaultCellType: option.value as CellType
              };
              onSettingsChange(newSettings);
            }}
          >
            {option.label}
            {column.settings.defaultCellType === option.value && ' ✓'}
          </Menu.Item>
        ))}
      </Menu.SubMenu>

      {column.settings.defaultCellType === 'formula' && (
        <Menu.Item key="setFormula">
          <Input
            placeholder="Enter default formula"
            value={column.settings.defaultFormula || ''}
            onChange={e => {
              const newSettings = {
                ...column.settings,
                defaultFormula: e.target.value
              };
              onSettingsChange(newSettings);
            }}
            onClick={e => e.stopPropagation()}
          />
        </Menu.Item>
      )}

      <Menu.SubMenu key="alignment" title="Alignment" icon={<AlignLeftOutlined />}>
        <Menu.Item
          key="left"
          onClick={() => onSettingsChange({
            ...column.settings,
            align: 'left'
          })}
        >
          Left {column.settings.align === 'left' && ' ✓'}
        </Menu.Item>
        <Menu.Item
          key="center"
          onClick={() => onSettingsChange({
            ...column.settings,
            align: 'center'
          })}
        >
          Center {column.settings.align === 'center' && ' ✓'}
        </Menu.Item>
        <Menu.Item
          key="right"
          onClick={() => onSettingsChange({
            ...column.settings,
            align: 'right'
          })}
        >
          Right {column.settings.align === 'right' && ' ✓'}
        </Menu.Item>
      </Menu.SubMenu>

      <Menu.Item
        key="editable"
        onClick={() => onSettingsChange({
          ...column.settings,
          editable: !column.settings.editable
        })}
      >
        {column.settings.editable ? 'Make Read-only' : 'Make Editable'}
      </Menu.Item>

      {(column.settings.defaultCellType === 'number' || column.settings.defaultCellType === 'unit') && (
        <Menu.SubMenu key="validation" title="Validation" icon={<SafetyCertificateOutlined />}>
          <Menu.Item key="setRange">
            <Space direction="vertical" onClick={e => e.stopPropagation()}>
              <InputNumber
                placeholder="Min"
                value={column.settings.validation?.min}
                onChange={value => onSettingsChange({
                  ...column.settings,
                  validation: {
                    ...column.settings.validation,
                    min: value as number
                  }
                })}
              />
              <InputNumber
                placeholder="Max"
                value={column.settings.validation?.max}
                onChange={value => onSettingsChange({
                  ...column.settings,
                  validation: {
                    ...column.settings.validation,
                    max: value as number
                  }
                })}
              />
            </Space>
          </Menu.Item>
        </Menu.SubMenu>
      )}
    </Menu>
  );
};

const UniversalTable: React.FC = () => {
  const [state, setState] = useState<TableState>({
    columns: defaultColumns.map(col => col.value),
    rows: [],
    mergedCells: [],
    selectedCells: new Set()
  });
  const [selectionMode, setSelectionMode] = useState(false);
  const [editingColumn, setEditingColumn] = useState<{id: string, value: string} | null>(null);
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
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
      cells: columns.map(column => createCell(column.settings.defaultCellType, column.settings)),
      level: 0,
      expanded: true,
      isGroup: false
    };
    setState(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  }, [columns]);
  const addGroup = useCallback(() => {
    const groupRow: UniversalRow = {
      id: uuidv4(),
      cells: [{
        id: uuidv4(),
        type: "group",
        content: "",
        colSpan: state.columns.length,
        editMode: false,
        style: {
          backgroundColor: '#f5f5f5',  // Light gray background for group rows
          fontWeight: 'bold'
        }
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

      // Create new row with proper column types from settings
      const newRow: UniversalRow = {
        id: uuidv4(),
        cells: columns.map(column => createCell(column.settings.defaultCellType, column.settings)),
        level: prev.rows[parentIndex].level + 1,
        parentId: parentId,
        expanded: true,
        isGroup: false
      };

      // Find the last child of this parent to insert after
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
  }, [columns]);
  const switchCellType = useCallback((rowId: string, cellId: string, newType: CellType, columnIndex: number) => {
    setState(prev => {
      const column = columns[columnIndex];
      const mergedCell = prev.mergedCells.find(mc => mc.id === cellId);
      
      if (mergedCell) {
        return {
          ...prev,
          mergedCells: prev.mergedCells.map(mc =>
            mc.id === cellId
              ? {
                ...mc,
                type: newType,
                content: createCell(newType, column.settings).content
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
            cells: row.cells.map((cell, idx) =>
              cell.id === cellId
                ? {
                  ...cell,
                  type: newType,
                  content: createCell(newType, column.settings).content,
                  editMode: false
                }
                : cell
          ),
        };
      })
  };
    });
  }, [columns]);
  const addFormField = useCallback((rowId: string, cellId: string, fieldType: FormFieldType) => {
    const field: FormField = {
      id: uuidv4(),
      type: fieldType,
      label: "",
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
              c.id === cellId ? { ...c, editMode: true } : { ...c, editMode: false }
              )
            }))
          };
        });
      }
  }, [selectionMode]);
  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (activeCell && !(event.target as Element)?.closest('.universal-cell')) {
      setState(prev => {
        const updatedRows = prev.rows.map(row => {
          if (row.id === activeCell.rowId) {
          return {
              ...row,
              cells: row.cells.map(c => {
                if (c.id === activeCell.cellId) {
                  return {
                    ...c,
                    editMode: false,
                  };
                }
                return c;
              })
          };
        }
          return row;
        });

        return {
          ...prev,
          rows: updatedRows
        };
      });
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

    const overlappingMergedCells = state.mergedCells.filter(mc => {
      const mcEndRow = mc.startRow + mc.rowSpan - 1;
      const mcEndCol = mc.startCol + mc.colSpan - 1;
      return selectedCoords.some(coord => 
        coord.rowIndex >= mc.startRow && coord.rowIndex <= mcEndRow &&
        coord.cellIndex >= mc.startCol && coord.cellIndex <= mcEndCol
      );
    });

    const allMergedCellsToRemove = new Set(overlappingMergedCells.map(mc => mc.id));

    if (overlappingMergedCells.length > 0) {
      overlappingMergedCells.forEach(mc => {
        for (let i = mc.startRow; i < mc.startRow + mc.rowSpan; i++) {
          for (let j = mc.startCol; j < mc.startCol + mc.colSpan; j++) {
            const row = state.rows[i];
            if (row) {
              const cell = row.cells[j];
              if (cell) {
                selectedCoords.push({
                  rowIndex: i,
                  cellIndex: j,
                  rowId: row.id,
                  cellId: cell.id
                });
              }
            }
          }
        }
      });
    }

    const uniqueCoords = selectedCoords.filter((coord, index, self) =>
      index === self.findIndex(c => 
        c.rowIndex === coord.rowIndex && c.cellIndex === coord.cellIndex
      )
    );

    const rowIndices = uniqueCoords.map(coord => coord.rowIndex);
    const cellIndices = uniqueCoords.map(coord => coord.cellIndex);
    const minRow = Math.min(...rowIndices);
    const maxRow = Math.max(...rowIndices);
    const minCell = Math.min(...cellIndices);
    const maxCell = Math.max(...cellIndices);

    const isRectangular = uniqueCoords.length === (maxRow - minRow + 1) * (maxCell - minCell + 1);
    if (!isRectangular) {
      message.error("Selected cells must form a rectangle");
      return;
    }

    const firstCell = state.rows[minRow].cells[minCell];
    const firstCellColumn = columns[minCell];
    const mergedCellId = uuidv4();

    setState(prev => {
      const newRows = [...prev.rows];
      
      // Set all cells in the merge range to hidden except the first one
      for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCell; j <= maxCell; j++) {
          if (i === minRow && j === minCell) {
            // This is the main cell of the merge
          newRows[i].cells[j] = {
              ...firstCell,
              id: mergedCellId,
              merged: true,
              rowSpan: maxRow - minRow + 1,
              colSpan: maxCell - minCell + 1,
              style: {
                ...firstCell.style,
                textAlign: firstCellColumn.settings.align,
                pointerEvents: firstCellColumn.settings.editable ? 'auto' : 'none',
                opacity: firstCellColumn.settings.editable ? 1 : 0.7
              }
            };
          } else {
            // These are the cells that should be hidden
            newRows[i].cells[j] = {
              ...newRows[i].cells[j],
            type: "hidden",
            content: "",
              merged: true,
              style: { display: 'none' }
          };
          }
        }
      }

      // Create the merged cell record
      const newMergedCell: MergedCell = {
        id: mergedCellId,
        startRow: minRow,
        startCol: minCell,
        rowSpan: maxRow - minRow + 1,
        colSpan: maxCell - minCell + 1,
        type: firstCell.type,
        content: firstCell.content,
        style: JSON.stringify({
          ...firstCell.style,
          textAlign: firstCellColumn.settings.align,
          pointerEvents: firstCellColumn.settings.editable ? 'auto' : 'none',
          opacity: firstCellColumn.settings.editable ? 1 : 0.7
        })
      };

      return {
        ...prev,
        rows: newRows,
        mergedCells: [
          ...prev.mergedCells.filter(mc => !allMergedCellsToRemove.has(mc.id)),
          newMergedCell
        ],
        selectedCells: new Set()
      };
    });

    message.success("Cells merged successfully");
  }, [state.rows, state.selectedCells, state.mergedCells, columns]);
  const handleColumnEdit = (columnId: string, newLabel: string) => {
    setEditingColumn({ id: columnId, value: newLabel });
  };
  const saveColumnEdit = () => {
    if (editingColumn) {
      setColumns(prevColumns =>
        prevColumns.map(col =>
          col.value === editingColumn.id ? { ...col, label: editingColumn.value } : col
        )
      );
      setEditingColumn(null);
    }
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
        setState(prev => {
          const columnIndex = prev.columns.indexOf(columnId);
          if (columnIndex === -1) return prev;
          const updatedMergedCells = prev.mergedCells.map(mc => {
            if (mc.startCol <= columnIndex && mc.startCol + mc.colSpan > columnIndex) {
              return {
                ...mc,
                colSpan: Math.max(1, mc.colSpan - 1),
                startCol: mc.startCol === columnIndex ? Math.max(0, mc.startCol - 1) : mc.startCol
              };
            }
            else if (mc.startCol > columnIndex) {
              return {
                ...mc,
                startCol: mc.startCol - 1
              };
            }
            return mc;
          }).filter(mc => mc.colSpan > 0);
          const updatedRows = prev.rows.map(row => {
            if (row.isGroup) {
              return {
                ...row,
                cells: [{
                  ...row.cells[0],
                  colSpan: prev.columns.length - 1
                }]
              };
            }
            const updatedCells = row.cells.filter((_, index) => index !== columnIndex);
            return {
              ...row,
              cells: updatedCells
            };
          });
          return {
            ...prev,
            columns: prev.columns.filter(col => col !== columnId),
            rows: updatedRows,
            mergedCells: updatedMergedCells
          };
        });
        setColumns(prevColumns => prevColumns.filter(col => col.value !== columnId));
      }
    });
  };
  const handleRowDelete = useCallback((rowId: string) => {
    const row = state.rows.find(r => r.id === rowId);
    const childRows = state.rows.filter(r => r.parentId === rowId);
    const rowIndex = state.rows.findIndex(r => r.id === rowId);

    // Find all merged cells affected by this row deletion
    const affectedMergedCells = state.mergedCells.filter(mc => {
      const mcEndRow = mc.startRow + mc.rowSpan - 1;
      return rowIndex >= mc.startRow && rowIndex <= mcEndRow;
    });

    // If row is part of any merged cells, handle carefully
    if (affectedMergedCells.length > 0) {
      setState(prev => {
        let updatedRows = [...prev.rows];
        let updatedMergedCells = [...prev.mergedCells];

        // Handle each affected merged cell
        affectedMergedCells.forEach(mc => {
          const mcEndRow = mc.startRow + mc.rowSpan - 1;
          const isFirstRow = rowIndex === mc.startRow;
          const isLastRow = rowIndex === mcEndRow;
          const isSingleRowMerge = mc.rowSpan === 1;

          if (isSingleRowMerge) {
            // If it's a single row merge, remove the merge
            updatedMergedCells = updatedMergedCells.filter(cell => cell.id !== mc.id);
            
            // Restore original cells
            updatedRows = updatedRows.map(r => {
              if (r.id === rowId) {
                return {
                  ...r,
                  cells: r.cells.map((c, colIdx) => {
                    if (colIdx >= mc.startCol && colIdx < mc.startCol + mc.colSpan) {
                      return createCell(columns[colIdx].settings.defaultCellType, columns[colIdx].settings);
                    }
                    return c;
                  })
                };
              }
              return r;
            });
          } else if (isFirstRow) {
            // Move merge to next row
            const newStartRow = mc.startRow + 1;
            const newRowSpan = mc.rowSpan - 1;

            updatedMergedCells = updatedMergedCells.map(cell => {
              if (cell.id === mc.id) {
                return {
                  ...cell,
                  startRow: newStartRow,
                  rowSpan: newRowSpan
                };
              }
              return cell;
            });

            // Update cells in the new start row
            updatedRows = updatedRows.map((r, idx) => {
              if (idx === newStartRow) {
                return {
                  ...r,
                  cells: r.cells.map((c, colIdx) => {
                    if (colIdx >= mc.startCol && colIdx < mc.startCol + mc.colSpan) {
                      if (colIdx === mc.startCol) {
                        return {
                          ...c,
                          id: mc.id,
                          type: mc.type,
                          content: mc.content,
                          merged: true,
                          rowSpan: newRowSpan,
                          colSpan: mc.colSpan,
                          style: JSON.parse(mc.style || '{}')
                        };
                      } else {
                        return {
                          ...c,
                          type: "hidden",
                          content: "",
                          merged: true,
                          style: { display: 'none' }
                        };
                      }
                    }
                    return c;
                  })
                };
              }
              return r;
            });
          } else if (isLastRow) {
            // Just decrease rowSpan
            updatedMergedCells = updatedMergedCells.map(cell => {
              if (cell.id === mc.id) {
                return {
                  ...cell,
                  rowSpan: cell.rowSpan - 1
                };
              }
              return cell;
            });
          } else {
            // Middle row - maintain merge but decrease rowSpan
            updatedMergedCells = updatedMergedCells.map(cell => {
              if (cell.id === mc.id) {
                return {
                  ...cell,
                  rowSpan: cell.rowSpan - 1
                };
              }
              return cell;
            });
          }
        });

        // Remove the row
        updatedRows = updatedRows.filter(r => r.id !== rowId);

        // Update all merged cell indices after row removal
        updatedMergedCells = updatedMergedCells.map(mc => {
          // Find the actual current position of this merge
          const mcRowIndex = updatedRows.findIndex(r => 
            r.cells.some(c => c.id === mc.id && c.type === mc.type)
          );
          
          if (mcRowIndex !== -1) {
            // Adjust any affected formulas in merged cells
            const mergedContent = mc.content;
            if (mergedContent?.formula) {
              const updatedFormula = updateFormulasAfterRowDelete(
                mergedContent.formula.formula,
                rowIndex,
                updatedRows
              );
              mc.content = {
                ...mergedContent,
                formula: {
                  ...mergedContent.formula,
                  formula: updatedFormula
                }
              };
            }

            return {
              ...mc,
              startRow: mcRowIndex
            };
          }
          return mc;
        });

        // Handle group row deletion
        if (row?.isGroup) {
          // Remove any merges that were entirely within this group
          updatedMergedCells = updatedMergedCells.filter(mc => {
            const mcEndRow = mc.startRow + mc.rowSpan - 1;
            const groupEndRow = rowIndex + childRows.length;
            return !(mc.startRow >= rowIndex && mcEndRow <= groupEndRow);
          });
        }

        return {
          ...prev,
          rows: updatedRows,
          mergedCells: updatedMergedCells
        };
      });
    } else if (row?.isGroup && childRows.length > 0) {
      // Handle group deletion
      Modal.confirm({
        title: 'Delete Group',
        content: `This group contains ${childRows.length} row(s). Deleting it will also delete all its child rows. Are you sure?`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: () => {
          setState(prev => {
            // Get all rows to be deleted
            const rowsToDelete = new Set([rowId, ...childRows.map(r => r.id)]);
            
            // Remove any merges that involve these rows
            const updatedMergedCells = prev.mergedCells.filter(mc => {
              const mcEndRow = mc.startRow + mc.rowSpan - 1;
              const affectedRows = prev.rows.slice(mc.startRow, mcEndRow + 1);
              return !affectedRows.some(r => rowsToDelete.has(r.id));
            });

            return {
            ...prev,
              rows: prev.rows.filter(r => !rowsToDelete.has(r.id)),
              mergedCells: updatedMergedCells
            };
          });
        }
      });
    } else {
      // Simple row deletion
      setState(prev => ({
        ...prev,
        rows: prev.rows.filter(r => r.id !== rowId)
      }));
    }
  }, [state.rows, state.mergedCells, columns]);

  // Helper function to update formulas after row deletion
  const updateFormulasAfterRowDelete = (formula: string, deletedRowIndex: number, updatedRows: UniversalRow[]): string => {
    // Update cell references in formula to account for row deletion
    return formula.replace(/col(\d+)/g, (match, colNum) => {
      const colIndex = parseInt(colNum) - 1;
      // Adjust formula references if they point to rows after the deleted row
      if (colIndex >= 0 && colIndex < columns.length) {
        return `col${colNum}`;
      }
      return match;
    });
  };

  const handleAddColumn = () => {
    const columnNumber = columns.length + 1;
    const newColumn: Column = {
      label: `Column ${columnNumber}`,
      value: `column${columnNumber}`,
      settings: {
        defaultCellType: "static",
        editable: true,
        align: 'left'
      }
    };
    setColumns(prevColumns => [...prevColumns, newColumn]);
    setState(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn.value],
      rows: prev.rows.map(row => {
        // For group rows, just update the colSpan
        if (row.isGroup) {
          return {
            ...row,
            cells: [{
              ...row.cells[0],
              colSpan: prev.columns.length + 1
            }]
          };
        }
        // For regular rows, add the new cell
        return {
          ...row,
          cells: [...row.cells, createCell(newColumn.settings.defaultCellType, newColumn.settings)]
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
    const isEditing = editingColumn?.id === field.id;
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
              value={editingColumn?.value || ""}
              placeholder="Enter field label"
              onChange={e => {
                e.stopPropagation();
                setEditingColumn(prev => prev ? { ...prev, value: e.target.value } : null);
              }}
              onPressEnter={(e) => {
                e.stopPropagation();
                if (editingColumn) {
                  handleFieldUpdate(field.id, editingColumn.value);
                }
                setEditingColumn(null);
              }}
              onBlur={(e) => {
                e.stopPropagation();
                if (editingColumn) {
                  handleFieldUpdate(field.id, editingColumn.value);
                }
                setEditingColumn(null);
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            field.label ?
            <span
              className="field-label"
              onClick={(e) => {
                e.stopPropagation();
                setEditingColumn({ id: field.id, value: field.label });
              }}
            >
              {field.label}
            </span>
            :
            <span className="field-label-placeholder"
              onClick={(e) => {
                e.stopPropagation();
                setEditingColumn({ id: field.id, value: field.label || "" });
              }}
            >
              Enter field label
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
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {field.type === "checkbox" && (
            <Checkbox
              checked={field.value}
              onChange={e => {
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
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {field.type === "textarea" && (
            <Input.TextArea
              value={field.value}
              onChange={e => {
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
  }, [editingColumn, setState, state.mergedCells]);
  const handleContentChange = (rowId: string, cellId: string, newContent: any) => {
    setState(prev => {
      // First update the target cell
      let updatedRows = prev.rows.map(row => ({
        ...row,
        cells: row.cells.map(c =>
          c.id === cellId ? { ...c, content: newContent } : c
        )
      }));

      // Find and update dependent formulas
      updatedRows = updatedRows.map((row, rowIdx) => ({
        ...row,
        cells: row.cells.map((cell, colIdx) => {
          if (cell.type === "formula") {
            const formula = cell.content?.formula?.formula;
            if (formula) {
              const result = evaluateFormula(formula, (columnName, _rowIdx) => {
                const colIndex = parseInt(columnName.replace('col', '')) - 1;
                const targetRow = updatedRows[rowIdx];
                if (!targetRow) return null;
                const targetCell = targetRow.cells[colIndex];
                if (!targetCell) return null;
                return targetCell.content;
              });

              return {
                ...cell,
                content: {
                  ...cell.content,
                  raw: result.value,
                  formatted: result.value !== null ? formatNumber(result.value, result.unit) : '',
                  unit: result.unit
                }
              };
            }
          }
          return cell;
        })
      }));

      return {
        ...prev,
        rows: updatedRows
      };
    });
  };

  // Move parseFormula inside the component to access columns state
  const parseFormula = useCallback((formula: string): string => {
    // Handle col1:col3* pattern (multiply range)
    const multiplyRangePattern = /col(\d+):col(\d+)\*/i;
    const mulRangeMatch = formula.match(multiplyRangePattern);
    
    if (mulRangeMatch) {
      const startCol = parseInt(mulRangeMatch[1]);
      const endCol = parseInt(mulRangeMatch[2]);
      const expandedCols = [];
      
      for (let i = startCol; i <= endCol; i++) {
        expandedCols.push(`col${i}`);
      }
      
      return formula.replace(multiplyRangePattern, expandedCols.join('*'));
    }

    // Handle col1:col3 pattern (add range)
    const addRangePattern = /col(\d+):col(\d+)(?!\*)/i;
    const addRangeMatch = formula.match(addRangePattern);
    
    if (addRangeMatch) {
      const startCol = parseInt(addRangeMatch[1]);
      const endCol = parseInt(addRangeMatch[2]);
      const expandedCols = [];
      
      for (let i = startCol; i <= endCol; i++) {
        expandedCols.push(`col${i}`);
      }
      
      return formula.replace(addRangePattern, expandedCols.join('+'));
    }

    // Handle col1+n pattern (add all columns after col1)
    const plusNPattern = /col(\d+)\+n/i;
    const match = formula.match(plusNPattern);
    
    if (match) {
      const startCol = parseInt(match[1]);
      const expandedCols = [];
      
      for (let i = startCol; i <= columns.length; i++) {
        expandedCols.push(`col${i}`);
      }
      
      return formula.replace(plusNPattern, expandedCols.join('+'));
    }

    // Handle col1*n pattern (multiply all columns after col1)
    const multiplyNPattern = /col(\d+)\*n/i;
    const mulMatch = formula.match(multiplyNPattern);
    
    if (mulMatch) {
      const startCol = parseInt(mulMatch[1]);
      const expandedCols = [];
      
      for (let i = startCol; i <= columns.length; i++) {
        expandedCols.push(`col${i}`);
      }
      
      return formula.replace(multiplyNPattern, expandedCols.join('*'));
    }

    return formula;
  }, [columns]);

  const evaluateFormula = useCallback((formula: string, getColumnValue: (columnName: string, rowIndex: number) => CellValue | null): { value: number | null, unit: string | null } => {
    try {
      // First parse the simplified formula into expanded form
      const expandedFormula = parseFormula(formula.toLowerCase());
      
      const columnRefs = expandedFormula.match(/col\d+/g) || [];
      const dependencies: CellReference[] = columnRefs.map(ref => ({
        columnName: ref,
        rowIndex: -1
      }));

      // Get all values and their units
      const values = columnRefs.map(columnRef => {
        const cellValue = getColumnValue(columnRef, dependencies[0].rowIndex);
        if (!cellValue || cellValue.raw === null || cellValue.raw === undefined) {
          return { value: null, unit: null };
        }
        return {
          value: Number(cellValue.raw),
          unit: cellValue.unit || null
        };
      });

      // Check if any value is null/undefined
      if (values.some(v => v.value === null)) {
        return { value: null, unit: null };
      }

      // Check if all values have units and are of the same type
      const units = values.map(v => v.unit).filter(Boolean);
      if (units.length > 0) {
        const firstUnitType = getUnitType(units[0]);
        const allSameType = units.every(unit => getUnitType(unit) === firstUnitType);
        
        if (!allSameType) {
          throw new Error('Cannot mix different unit types in calculation');
        }

        // Convert all values to base unit
        const baseValues = values.map(v => {
          if (v.value === null || !v.unit) return null;
          return convertToBaseUnit(v.value, v.unit);
        });

        if (baseValues.includes(null)) return { value: null, unit: null };

        // Create evaluation string with converted values
        let evalStr = expandedFormula;
        columnRefs.forEach((ref, i) => {
          evalStr = evalStr.replace(ref, baseValues[i]?.toString() || '0');
        });

        // Validate formula before evaluation
        if (!/^[0-9+\-*/(). ]+$/.test(evalStr)) {
          return { value: null, unit: null };
        }

        const result = Function(`"use strict"; return (${evalStr})`)();
        
        // Return result in the same unit as the first value with a unit
        const targetUnit = values.find(v => v.unit)?.unit || 'g';
        return {
          value: convertFromBaseUnit(result, targetUnit),
          unit: targetUnit
        };
      }

      // If no units involved, perform regular calculation
      let evalStr = expandedFormula;
      columnRefs.forEach((ref, i) => {
        evalStr = evalStr.replace(ref, values[i].value?.toString() || '0');
      });

      if (!/^[0-9+\-*/(). ]+$/.test(evalStr)) {
        return { value: null, unit: null };
      }

      return {
        value: Function(`"use strict"; return (${evalStr})`)(),
        unit: null
      };
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return { value: null, unit: null };
    }
  }, [parseFormula]);

  const handleFormulaChange = useCallback((rowId: string, cellId: string, formula: string) => {
    const result = evaluateFormula(formula, (columnName, rowIdx) => {
      const colIndex = parseInt(columnName.replace('col', '')) - 1;
      const targetRow = state.rows[rowIdx];
      if (!targetRow) return null;
      const targetCell = targetRow.cells[colIndex];
      if (!targetCell) return null;
      return targetCell.content;
    });
    
    handleContentChange(rowId, cellId, {
      raw: result.value,
      formatted: formatNumber(result.value, result.unit),
      formula: { formula },
      unit: result.unit
    });
  }, [state.rows, evaluateFormula, handleContentChange]);

  const renderCell = useCallback((cell: UniversalCell, rowId: string, rowIndex: number, cellIndex: number) => {
    // Skip rendering completely hidden cells
    if (cell.type === "hidden" && cell.style?.display === 'none') {
      return null;
    }

    const mergedCellData = cell.merged ? state.mergedCells.find(mc => mc.id === cell.id) : null;
    
    // Use merged cell data if available
    const cellToRender = mergedCellData ? {
      ...cell,
      type: mergedCellData.type,
      content: mergedCellData.content,
      rowSpan: mergedCellData.rowSpan,
      colSpan: mergedCellData.colSpan,
      style: JSON.parse(mergedCellData.style || '{}')
    } : cell;

    const column = columns[cellIndex];
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
        case "formula":
          return "Enter formula";
        case "number":
          return "Enter number";
        case "unit":
          return "Enter unit";
        case "date":
          return "Enter date"; 
        default:
          return "Click to edit";
      }
    };
    const menu = (
      <Menu>
        <Menu.Item key="static" onClick={() => switchCellType(rowId, cell.id, "static", cellIndex)}>
          <FontColorsOutlined /> &nbsp; Static
        </Menu.Item>
        <Menu.Item key="form" onClick={() => switchCellType(rowId, cell.id, "form", cellIndex)}>
          <FormOutlined /> &nbsp; Form
        </Menu.Item>
        <Menu.Item key="formula" onClick={() => switchCellType(rowId, cell.id, "formula", cellIndex)}>
          <CalculatorOutlined /> &nbsp; Formula
        </Menu.Item>
        <Menu.Item key="number" onClick={() => switchCellType(rowId, cell.id, "number", cellIndex)}>
          <NumberOutlined /> &nbsp; Number
        </Menu.Item>
        <Menu.Item key="unit" onClick={() => switchCellType(rowId, cell.id, "unit", cellIndex)}>
          <FieldTimeOutlined /> &nbsp; Unit
        </Menu.Item>
        <Menu.Item key="date" onClick={() => switchCellType(rowId, cell.id, "date", cellIndex)}>
          <CalendarOutlined /> &nbsp; Date
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
      ${!column.settings.editable ? "readonly" : ""}
    `.trim();
    const cellStyle: React.CSSProperties = {
      ...cellToRender.style,
      ...(mergedCellData?.style ? JSON.parse(mergedCellData.style) : {}),
      textAlign: column.settings.align,
      pointerEvents: column.settings.editable ? 'auto' : 'none',
      opacity: column.settings.editable ? 1 : 0.7
    };
    const validateNumber = (value: number | null) => {
      if (value === null) return true;
      const { min, max } = column.settings.validation || {};
      if (min !== undefined && value < min) return false;
      if (max !== undefined && value > max) return false;
      return true;
    };
    const handleNumberChange = (value: number | null) => {
      if (!validateNumber(value)) {
        message.error(`Value must be between ${column.settings.validation?.min || '-∞'} and ${column.settings.validation?.max || '∞'}`);
        return;
      }
      
      const newContent = {
        raw: value,
        formatted: formatNumber(value)
      };
      
      handleContentChange(rowId, cell.id, newContent);
    };

    const handleUnitChange = (value: number | null, unit: string) => {
      if (!validateNumber(value)) {
        message.error(`Value must be between ${column.settings.validation?.min || '-∞'} and ${column.settings.validation?.max || '∞'}`);
        return;
      }
      const newContent = {
        raw: value,
        formatted: formatNumber(value),
        unit: unit
      };
      
      handleContentChange(rowId, cell.id, newContent);
    };
    const renderCellContent = () => {
      switch (cellToRender.type) {
        case "number":
          return (
            <div className="number-cell">
              {isActive ? (
                <InputNumber
                  value={cellToRender.content?.raw ?? ""}
                  onChange={value => handleNumberChange(value)}
                  onPressEnter={() => setActiveCell(null)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  style={{ width: '100%' }}
                />
              ) : (
                <span className={!cellToRender.content.formatted ? "placeholder" : ""}>
                  {cellToRender.content?.formatted || getPlaceholder("number")}
                </span>
              )}
            </div>
          );

        case "unit":
          return (
            <div className="unit-cell">
              {isActive ? (
                <Space.Compact style={{ width: '100%' }}>
                  <InputNumber
                    value={cellToRender.content?.raw ?? ""}
                    onChange={value => handleNumberChange(value)}
                    style={{ width: '60%' }}
                    min={column.settings.validation?.min}
                    max={column.settings.validation?.max}
                    onPressEnter={() => setActiveCell(null)}
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                  />
                  <Select
                    value={cellToRender.content?.unit || 'kg'}
                    onChange={unit => handleUnitChange(cellToRender.content?.raw, unit)}
                    style={{ width: '40%' }}
                    options={SIMPLE_UNITS}
                    placeholder="Unit"
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                    dropdownStyle={{ zIndex: 1001 }}
                  />
                </Space.Compact>
              ) : (
                <span className={!cellToRender.content?.unit ? "placeholder" : ""}>
                  {cellToRender.content?.unit ? 
                    (cellToRender.content.raw !== null && cellToRender.content.raw !== undefined) ? 
                      formatNumber(cellToRender.content.raw, cellToRender.content.unit) : 
                      cellToRender.content.unit 
                    : getPlaceholder("unit")}
                </span>
              )}
            </div>
          );

        case "date":
          return (
            <div className="date-cell">
              {isActive ? (
                <DatePicker
                  value={cellToRender.content?.raw ? dayjs(cellToRender.content.raw) : null}
                  onChange={date => handleContentChange(rowId, cell.id, {
                    raw: date?.toDate(),
                    formatted: date?.format('YYYY-MM-DD') || ''
                  })}
                  style={{ width: '100%' }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <span className={!cellToRender.content ? "placeholder" : ""}>
                  {cellToRender.content?.formatted || getPlaceholder("date")}
                </span>
              )}
            </div>
          );

        case "formula":
          return (
            <div className="formula-cell">
              {isActive ? (
                <Tooltip title="Use patterns like col1:col3 (add) or col1:col3* (multiply)">
                  <Input
                    value={cellToRender.content?.formula?.formula ?? ""}
                    onChange={e => handleFormulaChange(rowId, cell.id, e.target.value.toLowerCase())}
                    prefix={<CalculatorOutlined />}
                    placeholder="Enter formula (e.g., col1:col3 or col1:col3*)"
                    onPressEnter={() => setActiveCell(null)}
                    onClick={e => e.stopPropagation()}
                    autoFocus
                  />
                </Tooltip>
              ) : (
                <Tooltip title={cellToRender.content?.formula?.formula || ""}>
                  <span className={!cellToRender.content ? "placeholder" : ""}>
                    {cellToRender.content?.formatted || getPlaceholder("formula")}
                  </span>
                </Tooltip>
              )}
            </div>
          );

        default:
          return (
            <div className="static-content">
              {isActive ? (
                <Input
                  value={cellToRender.content}
                  onChange={e => handleContentChange(rowId, cell.id, e.target.value)}
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
          );
      }
    };
    return (
      <td
        key={cell.id}
        className={cellClassName}
        onClick={(e) => column.settings.editable && handleCellClick(cell, rowId, cell.id, e)}
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
                    onChange={e => handleContentChange(rowId, cell.id, e.target.value)}
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
            renderCellContent()
              )}
            </div>
        {!cellToRender.type.includes("group") && column.settings.editable && (
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
    setState,
    columns,
    handleFormulaChange
  ]);
  const handleColumnSettingsChange = (columnIndex: number, newSettings: ColumnSettings) => {
    // First update the column settings
    setColumns(prevColumns => 
      prevColumns.map((col, idx) =>
        idx === columnIndex ? { ...col, settings: newSettings } : col
      )
    );

    // Then update cells, respecting merged cells and group rows
    setState(prev => {
      let updatedRows = [...prev.rows];
      let updatedMergedCells = [...prev.mergedCells];

      // Find all merged cells that include this column
      const affectedMergedCells = prev.mergedCells.filter(mc => 
        columnIndex >= mc.startCol && columnIndex < mc.startCol + mc.colSpan
      );

      // Update merged cells first
      if (affectedMergedCells.length > 0) {
        updatedMergedCells = prev.mergedCells.map(mc => {
          if (columnIndex >= mc.startCol && columnIndex < mc.startCol + mc.colSpan) {
            // Only update type if this is the starting column of the merge
            if (columnIndex === mc.startCol) {
              const newCell = createCell(newSettings.defaultCellType, newSettings);
              // If it's a formula type, apply the default formula
              if (newSettings.defaultCellType === 'formula' && newSettings.defaultFormula) {
                const result = evaluateFormula(newSettings.defaultFormula, (columnName, rowIdx) => {
                  const colIndex = parseInt(columnName.replace('col', '')) - 1;
                  const targetRow = prev.rows[rowIdx];
                  if (!targetRow) return null;
                  const targetCell = targetRow.cells[colIndex];
                  if (!targetCell) return null;
                  return targetCell.content;
                });
                newCell.content = {
                  raw: result.value,
                  formatted: formatNumber(result.value, result.unit),
                  formula: { formula: newSettings.defaultFormula },
                  unit: result.unit
                };
              }
              return {
                ...mc,
                type: newSettings.defaultCellType,
                content: newCell.content,
                style: JSON.stringify({
                  ...JSON.parse(mc.style || '{}'),
                  textAlign: newSettings.align,
                  pointerEvents: newSettings.editable ? 'auto' : 'none',
                  opacity: newSettings.editable ? 1 : 0.7
                })
              };
            }
            return mc;
          }
          return mc;
        });

        // Update the rows that contain merged cells
        updatedRows = updatedRows.map((row, rowIndex) => {
          // Skip group rows
          if (row.isGroup) return row;

          const rowMergedCells = affectedMergedCells.filter(mc => 
            rowIndex >= mc.startRow && rowIndex < mc.startRow + mc.rowSpan
          );

          if (rowMergedCells.length > 0) {
            return {
              ...row,
              cells: row.cells.map((cell, colIndex) => {
                const mergedCell = rowMergedCells.find(mc => 
                  colIndex >= mc.startCol && colIndex < mc.startCol + mc.colSpan
                );

                if (mergedCell && colIndex === columnIndex) {
                  if (rowIndex === mergedCell.startRow && colIndex === mergedCell.startCol) {
                    // This is the main cell of the merge
                    const newCell = createCell(newSettings.defaultCellType, newSettings);
                    // If it's a formula type, apply the default formula
                    if (newSettings.defaultCellType === 'formula' && newSettings.defaultFormula) {
                      const result = evaluateFormula(newSettings.defaultFormula, (columnName, rowIdx) => {
                        const colIndex = parseInt(columnName.replace('col', '')) - 1;
                        const targetRow = prev.rows[rowIdx];
                        if (!targetRow) return null;
                        const targetCell = targetRow.cells[colIndex];
                        if (!targetCell) return null;
                        return targetCell.content;
                      });
                      newCell.content = {
                        raw: result.value,
                        formatted: formatNumber(result.value, result.unit),
                        formula: { formula: newSettings.defaultFormula },
                        unit: result.unit
                      };
                    }
                    return {
                      ...cell,
                      type: newSettings.defaultCellType,
                      content: newCell.content,
                      merged: true,
                      rowSpan: mergedCell.rowSpan,
                      colSpan: mergedCell.colSpan,
                      style: {
                        ...cell.style,
                        textAlign: newSettings.align,
                        pointerEvents: newSettings.editable ? 'auto' : 'none',
                        opacity: newSettings.editable ? 1 : 0.7
                      }
                    };
                  } else {
                    // This is a hidden cell in the merge
                    return {
                      ...cell,
                      type: "hidden",
                      content: "",
                      merged: true,
                      style: { display: 'none' }
                    };
                  }
                }
                return cell;
              })
            };
          }

          // For non-merged cells in this column
          return {
            ...row,
            cells: row.cells.map((cell, idx) => {
              if (idx === columnIndex && !cell.merged) {
                const newCell = createCell(newSettings.defaultCellType, newSettings);
                // If it's a formula type, apply the default formula
                if (newSettings.defaultCellType === 'formula' && newSettings.defaultFormula) {
                  const result = evaluateFormula(newSettings.defaultFormula, (columnName, rowIdx) => {
                    const colIndex = parseInt(columnName.replace('col', '')) - 1;
                    const targetRow = prev.rows[rowIdx];
                    if (!targetRow) return null;
                    const targetCell = targetRow.cells[colIndex];
                    if (!targetCell) return null;
                    return targetCell.content;
                  });
                  newCell.content = {
                    raw: result.value,
                    formatted: formatNumber(result.value, result.unit),
                    formula: { formula: newSettings.defaultFormula },
                    unit: result.unit
                  };
                }
                return newCell;
              }
              return cell;
            })
          };
        });
      } else {
        // No merged cells affected, just update regular cells
        updatedRows = updatedRows.map(row => {
          if (row.isGroup) return row;
          
          return {
            ...row,
            cells: row.cells.map((cell, idx) => {
              if (idx === columnIndex && !cell.merged) {
                const newCell = createCell(newSettings.defaultCellType, newSettings);
                // If it's a formula type, apply the default formula
                if (newSettings.defaultCellType === 'formula' && newSettings.defaultFormula) {
                  const result = evaluateFormula(newSettings.defaultFormula, (columnName, rowIdx) => {
                    const colIndex = parseInt(columnName.replace('col', '')) - 1;
                    const targetRow = prev.rows[rowIdx];
                    if (!targetRow) return null;
                    const targetCell = targetRow.cells[colIndex];
                    if (!targetCell) return null;
                    return targetCell.content;
                  });
                  newCell.content = {
                    raw: result.value,
                    formatted: formatNumber(result.value, result.unit),
                    formula: { formula: newSettings.defaultFormula },
                    unit: result.unit
                  };
                }
                return newCell;
              }
              return cell;
            })
          };
        });
      }

      // Re-evaluate all formulas in the table after cell updates
      updatedRows = updatedRows.map((row, rowIdx) => ({
        ...row,
        cells: row.cells.map((cell, colIdx) => {
          if (cell.type === 'formula' && cell.content?.formula?.formula) {
            const result = evaluateFormula(cell.content.formula.formula, (columnName, _rowIdx) => {
              const colIndex = parseInt(columnName.replace('col', '')) - 1;
              const targetRow = updatedRows[rowIdx];
              if (!targetRow) return null;
              const targetCell = targetRow.cells[colIndex];
              if (!targetCell) return null;
              return targetCell.content;
            });
            return {
              ...cell,
              content: {
                ...cell.content,
                raw: result.value,
                formatted: formatNumber(result.value, result.unit),
                unit: result.unit
              }
            };
          }
          return cell;
        })
      }));

      return {
        ...prev,
        rows: updatedRows,
        mergedCells: updatedMergedCells
      };
    });
  };
  const renderColumnHeader = useCallback((column: Column, columnIndex: number) => {
    const isEditing = editingColumn?.id === column.value;
    
    const handleSettingsChange = (newSettings: ColumnSettings) => {
      handleColumnSettingsChange(columnIndex, newSettings);
    };

    return (
      <th 
        key={column.value} 
        className="table-header"
        style={{ textAlign: column.settings.align }}
      >
        <div className="header-content">
          {isEditing ? (
            <Input
              className="header-edit-input"
              value={editingColumn?.value || ""}
              onChange={e => {
                e.stopPropagation();
                handleColumnEdit(column.value, e.target.value);
              }}
              onPressEnter={(e) => {
                e.stopPropagation();
                saveColumnEdit();
              }}
              onBlur={(e) => {
                e.stopPropagation();
                saveColumnEdit();
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <>
              <Space>
              <span>{column.label}</span>
                {column.settings.defaultCellType !== 'static' && (
                  <Tag color="blue">
                    {column.settings.defaultCellType}
                  </Tag>
                )}
              </Space>
              <Space>
                <Dropdown 
                  overlay={<ColumnSettingsMenu 
                    column={column} 
                    onSettingsChange={handleSettingsChange}
                  />} 
                  trigger={['click']}
                >
                  <Button
                    type="text"
                    icon={<SettingOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: 'white' }}
                  />
                </Dropdown>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingColumn({ id: column.value, value: column.label });
                  }}
                  style={{ color: 'white' }}
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColumnDelete(column.value);
                  }}
                  style={{ color: 'white' }}
                />
              </Space>
            </>
          )}
        </div>
      </th>
    );
  }, [editingColumn, handleColumnDelete]);
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
              {columns.map((col, idx) => renderColumnHeader(col, idx))}
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