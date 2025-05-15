import React, { useState, useEffect } from 'react';
import { Layout, Button, Input, DatePicker, Select, Typography } from 'antd';
import Icon, { MenuFoldOutlined, MenuUnfoldOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { useConfigContext } from './hooks/configData';
import { getSampleData2 } from '@services/oeeServices';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import './styles/styles.css';
import { DynamicBrowse } from '@components/BrowseComponent';

const { Sider } = Layout;

dayjs.extend(utc);
dayjs.extend(timezone);

interface FilterItem {
  key: number;
  name: string;
  type: string;
  status: boolean;
  controller: string;
  endpoint: string;
}


const SideBarDemo: React.FC = () => {
  const { filterValue, selectedValues, setSelectedValues } = useConfigContext();
  const [collapsed, setCollapsed] = useState(true);
  const [selectedValue, setSelectedValue] = useState<{ [key: string]: any }>({});
  const [selectOptions, setSelectOptions] = useState<{ [key: string]: { label: string, value: any }[] }>({});
  const [iniatialBatch, setIniatialBatch] = useState<any>('');

  useEffect(() => {
    const fetchSelectOptions = async () => {
      if (filterValue) {
        const multiSelectFilters = filterValue.filter(filter =>
          filter.type === 'multiselect' && filter.status === true
        );

        for (const filter of multiSelectFilters) {
          try {
            const response = await getSampleData2(filter.controller, filter.endpoint, 'RITS');
            let processedData: any[] = [];

            if (Array.isArray(response)) {
              if (typeof response[0] === 'object' && response[0] !== null) {
                // const firstKey = Object.keys(response[0])[0];
                processedData = response.map(item => String(item[filter.retriveFeild]));
              } else {
                processedData = response.map(item => String(item));
              }
            } else if (typeof response === 'object' && response !== null) {
              const arrayData = Object.values(response).find(value => Array.isArray(value));
              if (arrayData && arrayData.length > 0) {
                if (typeof arrayData[0] === 'object' && arrayData[0] !== null) {
                  // const firstKey = Object.keys(arrayData[0])[0];
                  processedData = arrayData.map(item => String(item[filter.retriveFeild]));
                } else {
                  processedData = arrayData.map(item => String(item));
                }
              }
            }

            const options = processedData.map(item => ({
              label: item,
              value: item
            }));

            setSelectOptions(prev => ({
              ...prev,
              [filter.filterName]: options
            }));
          } catch (error) {
            console.error(`Error fetching options for ${filter.filterName}:`, error);
          }
        }
      }
    };

    fetchSelectOptions();
  }, [filterValue]);

  const handleInputChange = (key: string, value: any) => {
    setSelectedValue(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    let formattedValues = Object.entries(selectedValue).reduce((acc: any, [key, value]) => {
      if (key.endsWith('StartTime') || key.endsWith('EndTime')) {
        const baseKey = key.replace(/(StartTime|EndTime)$/, '');
        if (!acc[baseKey]) {
          acc[baseKey] = {};
        }
        acc[baseKey][key.endsWith('StartTime') ? 'startTime' : 'endTime'] = value;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
    formattedValues = Object.keys(selectedValue).reduce((acc, key) => {
      if (selectedValue[key] !== null && selectedValue[key].length > 0) {
        if (typeof acc[key] === 'string') {
          acc[key] = { startTime: acc[key] };
        }
        acc[key] = selectedValue[key];
      }
      return acc;
    }, {});


    setSelectedValues(formattedValues);
  };

  const handleReset = () => {
    setSelectedValue({});
    setSelectedValues({});
  };

  const renderFilterInput = (filter: any) => {

    switch (filter.type) {
      case 'input':
        return (
          <Input
            style={{ width: '100%', marginBottom: '8px' }}
            placeholder={`Enter ${filter.name}`}
            value={selectedValue[filter.keyName] || ''}
            onChange={(e) => handleInputChange(filter.keyName, e.target.value)}
            size="middle"
          />
        );
      case 'select':
        return (
          <Select
            style={{ width: '100%', marginBottom: '8px' }}
            placeholder={`Select ${filter.name}`}
            value={selectedValue[filter.keyName] || undefined}
            onChange={(value) => handleInputChange(filter.keyName, value)}
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ]}
            size="middle"
          />
        );
      case 'multiselect':
        return (
          <Select
            mode="multiple"
            style={{ width: '100%', marginBottom: '8px' }}
            placeholder={`Select ${filter.filterName}`}
            value={selectedValue[filter.keyName] || []}
            onChange={(values) => handleInputChange(filter.keyName, values)}
            options={selectOptions[filter.filterName] || []}
            loading={!selectOptions[filter.filterName]}
            size="middle"
            maxTagCount={2}
            maxTagTextLength={10}
          />
        );
      case 'date':
        return (
          <DatePicker.RangePicker
            style={{ width: '100%', marginBottom: '8px' }}
            showTime
            value={[
              selectedValue[`startTime`] ? dayjs(selectedValue[`startTime`]) : null,
              selectedValue[`endTime`] ? dayjs(selectedValue[`endTime`]) : null
            ]}
            onChange={(dates) => {
              if (dates) {
                const startTime = dates[0]?.local().format('YYYY-MM-DDTHH:mm:ss.SSS');
                const endTime = dates[1]?.local().format('YYYY-MM-DDTHH:mm:ss.SSS');
                handleInputChange(`startTime`, startTime);
                handleInputChange(`endTime`, endTime);
              } else {
                handleInputChange(`startTime`, null);
                handleInputChange(`endTime`, null);
              }
            }}
            size="middle"
          />
        );
      case 'browse':
        return (
          <DynamicBrowse
            uiConfig={{
              pagination: false,
              filtering: false,
              sorting: false,
              multiSelect: false,
              tableTitle: `Select ${filter.filterName}`,
              okButtonVisible: true,
              cancelButtonVisible: true,
              selectEventCall: false,
              selectEventApi: filter.endpoint,
              tabledataApi: filter.controller
            }}
            initial={iniatialBatch}
            onSelectionChange={(value) => {
              setIniatialBatch(value[0]?.batchNo || '');
              handleInputChange(filter.keyName, value.length > 0 ? [value[0]?.batchNo] : []);
            }}
            isDisable={false}
          />
        );
      default:
        return null;
    }
  };


  return (
    <Sider
      width={300}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      theme="light"
      className={`custom-sidebar ${collapsed ? 'collapsed' : ''}`}
    >
      <div className="sidebar-container">
        <div className={`sidebar-header ${collapsed ? 'collapsed' : ''}`}>
          {!collapsed && <Typography.Text className="sidebar-title">Filters</Typography.Text>}
          <Button
            type="text"
            style={{ color: '#046169' }}
            icon={collapsed ? <LuPanelLeftOpen size={20}/> : <LuPanelLeftClose size={20}/>}
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-button"
          />
        </div>

        {!collapsed && (
          <>
            <div className="filters-container">
              {filterValue
                ?.filter(filter => filter.status === true)
                .map(filter => (
                  <div key={filter.key} className="filter-item">
                    <Typography.Text className="filter-label">
                      {filter.filterName}
                    </Typography.Text>
                    {renderFilterInput(filter)}
                  </div>
                ))}
            </div>

            <div className="apply-button-container">
              <Button
                type="primary"
                className="apply-button"
                onClick={handleApply}
                style={{ marginRight: '8px' }}
              >
                Apply Filters
                <SaveOutlined />
              </Button>
              <Button
                danger
                onClick={handleReset}
                style={{ height: '30px' }}
              >
                Reset
                <DeleteOutlined />
              </Button>
            </div>
          </>
        )}
      </div>
    </Sider>
  );
};

export default SideBarDemo;