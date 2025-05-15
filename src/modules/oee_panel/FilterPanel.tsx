import React, { useState, useEffect, useCallback } from 'react';
import { Button, ConfigProvider, Input, Select, Switch, message } from 'antd';
import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useConfigContext } from './hooks/configData';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import enUS from 'antd/locale/en_US';

// Types
export interface TableListItem {
  key: number;
  filterName: string;
  type: string;
  status: boolean;
  controller: string;
  endpoint: string;
  keyName: string;
  retriveFeild: string;
}

// Custom hooks
const useTableState = () => {
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(8);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [localChanges, setLocalChanges] = useState<Record<number, Partial<TableListItem>>>({});

  useEffect(() => {
    document.onfullscreenchange = () => {
      setPageSize(document.fullscreenElement ? 15 : 8);
    };
  }, []);

  

  return {
    searchText,
    setSearchText,
    pageSize,
    isAddingRow,
    setIsAddingRow,
    localChanges,
    setLocalChanges
  };
};

const useFilterData = (value: any) => {
  const [displayData, setDisplayData] = useState<TableListItem[]>([]);

  useEffect(() => {
    if (!value?.[0]?.filterDataList) return;

    const data = value[0].filterDataList.map((item: any, index: number) => ({
      ...item,
      key: index
    }));
    setDisplayData(data);
  }, [value]);

  return { displayData, setDisplayData };
};

// Constants
const initialRowData: TableListItem = {
  key: 0,
  filterName: '',
  type: 'input',
  status: true,
  controller: '',
  endpoint: '',
  keyName: '',
  retriveFeild: ''
};

const typeOptions = [
  { value: 'input', label: 'Input' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'date', label: 'Date' },
  { value: 'browse', label: 'Browse' }
];

