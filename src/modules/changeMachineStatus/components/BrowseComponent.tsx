
import React, { Fragment, useState, useEffect } from 'react';
import { Input as AntdInput, Form } from 'antd';
import { GrChapterAdd } from 'react-icons/gr';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import DynamicModal from './DynamicModal';
import DynamicTable from './BrowseTable';
import { parseCookies } from 'nookies';
import { fetchResource } from '../../../services/equResourceService';

const { Item } = Form;

const StyledItem = styled(Item)`
  > div {
    width: 100%;
    text-align: left;
  }

  border-radius: 0.4rem;
  margin-bottom: 5px !important;

  & .ant-form-item-label {
    display: block;
    width: 40%;
    text-align: center;
  }

  & .ant-form-item-label > label > span {
    font-weight: 600 !important;
    position: relative;
    font-size: 14px;
    line-height: 1.3;
    letter-spacing: 0.03em;
  }

  & .ant-row {
    flex-flow: nowrap !important;
  }
`;

const AntdInputStyle = styled(AntdInput)`
  border-radius: 0.4rem;
  box-shadow: none;

  ::placeholder {
    font-size: 14px !important;
    font-weight: 500 !important;
  }

  :focus {
    border-color: #57a8e9;
    outline: 0;
    -webkit-box-shadow: 0 0 0 2px rgba(87,168,233, .2);
    box-shadow: 0 0 0 2px rgba(87,168,233, .2);
  }

  .ant-input-affix-wrapper-focused {
    box-shadow: none;
    border-right-width: 0px !important;
  }

  &.ant-input {
    font-weight: 500 !important;
    padding: 8px 11px !important;
    color: black !important;
  }

  &.ant-input[disabled] {
    color: #545454;
    font-size: 1rem;
    font-weight: 500;
    text-align: left;
  }
`;

interface UiConfig {
  label?: string;
  tabledataApi?: string;
  okButtonVisible?: boolean;
  selectEventCall?: boolean;
  multiSelect: boolean;
  tableTitle?: string;
  cancelButtonVisible?: boolean;
  pagination?: false | {
    current: number;
    pageSize: number;
    total: number;
  };
  selectEventApi?: string;
  filtering?: boolean;
  sorting?: boolean;
}

interface DynamicBrowseProps {
  uiConfig: UiConfig;
  initial: string | undefined;
  onSelectionChange?: (values: DataRow[]) => void;
}

interface DataRow {
  id: string;
  [key: string]: any;
}

