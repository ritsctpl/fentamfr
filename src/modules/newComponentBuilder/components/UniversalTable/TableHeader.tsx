import React from 'react';
import { HeaderStructure, Column } from './types';
import styled from 'styled-components';

interface TableHeaderProps {
  headerStructure: HeaderStructure[];
  columns: Column[];
  showActions?: boolean;
  onEditHeader?: (headerId: string) => void;
  onDeleteHeader?: (headerId: string) => void;
  onEditColumn?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
}

const HeaderCell = styled.th<{ $isTopLevel?: boolean; $isActions?: boolean; $isEmpty?: boolean }>`
  background-color: ${props => 
    props.$isEmpty ? 'transparent' : 
    props.$isTopLevel ? '#f0f7ff' : '#f5f5f5'
  };
  text-align: center;
  padding: 8px 24px 8px 8px;
  border: 1px solid #f0f0f0;
  font-weight: ${props => props.$isTopLevel ? '600' : '500'};
  position: relative;
  min-height: 38px;
  min-width: ${props => props.$isActions ? 'auto' : '200px'};
  ${props => props.$isActions && `
    position: sticky;
    right: 0;
    z-index: 2;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  `}
  ${props => props.$isEmpty && `
    border: none;
    padding: 0;
  `}
`;

const HeaderRow = styled.tr<{ $level: number }>`
  &:not(:last-child) th {
    border-bottom: none;
  }
`;

const HeaderActions = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 6px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  border-radius: 4px;
  
  &:hover {
    color: #1890ff;
    background-color: rgba(24, 144, 255, 0.1);
  }
  
  &:last-child:hover {
    color: #ff4d4f;
    background-color: rgba(255, 77, 79, 0.1);
  }
