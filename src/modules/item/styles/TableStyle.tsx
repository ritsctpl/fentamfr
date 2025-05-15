import { Table } from "antd";
import styled from "styled-components";
 
export const StyledTable = styled(Table)`
.ant-table-thead > tr > th {
    background: #124561;
    color: #fff;
    font-weight: 600;
    padding: 12px;
    text-align: center;
  }
 
   .ant-table-tbody > tr > td {
    padding: 12px;
    text-align: center;
  }
 
  .ant-table-tbody > tr:hover {
    background: #fafafa;
  }
 
  /* Highlight for selected row */
  .selected-row {
    background: #fafafa !important; /* Customize the highlight color */
    .ant-table-cell {
      font-weight: bold; /* Optional: make text bold */
    }
  }
 
  .ant-table-pagination {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }
 
  .ant-table-expanded-row {
    background: #fafafa;
  }
 
  .ant-table-expanded-row > td {
    padding: 16px;
  }
    .ant-table-filter-icon {
    color: white!important; // Change this to your desired color
  }
`;
