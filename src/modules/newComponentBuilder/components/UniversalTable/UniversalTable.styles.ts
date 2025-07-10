import styled from 'styled-components';

export const TableContainer = styled.div<{ $stickyHeaders?: boolean }>`
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 400px);
  overflow-x: auto;
  position: relative;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: white;
  
  ${props => props.$stickyHeaders && `
    thead th {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
  `}

  /* Ensure proper behavior for sticky columns */
  table {
    position: relative;
  }
`;

export const ToolbarContainer = styled.div`
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StyledTable = styled.table<{
  $tableBorder?: boolean;
  $stripedRows?: boolean;
  $alternateRowColor?: string;
  $headerColor?: string;
  $headerFontColor?: string;
}>`
  width: 100%;
  border-collapse: collapse;
  position: relative;
  
  th, td {
    border: ${props => props.$tableBorder ? '1px solid #e8e8e8' : 'none'};
    padding: 12px 16px;
    text-align: left;
    position: relative;
  }

  th {
    background: #e6f3ff;  /* Light blue background for headers */
    color: #000000;  /* Black text for better readability */
    font-weight: 500;
    user-select: none;
    vertical-align: middle;
    border-bottom: 1px solid #d9d9d9;
  }

  /* Make sure sticky header cells have higher z-index */
  th[style*="position: sticky"] {
    z-index: 2;
  }

  /* Make sure sticky action cells have proper z-index */
  td[style*="position: sticky"] {
    z-index: 1;
  }

  td {
    background: #ffffff;
    border-bottom: 1px solid #f0f0f0;
  }

  tr:hover td {
    background: #fafafa;
  }

  .column-resizer {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 5px;
    background: transparent;
    cursor: col-resize;
    user-select: none;
    touch-action: none;

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .column-header-content {
    display: flex;
    align-items: center;
    gap: 8px;

    .column-actions {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .column-actions {
      opacity: 1;
    }
  }

  /* Hierarchical Headers */
  thead tr.header-group th {
    text-align: center;
    font-weight: 600;
    background-color: #e6f3ff;
    border-bottom: 1px solid #d9d9d9;
  }

  thead tr.sub-header th {
    background-color: #f0f7ff;
    font-weight: normal;
    border-bottom: 1px solid #d9d9d9;
  }

  /* Hierarchical header border styles */
  thead tr th.group-start {
    border-left: 1px solid #d9d9d9;
  }
  
  thead tr th.group-end {
    border-right: 1px solid #d9d9d9;
  }

  /* Input styles within cells */
  input, .ant-input, .ant-input-number, .ant-select {
    width: 100%;
    
    &::placeholder {
      color: #bfbfbf;
      font-style: italic;
    }
  }

  .ant-input-number-input-wrap input {
    text-align: left;  /* Align numbers to the left like in the image */
  }
  
  /* Switch alignment */
  .ant-switch {
    margin: 0 auto;
    display: block;
  }

  /* Empty cell styles */
  td .empty-cell {
    color: #bfbfbf;
    font-style: italic;
    text-align: left;
  }

  /* Status dropdown styles */
  .ant-select-selector {
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
  }

  .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
    background: #f5f5f5 !important;
  }
`; 