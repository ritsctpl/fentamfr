import React, { useContext, useEffect, useState } from 'react';
import { Transfer, Spin, Alert } from 'antd';
import type { TransferProps } from 'antd';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { NcCodeContext } from '@modules/ncCodeMaintenance/hooks/NcCodeUseContext';
import { retrieveAvailableRouting, retrieveAvailableRoutings } from '@services/ncCodeService';

interface RecordType {
  key: string;
  routingBO: string;
}

const DispositionRoutings: React.FC = () => {
  const { formData, setFormData, setFormChange, resetValue } = useContext<any>(NcCodeContext);
  const [availableRoutings, setAvailableRoutings] = useState<any>([]);
  const [assignedRoutings, setAssignedRoutings] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      let response;
      if (resetValue) {
        response = await retrieveAvailableRouting(site);
      } else {
        response = await retrieveAvailableRoutings(site, formData.ncCode);
      }

      const transformedResponse = response.map((item: { handle: any; routing: string; }) => ({
        handle: item.handle,
        routingBO: item.routing,
      }));

      const availableUserGroupList = transformedResponse;

      const availableList = formData.availableRoutingItems && formData.availableRoutingItems.length > 0
        ? formData.availableRoutingItems
        : availableUserGroupList;

      const tempAvailableData = availableList.map((item: { routingBO: any; }, index: number) => ({
        key: uuidv4(), // Ensure unique key generation
        routingBO: item.routingBO, // Correctly map 'routingBO' to 'routingBO'
      }));

      const tempAssignedData = (formData.dispositionRoutingsList as any).map((group: any) => ({
        key: uuidv4(), // Ensure unique key generation
        routingBO: group.routingBO, // Correctly map 'routingBO' to 'routingBO'
      }));

      setAvailableRoutings(tempAvailableData);
      setAssignedRoutings(tempAssignedData);
      setIsLoading(false);
    } catch (error) {
      setFetchError('Failed to fetch data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const updatedUserGroups = assignedRoutings.map(item => ({
      routingBO: item.routingBO,
    }));
    setFormData(prev => ({
      ...prev,
      dispositionRoutingsList: updatedUserGroups || [],
    }));
  }, [assignedRoutings, setFormData]);

  const handleChange: TransferProps['onChange'] = (newTargetKeys, direction, moveKeys) => {
    if (direction === 'left') {
      const movedItems = assignedRoutings.filter(item => moveKeys.includes(item.key));
      const updatedAssignedRoutings = assignedRoutings.filter(item => !moveKeys.includes(item.key));
      const updatedAvailableRoutings = [...availableRoutings, ...movedItems];

      setAssignedRoutings(updatedAssignedRoutings);
      setAvailableRoutings(updatedAvailableRoutings);

      setFormData(prev => ({
        ...prev,
        dispositionRoutingsList: updatedAssignedRoutings.map(item => ({ routingBO: item.routingBO })),
        availableRoutingItems: updatedAvailableRoutings.map(item => ({ routingBO: item.routingBO })),
      }));
    } else {
      const movedItems = availableRoutings.filter(item => moveKeys.includes(item.key));
      const updatedAvailableRoutings = availableRoutings.filter(item => !moveKeys.includes(item.key));
      const updatedAssignedRoutings = [...assignedRoutings, ...movedItems];

      setAvailableRoutings(updatedAvailableRoutings);
      setAssignedRoutings(updatedAssignedRoutings);

      setFormData(prev => ({
        ...prev,
        dispositionRoutingsList: updatedAssignedRoutings.map(item => ({ routingBO: item.routingBO })),
        availableRoutingItems: updatedAvailableRoutings.map(item => ({ routingBO: item.routingBO })),
      }));
    }
    setFormChange(true);
  };

  const filterOption: TransferProps['filterOption'] = (inputValue, item) => {
    return item.routingBO.toLowerCase().includes(inputValue.toLowerCase());
  };

  const renderItem = (item: RecordType) => {
    return {
      label: <span className="custom-item">{item.routingBO}</span>, // Ensure 'routingBO' is used
      value: item.key,
    };
  };

  if (isLoading) {
    return <Spin tip="Loading..." />;
  }
  if (fetchError) {
    return <Alert message={fetchError} type="error" />;
  }

  return (
    <Transfer
      dataSource={availableRoutings.concat(assignedRoutings)}
      listStyle={{
        width: '50%',
        height: '50vh',
        margin: "20px"
      }}
      targetKeys={assignedRoutings.map(item => item.key)}
      onChange={handleChange}
      render={renderItem}
      titles={[t('availableRouting'), t('assignedRouting')]}
      showSearch
      filterOption={filterOption}
    />
  );
};

export default DispositionRoutings;