import React, { useContext, useEffect, useState } from 'react';
import { Transfer, Spin, Alert } from 'antd';
import type { TransferProps } from 'antd';
import { ItemGroupContext } from '../hooks/itemGroupContext';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid'; // Import UUID library
import { retrieveAvailableDocumentList } from '@services/itemServices';
import { useTranslation } from 'react-i18next';
import { retrieveAvailableItems } from '@services/itemGroupServices';
interface RecordType {
  key: string;
  item: string; // Updated property name
}
interface ItemGroup {
  item: string;
}
interface DragDropTableProps {
  setActiveTab: (tab: number) => void;
}


const GroupMember: React.FC<DragDropTableProps> = ({setActiveTab }) => {
  const { payloadData, setPayloadData, setShowAlert, resetValue, addClickCount } = useContext<any>(ItemGroupContext);
  const [availableData, setAvailableData] = useState<RecordType[]>([]);
  const [assignedData, setAssignedData] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // useEffect(() => {
  //   const cookies = parseCookies();
  //   const site = cookies.site;
  //   if (resetValue) {
  //     const fetchItems = async () => {
  //       const response = await retrieveAvailableItems(site, "");
  //       const availableList = payloadData.availableItems && payloadData.availableItems.length > 0
  //       ? payloadData.availableItems
  //       : response;

  //     const tempAvailableData = availableList.map((item: {
  //       item: any; 
  //     }, index: number) => ({
  //       key: uuidv4(), 
  //       item: item.item,
  //     }));
  //       setAvailableData(tempAvailableData);
  //       setAssignedData([]);
  //     };
  //     fetchItems();
  //   }
  // }, [ addClickCount]);


 
  const fetchData = async () => {
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      let response;
      debugger
      if (resetValue) {
        response = await retrieveAvailableItems(site, "");
      } else {
        response = await retrieveAvailableItems(site, payloadData.itemGroup);
      }

      // console.log(response);
      const availableUserGroupList = response;
      // console.log(availableUserGroupList);

      // Use payloadData.availableItems if available, otherwise use availableUserGroupList
      const availableList = payloadData.availableItems && payloadData.availableItems.length > 0
        ? payloadData.availableItems
        : availableUserGroupList;

      // Transform data into the format required by Transfer component
      const tempAvailableData = availableList.map((item: {
        item: any;
      }, index: number) => ({
        key: uuidv4(), // Use index or any unique identifier
        item: item.item,
      }));

      // Initialize assignedData with payloadData.groupMemberList
      const tempAssignedData = (payloadData.groupMemberList as ItemGroup[]).map((group: ItemGroup) => ({
        key: uuidv4(), // Generate a unique key
        item: group.item,
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
  }, [payloadData.item]); // Dependency on payloadData.item if needed
  // Update context data when assignedData changes
  useEffect(() => {
    // Convert assignedData back to the format of payloadData.userGroups
    const updatedUserGroups = assignedData.map(item => ({
      item: item.item,
    }));
    setPayloadData(prev => ({
      ...prev,
      groupMemberList: updatedUserGroups || [],
    }));
  }, [assignedData, setPayloadData]);



  const handleChange: TransferProps['onChange'] = (newTargetKeys, direction, moveKeys) => {
    // console.log('handleChange called', { newTargetKeys, direction, moveKeys });

    if (direction === 'left') {
      // Items moved from right to left
      const movedItems = assignedData.filter(item => moveKeys.includes(item.key));
      const updatedAssignedData = assignedData.filter(item => !moveKeys.includes(item.key));
      const updatedAvailableData = [...availableData, ...movedItems];

      setAssignedData(updatedAssignedData);
      setAvailableData(updatedAvailableData);

      // Update payloadData with new availableItems and groupMemberList
      setPayloadData(prev => ({
        ...prev,
        groupMemberList: updatedAssignedData.map(item => ({ item: item.item })),
        availableItems: updatedAvailableData.map(item => ({ item: item.item })),
      }));
    } else {
      // Items moved from left to right
      const movedItems = availableData.filter(item => moveKeys.includes(item.key));
      const updatedAvailableData = availableData.filter(item => !moveKeys.includes(item.key));
      const updatedAssignedData = [...assignedData, ...movedItems];

      setAvailableData(updatedAvailableData);
      setAssignedData(updatedAssignedData);

      // Update payloadData with new availableItems and groupMemberList
      setPayloadData(prev => ({
        ...prev,
        groupMemberList: updatedAssignedData.map(item => ({ item: item.item })),
        availableItems: updatedAvailableData.map(item => ({ item: item.item })),
      }));
    }
    setShowAlert(true);
    // console.log('Updated assignedData:', assignedData);
    // console.log('Updated availableData:', availableData);
  };


  const filterOption: TransferProps['filterOption'] = (inputValue, item) => {
    return item.item.toLowerCase().includes(inputValue.toLowerCase()); 
  };
  const renderItem = (item: RecordType) => {
    return {
      label: <span className="custom-item">{item.item}</span>, 
      value: item.key,
    };
  };
  if (loading) {
    return <Spin tip="Loading..." />;
  }
  if (error) {
    return <Alert message={error} type="error" />;
  }
  // console.log("Payload data from print docs : ", payloadData);
  return (
    <Transfer
      dataSource={availableData.concat(assignedData)} // Combined data source
      listStyle={{
        width: '50%',
        height: '50vh',
        margin: "20px"
      }}
      targetKeys={assignedData.map(item => item.key)}
      onChange={handleChange}
      render={renderItem}
      titles={[t('availableItems'), t('assignedItems')]}
      showSearch
      filterOption={filterOption}
    />
  );
};
export default GroupMember;