const FilterPanel: React.FC = () => {
  const { value, setValue, updateData } = useConfigContext();
  const [newRowData, setNewRowData] = useState<TableListItem>(initialRowData);

  const {
    searchText,
    setSearchText,
    pageSize,
    isAddingRow,
    setIsAddingRow,
    localChanges,
    setLocalChanges
  } = useTableState();

  const { displayData, setDisplayData } = useFilterData(value);

  // Handlers
  const handleInputChange = useCallback((key: number, field: keyof TableListItem, value: any) => {
    setLocalChanges(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value
      }
    }));
  }, []);

  useEffect(() => {
    if (!value?.[0]) return;

    const updateTimeout = setTimeout(() => {
      if (Object.keys(localChanges).length > 0) {
        const updatedData = value[0].filterDataList.map((item, index) => {
          const changes = localChanges[index];
          return changes ? { ...item, ...changes } : item;
        });

        const newValue = {
          ...value[0],
          filterDataList: updatedData
        };

        setValue([newValue]);
      }
    }, 1000);

    return () => clearTimeout(updateTimeout);
  }, [localChanges, value, setValue]);

  const handleSave = useCallback(async () => {
    try {
      if (!value?.[0]) return;
      await updateData(value[0]);
      setLocalChanges({});
      message.success('Settings saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      message.error('Failed to save settings');
    }
  }, [value, updateData]);

  const handleAddRow = useCallback(() => {
    if (!value?.[0]?.filterDataList) return;
    const newKey = value[0].filterDataList.length;
    setNewRowData(prev => ({ ...prev, key: newKey }));
    setIsAddingRow(true);
  }, [value]);

  const handleSaveNewRow = useCallback(async () => {
    try {
      if (!value?.[0]) return;
      const { key, ...newFilterData } = newRowData;
      const newValue = {
        ...value[0],
        filterDataList: [...(value[0].filterDataList || []), newFilterData]
      };

      await updateData(newValue);
      setValue([newValue]);
      setIsAddingRow(false);
      setLocalChanges({});
      message.success('New filter added successfully');
    } catch (error) {
      console.error('Add error:', error);
      message.error('Failed to add new filter');
    }
  }, [value, newRowData, updateData, setValue]);

  const handleDeleteRow = useCallback(async (key: number) => {
    try {
      if (!value?.[0]) return;
      const updatedData = value[0].filterDataList.filter((_, index) => index !== key);
      const newValue = {
        ...value[0],
        filterDataList: updatedData
      };

      await updateData(newValue);
      setValue([newValue]);
      setLocalChanges({});
      message.success('Row deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete row');
    }
  }, [value, updateData, setValue]);

  // Filter data based on search
  useEffect(() => {
    if (!value?.[0]?.filterDataList) return;

    const filteredData = value[0].filterDataList
      .map((item, index) => ({ ...item, key: index }))
      .filter(item => {
        if (!searchText) return true;
        const text = searchText.toLowerCase();
        return (
          item.filterName?.toLowerCase().includes(text) ||
          item.type?.toLowerCase().includes(text) ||
          item.controller?.toLowerCase().includes(text) ||
          item.endpoint?.toLowerCase().includes(text) ||
          item.retriveFeild?.toLowerCase().includes(text) ||
          item.keyName?.toLowerCase().includes(text)
        );
      });

    setDisplayData(filteredData);
  }, [value, searchText]);

  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'Filter Name',
      dataIndex: 'filterName',
      render: (_, record) => (
        <Input
          value={localChanges[record.key]?.filterName ?? record.filterName}
          onChange={(e) => handleInputChange(record.key, 'filterName', e.target.value)}
        />
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      initialValue: 'all',
      filters: typeOptions.map(opt => ({ text: opt.label, value: opt.value })),
      onFilter: (value, record) => record.type === value,
      render: (_, record) => (
        <Select
          style={{ width: '100%' }}
          value={localChanges[record.key]?.type ?? record.type}
          onChange={(value) => handleInputChange(record.key, 'type', value)}
          options={typeOptions}
        />
      ),
    },
    {
      title: 'Key Name',
      dataIndex: 'keyName',
      render: (_, record) => (
        <Input
          value={localChanges[record.key]?.keyName ?? record.keyName}
          onChange={(e) => handleInputChange(record.key, 'keyName', e.target.value)}
        />
      ),
    },
    {
      title: 'Retrive Field',
      dataIndex: 'retriveFeild',
      render: (_, record) => (
        <Input
          value={localChanges[record.key]?.retriveFeild ?? record.retriveFeild}
          onChange={(e) => handleInputChange(record.key, 'retriveFeild', e.target.value)}
        />
      ),
    },
    {
      title: 'Controller',
      dataIndex: 'controller',
      render: (_, record) => {
        const currentType = localChanges[record.key]?.type ?? record.type;
        const isEnabled = ['select', 'multiselect', 'browse'].includes(currentType);
        return (
          <Input
            value={localChanges[record.key]?.controller ?? record.controller}
            onChange={(e) => handleInputChange(record.key, 'controller', e.target.value)}
            disabled={!isEnabled}
            placeholder={isEnabled ? 'Enter controller' : 'Not applicable'}
          />
        );
      },
    },
    {
      title: 'End Point',
      dataIndex: 'endpoint',
      render: (_, record) => {
        const currentType = localChanges[record.key]?.type ?? record.type;
        const isEnabled = ['select', 'multiselect', 'browse'].includes(currentType);
        return (
          <Input
            value={localChanges[record.key]?.endpoint ?? record.endpoint}
            onChange={(e) => handleInputChange(record.key, 'endpoint', e.target.value)}
            disabled={!isEnabled}
            placeholder={isEnabled ? 'Enter endpoint' : 'Not applicable'}
          />
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      initialValue: 'all',
      width: 100,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => (
        <Switch
          size='small'
          style={{ backgroundColor: (localChanges[record.key]?.status ?? record.status) ? '#124561' : '#cbcbcb' }}
          checked={localChanges[record.key]?.status ?? record.status}
          onChange={(checked) => handleInputChange(record.key, 'status', checked)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'option',
      width: 100,
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="delete"
          size='small'
          danger
          onClick={() => handleDeleteRow(record.key)}
        >
          <DeleteOutlined />
        </Button>,
      ],
    },
  ];

  return (
    <ConfigProvider locale={enUS}>
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div style={{
          width: isAddingRow ? '70%' : '100%',
          height: '100%',
          padding: '20px',
          transition: 'width 0.3s ease-in-out'
        }}>
          <ProTable<TableListItem>
            columns={columns}
            dataSource={displayData}
            rowKey="key"
            search={false}
            pagination={false}
            scroll={{ y: 'calc(100vh - 230px)' }}
            dateFormatter="string"
            options={{
              setting: {
                draggable: true,
                checkable: true,
                checkedReset: true,
              },
              fullScreen: true,
              reload: () => setSearchText(''),
            }}
            toolbar={{
              search: {
                onSearch: setSearchText,
                placeholder: 'Search filters...',
              },
              actions: [
                <Button
                  key="add"
                  icon={<PlusOutlined />}
                  type="primary"
                  size='small'
                  style={{ backgroundColor: '#124561' }}
                  onClick={handleAddRow}
                >
                  Add Row
                </Button>,
                <Button
                  key="save"
                  icon={<SaveOutlined />}
                  type="primary"
                  size='small'
                  style={{ backgroundColor: '#124561' }}
                  onClick={handleSave}
                >
                  Save
                </Button>,
              ],
            }}
          />
        </div>
        {isAddingRow && (
          <div style={{
            width: '30%',
            height: '100%',
            padding: '20px',
            borderLeftWidth: '1px',
            borderLeftStyle: 'solid',
            borderLeftColor: '#f0f0f0',
            background: 'white',
            transition: 'right 0.3s ease-in-out',
            boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3>Add New Filter</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input
                placeholder="Filter Name"
                value={newRowData.filterName}
                onChange={(e) => setNewRowData(prev => ({ ...prev, filterName: e.target.value }))}
              />
              <Input
                placeholder="Key Name"
                value={newRowData.keyName}
                onChange={(e) => setNewRowData(prev => ({ ...prev, keyName: e.target.value }))}
              />
              <Select
                style={{ width: '100%' }}
                value={newRowData.type}
                onChange={(value) => setNewRowData(prev => ({ ...prev, type: value }))}
                options={typeOptions}
              />
              <Input
                placeholder="Controller"
                value={newRowData.controller}
                onChange={(e) => setNewRowData(prev => ({ ...prev, controller: e.target.value }))}
                disabled={!['select', 'multiselect', 'browse'].includes(newRowData.type)}
              />
              <Input
                placeholder="Endpoint"
                value={newRowData.endpoint}
                onChange={(e) => setNewRowData(prev => ({ ...prev, endpoint: e.target.value }))}
                disabled={!['select', 'multiselect', 'browse'].includes(newRowData.type)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Status:</span>
                <Switch
                  checked={newRowData.status}
                  size='small'
                  style={{ backgroundColor: newRowData.status ? '#124561' : '#cbcbcb' }}
                  onChange={(checked) => setNewRowData(prev => ({ ...prev, status: checked }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="primary"
                  size="small"
                  style={{ backgroundColor: '#124561' }}
                  onClick={handleSaveNewRow}
                >
                  Add
                </Button>
                <Button
                  size="small"
                  onClick={() => setIsAddingRow(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default FilterPanel;