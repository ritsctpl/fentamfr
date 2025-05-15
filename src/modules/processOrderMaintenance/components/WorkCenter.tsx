import React, { useContext, useEffect, useState } from 'react';
import { Transfer, Spin, Alert } from 'antd';
import type { TransferProps } from 'antd';
import { UserContext } from '@modules/processOrderMaintenance/hooks/userContext';

import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid'; 
import { fetchUserWorkCenter } from '@services/processOrderService';

interface RecordType {
  key: string;
  workCenter: string;
}

interface WorkCenter {
  workCenter: string;
}

const UserGroup: React.FC = () => {
  const { formData, setFormData } = useContext(UserContext);
  const [availableData, setAvailableData] = useState<RecordType[]>([]);
  const [assignedData, setAssignedData] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      const response = await fetchUserWorkCenter(site, formData.user);
      const availableWorkCenterList = response.availableWorkCenterList;

      const tempAvailableData = availableWorkCenterList.map((item: { workCenter: string }, index: number) => ({
        key: index.toString(),
        workCenter: item.workCenter,
      }));

      const tempAssignedData = (formData.workCenters as WorkCenter[]).map((group: WorkCenter) => ({
        key: uuidv4(),
        workCenter: group.workCenter,
      }));

      setAvailableData(tempAvailableData);
      setAssignedData(tempAssignedData);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formData.user]);

  useEffect(() => {
    const updatedUserGroups = assignedData.map(item => ({
      workCenter: item.workCenter,
    }));

    setFormData(prev => ({
      ...prev,
      workCenters: updatedUserGroups,
    }));
  }, [assignedData, setFormData]);

  const handleChange: TransferProps['onChange'] = (newTargetKeys, direction, moveKeys) => {

    if (direction === 'left') {
      const movedItems = assignedData.filter(item => moveKeys.includes(item.key));
      setAssignedData(prev => prev.filter(item => !moveKeys.includes(item.key)));
      setAvailableData(prev => [...prev, ...movedItems]);
    } else {
      const movedItems = availableData.filter(item => moveKeys.includes(item.key));
      setAvailableData(prev => prev.filter(item => !moveKeys.includes(item.key)));
      setAssignedData(prev => [...prev, ...movedItems]);
    }
  };

  const filterOption: TransferProps['filterOption'] = (inputValue, item) => {
    return item.workCenter.toLowerCase().includes(inputValue.toLowerCase()); 
  };

  const renderItem = (item: RecordType) => {
    return {
      label: <span className="custom-item">{item.workCenter}</span>, 
      value: item.key,
    };
  };

  if (loading) {
    return <Spin tip="Loading..." />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <Transfer
      dataSource={availableData.concat(assignedData)}
      listStyle={{
        width: '50%',
        height: '50vh',
        margin: "20px"
      }}
      targetKeys={assignedData.map(item => item.key)}
      onChange={handleChange}
      render={renderItem}
      titles={['Available Work Center', 'Assigned Work Center']}
      showSearch
      filterOption={filterOption}
    />
  );
};

export default UserGroup;