`;

interface HeaderCell {
  id?: string;
  label?: string;
  colSpan: number;
  rowSpan: number;
  isEmpty: boolean;
  isTopLevel: boolean;
  header?: HeaderStructure;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  headerStructure,
  columns,
  showActions,
  onEditHeader,
  onDeleteHeader,
  onEditColumn,
  onDeleteColumn
}) => {
  // Helper function to get all columns that belong to a header (including children)
  const getAllColumnsUnderHeader = (header: HeaderStructure): string[] => {
    const result: string[] = [...(header.columns || [])];
    
    if (header.children) {
      header.children.forEach(child => {
        result.push(...getAllColumnsUnderHeader(child));
      });
    }
    
    return result;
  };

  // Helper function to get the maximum depth of header structure
  const getMaxDepth = (headers: HeaderStructure[], currentDepth = 1): number => {
    let maxDepth = currentDepth;
    
    headers.forEach(header => {
      if (header.children && header.children.length > 0) {
        const childDepth = getMaxDepth(header.children, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });
    
    return maxDepth;
  };

  // Helper function to check if a header has children
  const hasChildren = (header: HeaderStructure): boolean => {
    return header.children && header.children.length > 0;
  };

  // Get all columns that are assigned to any header
  const getAssignedColumns = (): Set<string> => {
    const assigned = new Set<string>();
    
    const collectColumns = (headers: HeaderStructure[]) => {
      headers.forEach(header => {
        if (header.columns) {
          header.columns.forEach(col => assigned.add(col));
        }
        if (header.children) {
          collectColumns(header.children);
        }
      });
    };
    
    collectColumns(headerStructure);
    return assigned;
  };

  // Generate header rows
  const generateHeaderRows = () => {
    const maxDepth = getMaxDepth(headerStructure);
    const assignedColumns = getAssignedColumns();
    const totalColumns = columns.length + (showActions ? 1 : 0);
    
    // If no header structure, just return column names
    if (headerStructure.length === 0) {
      const columnRow = columns.map(column => (
        <HeaderCell key={column.fieldId}>
          {column.fieldName}
          {column.unit && <small> ({column.unit})</small>}
          {(onEditColumn || onDeleteColumn) && (
            <HeaderActions>
              {onEditColumn && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditColumn(column.fieldId);
                  }}
                  title="Edit column"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </IconButton>
              )}
              {onDeleteColumn && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteColumn(column.fieldId);
                  }}
                  title="Delete column"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </IconButton>
              )}
            </HeaderActions>
          )}
        </HeaderCell>
      ));

      if (showActions) {
        columnRow.push(
          <HeaderCell key="actions" $isActions>
            Actions
          </HeaderCell>
        );
      }

      return [
        <HeaderRow key="column-headers" $level={0}>
          {columnRow}
        </HeaderRow>
      ];
    }

    const rows: JSX.Element[] = [];

    // Generate header structure rows
    const generateHeaderLevel = (headers: HeaderStructure[], level: number) => {
      const cells: JSX.Element[] = [];
      let columnIndex = 0;

      // Process each column to determine what header cell it should have
      columns.forEach((column, colIdx) => {
        let cellAdded = false;

        // Check if this column belongs to any header at this level
        for (const header of headers) {
          const headerColumns = getAllColumnsUnderHeader(header);
          
          if (headerColumns.includes(column.fieldId)) {
            // Check if this is the first column of this header
            const headerFirstColumn = columns.find(col => headerColumns.includes(col.fieldId));
            
            if (headerFirstColumn?.fieldId === column.fieldId) {
              // Calculate colspan - how many columns this header spans
              const colSpan = headerColumns.filter(colId => 
                columns.some(col => col.fieldId === colId)
              ).length;
              
              // Calculate rowspan - if this header has no children, it spans to the bottom
              const rowSpan = hasChildren(header) ? 1 : maxDepth - level;
              
              cells.push(
                <HeaderCell
                  key={`${level}-${header.id}`}
                  colSpan={colSpan}
                  rowSpan={rowSpan}
                  $isTopLevel={level === 0}
                >
                  {header.label}
                  {(onEditHeader || onDeleteHeader) && (
                    <HeaderActions>
                      {onEditHeader && (
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditHeader(header.id);
                          }}
                          title="Edit header"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </IconButton>
                      )}
                      {onDeleteHeader && (
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteHeader(header.id);
                          }}
                          title="Delete header"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </IconButton>
                      )}
                    </HeaderActions>
                  )}
                </HeaderCell>
              );
            }
            cellAdded = true;
            break;
          }
        }

        // If column doesn't belong to any header at this level, add empty cell
        if (!cellAdded && !assignedColumns.has(column.fieldId)) {
          cells.push(
            <HeaderCell
              key={`${level}-empty-${colIdx}`}
              rowSpan={maxDepth}
              $isEmpty
            />
          );
        }
      });

      // Add actions column header if needed
      if (showActions && level === 0) {
        cells.push(
          <HeaderCell key={`${level}-actions`} rowSpan={maxDepth} $isActions>
            Actions
          </HeaderCell>
        );
      }

      if (cells.length > 0) {
        rows.push(
          <HeaderRow key={`header-level-${level}`} $level={level}>
            {cells}
          </HeaderRow>
        );
      }

      // Process children for next level
      if (level < maxDepth - 1) {
        const childHeaders: HeaderStructure[] = [];
        headers.forEach(header => {
          if (header.children) {
            childHeaders.push(...header.children);
          }
        });
        
        if (childHeaders.length > 0) {
          generateHeaderLevel(childHeaders, level + 1);
        }
      }
    };

    // Generate all header levels
    generateHeaderLevel(headerStructure, 0);

    // Add column names row
    const columnRow = columns.map(column => (
      <HeaderCell key={column.fieldId}>
        {column.fieldName}
        {column.unit && <small> ({column.unit})</small>}
        {(onEditColumn || onDeleteColumn) && (
          <HeaderActions>
            {onEditColumn && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEditColumn(column.fieldId);
                }}
                title="Edit column"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconButton>
            )}
            {onDeleteColumn && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteColumn(column.fieldId);
                }}
                title="Delete column"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconButton>
            )}
          </HeaderActions>
        )}
      </HeaderCell>
    ));

    if (showActions) {
      columnRow.push(
        <HeaderCell key="actions" $isActions>
          Actions
        </HeaderCell>
      );
    }

    rows.push(
      <HeaderRow key="column-headers" $level={maxDepth}>
        {columnRow}
      </HeaderRow>
    );

    return rows;
  };

  return (
    <thead>
      {generateHeaderRows()}
    </thead>
  );
};

export default TableHeader;
