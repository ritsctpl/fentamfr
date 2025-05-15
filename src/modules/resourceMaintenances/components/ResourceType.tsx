'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Transfer } from 'antd';
import type { TransferProps } from 'antd/es/transfer';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { ResourceContext } from '@modules/resourceMaintenances/hooks/ResourceContext';
import { retrieveResourceTypes, RetriveResourceUpdateList } from '@services/ResourceService';

interface ResourceType {
  key: string;
  resourceType: string;
}

interface ResourceTypeProps {
  drag: boolean;
}

const ResourceType: React.FC<ResourceTypeProps> = ({
  drag
}) => {
  const [mockData, setMockData] = useState<ResourceType[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const { t } = useTranslation();
  const { formData, setFormData } = useContext<any>(ResourceContext);

  useEffect(() => {
    const fetchResourceTypesData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;

      try {
        let availableWithKeys: ResourceType[] = [];
        let assignedWithKeys: ResourceType[] = [];

        if (formData.resourceTypeList && formData.available) {
          assignedWithKeys = formData.resourceTypeList.map(item => ({
            key: item.resourceType || uuidv4(),
            resourceType: item.resourceType
          }));

          availableWithKeys = formData.available.map(user => ({
            key: user.key || uuidv4(),
            resourceType: user.resourceType
          }));

          setMockData([...availableWithKeys, ...assignedWithKeys]);
          setTargetKeys(assignedWithKeys.map(item => item.key));
        } else {
          if (drag) {
            const response = await retrieveResourceTypes(site);
            const available = Array.isArray(response) ? response.map((item: any) => ({
              key: uuidv4(),
              resourceType: item.resourceType
            })) : [];

            setMockData(available);
            setTargetKeys([]);
          } else if (formData.resourceTypeList && formData.createdDateTime) {
            const response = await RetriveResourceUpdateList(site, formData.resource);
            
            const available = Array.isArray(response) ? response.map((item: any) => ({
              key: uuidv4(),
              resourceType: item.resourceType
            })) : [];
            assignedWithKeys = formData.resourceTypeList?.map(user => ({
              ...user,
              key: user.key || uuidv4()
            })) || [];

            setMockData([...available, ...assignedWithKeys]);
            setTargetKeys(assignedWithKeys.map(item => item.key));
          } else {
            const response = await retrieveResourceTypes(site);
            const available = Array.isArray(response) ? response.map((item: any) => ({
              key: uuidv4(),
              resourceType: item.resourceType
            })) : [];

            setMockData(available);
            setTargetKeys([]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchResourceTypesData();
  }, [drag, formData]);

  const handleChange: TransferProps['onChange'] = (newTargetKeys: any) => {
    setTargetKeys(newTargetKeys);

    const updatedAssignedResourceTypes = mockData.filter(item => newTargetKeys.includes(item.key));
    const updatedAvailableResourceTypes = mockData.filter(item => !newTargetKeys.includes(item.key));

    setFormData(prevData => ({
      ...prevData,
      resourceTypeList: updatedAssignedResourceTypes,
      available: updatedAvailableResourceTypes
    }));
  };

  const handleSearch: TransferProps['onSearch'] = (dir, value) => {
    console.log('Search:', dir, value);
  };

  const filterOption = (inputValue: string, option: ResourceType) =>
    option.resourceType.toLowerCase().includes(inputValue.toLowerCase());

  const renderItem = (item: ResourceType) => item.resourceType;

  return (
    <div style={{ padding: '20px' }}>
      <Transfer
        dataSource={mockData}
        showSearch
        filterOption={filterOption}
        targetKeys={targetKeys}
        onChange={handleChange}
        onSearch={handleSearch}
        render={renderItem}
        listStyle={{ width: '100%', height: 300 }}
        rowKey={(item) => item.key}
        titles={[t("availableResourceTypes"), t("assignedResourceTypes")]}
      />
    </div>
  );
};

export default ResourceType;
