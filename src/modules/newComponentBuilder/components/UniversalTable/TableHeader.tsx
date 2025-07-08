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

const HeaderCell = styled.th<{ $isTopLevel?: boolean; $isActions?: boolean }>`
    background-color: ${props => props.$isTopLevel ? '#f0f7ff' : '#f5f5f5'};
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
        box-shadow: 12px 0 5px rgba(0, 0, 0, 0.1);
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

const TableHeader: React.FC<TableHeaderProps> = ({ 
    headerStructure, 
    columns, 
    showActions,
    onEditHeader,
    onDeleteHeader,
    onEditColumn,
    onDeleteColumn
}) => {
    // First, map columns to their field_ids for easier lookup
    const columnMap = new Map(columns.map(col => [col.fieldId, col]));
    
    // Get all leaf columns in the correct order
    const getOrderedColumns = () => {
        const result: Column[] = [];
        const processedIds = new Set<string>();
        
        // Extract columns from header structure
        const extractColumns = (headers: HeaderStructure[]) => {
            headers.forEach(header => {
                if (header.columns && header.columns.length > 0) {
                    header.columns.forEach(colId => {
                        const col = columnMap.get(colId);
                        if (col && !processedIds.has(colId)) {
                            result.push(col);
                            processedIds.add(colId);
                        }
                    });
                }
                
                if (header.children && header.children.length > 0) {
                    extractColumns(header.children);
                }
            });
        };
        
        extractColumns(headerStructure);
        
        // Add any columns not in the header structure
        columns.forEach(col => {
            if (!processedIds.has(col.fieldId)) {
                result.push(col);
            }
        });
        
        return result;
    };
    
    const orderedColumns = getOrderedColumns();
    
    // Build a map of column IDs to their position in the final ordered list
    const columnPositions = new Map(
        orderedColumns.map((col, index) => [col.fieldId, index])
    );
    
    // Helper to get the maximum depth of the header structure
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

    // Generate header rows
    const generateHeaderRows = () => {
        const maxDepth = getMaxDepth(headerStructure);
        const headerRows: JSX.Element[][] = Array.from({ length: maxDepth }, () => []);
        
        // Create a matrix representation of the header grid
        const headerGrid: string[][] = Array.from(
            { length: maxDepth }, 
            () => Array(orderedColumns.length).fill('')
        );
        
        // Fill the grid with header IDs
        const fillGrid = (header: HeaderStructure, level: number, colStart: number, colEnd: number) => {
            // Mark this header's position in the grid
            for (let col = colStart; col <= colEnd; col++) {
                headerGrid[level][col] = header.id;
            }
            
            // Process children if any
            if (header.children && header.children.length > 0) {
                // Calculate column ranges for each child
                let currentCol = colStart;
                
                header.children.forEach(child => {
                    // Calculate how many columns this child spans
                    const childColumns = getAllColumnsUnder(child);
                    if (childColumns.length === 0) return;
                    
                    // Find the column positions
                    const positions = childColumns
                        .map(colId => columnPositions.get(colId))
                        .filter((pos): pos is number => pos !== undefined)
                        .sort((a, b) => a - b);
                    
                    if (positions.length > 0) {
                        const childStart = positions[0];
                        const childEnd = positions[positions.length - 1];
                        
                        // Fill the grid for this child
                        fillGrid(child, level + 1, childStart, childEnd);
                    }
                });
            }
        };
        
        // Get all columns under a header (including from children)
        const getAllColumnsUnder = (header: HeaderStructure): string[] => {
            const result: string[] = [...(header.columns || [])];
            
            if (header.children) {
                header.children.forEach(child => {
                    result.push(...getAllColumnsUnder(child));
                });
            }
            
            return result;
        };
        
        // Calculate column ranges for top-level headers
        headerStructure.forEach(header => {
            const headerColumns = getAllColumnsUnder(header);
            if (headerColumns.length === 0) return;
            
            // Find column positions
            const positions = headerColumns
                .map(colId => columnPositions.get(colId))
                .filter((pos): pos is number => pos !== undefined)
                .sort((a, b) => a - b);
            
            if (positions.length > 0) {
                const start = positions[0];
                const end = positions[positions.length - 1];
                
                // Fill the grid for this header
                fillGrid(header, 0, start, end);
            }
        });
        
        // Convert grid to header cells
        for (let level = 0; level < maxDepth; level++) {
            let currentId = '';
            let startCol = 0;
            let colSpan = 0;
            
            // Process each column position
            for (let col = 0; col <= headerGrid[level].length; col++) {
                const cellId = col < headerGrid[level].length ? headerGrid[level][col] : '';
                
                // If we've reached a new header or the end, render the previous one
                if (cellId !== currentId || col === headerGrid[level].length) {
                    if (currentId && colSpan > 0) {
                        // Find the header object
                        const header = findHeaderById(headerStructure, currentId);
                        if (header) {
                            // Calculate rowSpan - if this is a leaf node or the last level, span to the bottom
                            const isLeaf = !header.children || header.children.length === 0;
                            const rowSpan = isLeaf ? maxDepth - level : 1;
                            
                            // Add the header cell
                            headerRows[level].push(
                                <HeaderCell 
                                    key={`${level}-${currentId}`}
                                    colSpan={colSpan}
                                    rowSpan={rowSpan}
                                    $isTopLevel={level === 0}
                                    $isActions={cellId === 'actions'}
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
                    }
                    
                    // Start a new header
                    currentId = cellId;
                    startCol = col;
                    colSpan = cellId ? 1 : 0;
                } else {
                    // Continue the current header
                    colSpan++;
                }
            }
        }
        
        // Add column names as the last row
        const columnHeaderRow = orderedColumns.map(column => (
            <HeaderCell key={column.fieldId} $isActions={column.fieldId === 'actions'}>
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
            columnHeaderRow.push(
                <HeaderCell key="actions" $isActions>Actions</HeaderCell>
            );
        }
        
        // Filter out empty rows
        const finalRows = headerRows
            .filter(row => row.length > 0)
            .map((cells, idx) => (
                <HeaderRow key={`row-${idx}`} $level={idx}>
                    {cells}
                </HeaderRow>
            ));
        
        // Add the column header row
        finalRows.push(
            <HeaderRow key="column-headers" $level={maxDepth}>
                {columnHeaderRow}
            </HeaderRow>
        );
        
        return finalRows;
    };
    
    // Helper to find a header by ID
    const findHeaderById = (headers: HeaderStructure[], id: string): HeaderStructure | null => {
        for (const header of headers) {
            if (header.id === id) return header;
            
            if (header.children) {
                const found = findHeaderById(header.children, id);
                if (found) return found;
            }
        }
        
        return null;
    };

    return (
        <thead>
            {generateHeaderRows()}
        </thead>
    );
};

export default TableHeader; 