export const DynamicBrowse: React.FC<DynamicBrowseProps> = ({ uiConfig, onSelectionChange, initial }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DataRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [tableData, setTableData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<any[]>([]);


  useEffect(() => {
    if (isReadOnly) {
      const timer = setTimeout(() => {
        setIsReadOnly(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isReadOnly]);

  useEffect(() => {
    if (modalOpen && uiConfig.tabledataApi) {
      const fetchBrowseData = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        const url = uiConfig.tabledataApi;
        const newUrl = uiConfig.selectEventApi;
        try {
          const resource = await fetchResource(site, userId, url,newUrl);

          let dataWithIds: DataRow[] = [];
          let newColumns: any[] = [];

          if (Array.isArray(resource)) {
            dataWithIds = resource.map(row => ({
              id: uuidv4(),
              ...row
            }));

            if (dataWithIds.length > 0) {
              const keys = Object.keys(dataWithIds[0]);
              newColumns = keys
                .filter(key => key !== 'id')
                .map(key => ({
                  title: key.charAt(0).toUpperCase() + key.slice(1),
                  dataIndex: key,
                }));
            }
          } else if (resource.operationList && Array.isArray(resource.operationList)) {
            dataWithIds = resource.operationList.map(row => ({
              id: uuidv4(),
              ...row
            }));

            if (dataWithIds.length > 0) {
              const keys = Object.keys(dataWithIds[0]);
              newColumns = keys
                .filter(key => key !== 'id')
                .map(key => ({
                  title: key.charAt(0).toUpperCase() + key.slice(1),
                  dataIndex: key,
                }));
            }
          } else if (resource.availableWorkCenterList && Array.isArray(resource.availableWorkCenterList)) {
            dataWithIds = resource.availableWorkCenterList.map(row => ({
              id: uuidv4(),
              ...row
            }));

            if (dataWithIds.length > 0) {
              const keys = Object.keys(dataWithIds[0]);
              newColumns = keys
                .filter(key => key !== 'id')
                .map(key => ({
                  title: key.charAt(0).toUpperCase() + key.slice(1),
                  dataIndex: key,
                }));
            }
          } else if (resource.reasonCodeResponseList && Array.isArray(resource.reasonCodeResponseList)) {
            dataWithIds = resource.reasonCodeResponseList.map(row => ({
              id: uuidv4(),
              ...row
            }));
            

            if (dataWithIds.length > 0) {
              const keys = Object.keys(dataWithIds[0]);
              newColumns = keys
                .filter(key => key !== 'id')
                .map(key => ({
                  title: key.charAt(0).toUpperCase() + key.slice(1),
                  dataIndex: key,
                }));
            }
          }
          else if (resource.workCenterList && Array.isArray(resource.workCenterList)) {
            dataWithIds = resource.workCenterList.map(row => ({
              id: uuidv4(),
              ...row
            }));
            

            if (dataWithIds.length > 0) {
              const keys = Object.keys(dataWithIds[0]);
              newColumns = keys
                .filter(key => key !== 'id')
                .map(key => ({
                  title: key.charAt(0).toUpperCase() + key.slice(1),
                  dataIndex: key,
                }));
            }
          }
          else {
            throw new Error('Unexpected data format');
          }

          setTableData(dataWithIds);
          setColumns(newColumns);

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchBrowseData();
    }
  }, [modalOpen, uiConfig.tabledataApi]);

  const handleOk = () => {
    onSelectionChange(selectedRows);

    console.log(selectedRows,);
    
    try {
      if (uiConfig.okButtonVisible) {
        setIsReadOnly(true);
        setModalOpen(false);
        // setInputValue(selectedRows.map(row => row[Object.keys(row)[0]]).join(', '));
        setInputValue(selectedRows.map(row => row[Object.keys(row)[0]]).join(', '));
        rowSelectApiCall();
        if (onSelectionChange) {
          onSelectionChange(selectedRows);
        }
      }
    } catch (error) {
      console.error('Error in handleOk:', error);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const handleRowSelectionChange = (selectedRowKeys: React.Key[], selectedRows: DataRow[]) => {
    try {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
      const values = selectedRows.map(row => row[Object.keys(row)[0]]).join(', ');
      setInputValue(values);
    //   if (onSelectionChange) {
    //     onSelectionChange(selectedRows);
    //   }
      if (uiConfig.selectEventCall) {
        rowSelectApiCall();
        setModalOpen(false);
      }
    } catch (error) {
      console.error('Error in handleRowSelectionChange:', error);
    }
  };

  const handleRowSelect = (id: string, value: string | null) => {
    try {
      const selectedRow = tableData.find(row => row.id === id);
      if (selectedRow) {
        const nextKey = Object.keys(selectedRow).find(key => key !== 'id');
        if (nextKey) {
          const valueToAdd = selectedRow[nextKey] || '';
          if (uiConfig.multiSelect) {
            const newRows = [...selectedRows];
            const existingRowIndex = newRows.findIndex(row => row.id === id);
            if (existingRowIndex > -1) {
              newRows.splice(existingRowIndex, 1);
            } else {
              newRows.push(selectedRow);
            }
            setSelectedRows(newRows);
            setInputValue(newRows.map(row => row[nextKey] || '').join(', '));
          } else {
            setSelectedRows([selectedRow]);
            setInputValue(valueToAdd);
          }
        }
      }
    } catch (error) {
      console.error('Error in handleRowSelect:', error);
    }
  };

  const rowSelectApiCall = () => {
    console.log('API called');
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: handleRowSelectionChange,
    type: uiConfig.multiSelect ? 'checkbox' : 'radio' as 'checkbox' | 'radio',
  };

  return (
    <StyledItem
      label={
        uiConfig?.label && (
          <Fragment>
            <label>
              {uiConfig?.label}&nbsp;
            </label>
          </Fragment>
        )
      }
    >
      <AntdInputStyle
        value={initial}
        suffix={<GrChapterAdd style={{ cursor: 'pointer' }} onClick={() => setModalOpen(true)} />}
      />

      <DynamicModal
        width={'70%'}
        visible={modalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        title={uiConfig.tableTitle}
        okButtonVisible={uiConfig.okButtonVisible}
        cancelButtonVisible={uiConfig.cancelButtonVisible}
      >
        <DynamicTable
          dataSource={tableData}
          columns={columns}
          uiConfig={{
            multiSelect: uiConfig.multiSelect,
            pagination: uiConfig.pagination,
          }}
          rowSelection={rowSelection}
          onRowSelect={handleRowSelect}
        />
      </DynamicModal>
    </StyledItem>
  );
};
