"use client";

import React, { useState, useEffect, useContext } from "react";
import { Transfer } from "antd";
import type { TransferProps } from "antd/es/transfer";
import { parseCookies } from "nookies";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { certificationMaintenanceContext } from "@modules/certificationMaintenance/hooks/certificationMaintenanceContext";
import {
  fetchAvailableUserGroup,
} from "@services/certificationMaintenanceService";

interface AvailableUserGroupsType {
  key: string;
  userGroup: string;
}

interface UserGroupItem {
  userGroup: string;
}

interface AvailableUserGroupsProps {
  drag: boolean;
}

interface AvailableUserGroupsContextType {
  formData: {
    userGroupList?: UserGroupItem[];
    available?: AvailableUserGroupsType[];
    certification?: string;
    createdDateTime?: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<AvailableUserGroupsContextType["formData"]>
  >;
}

const AvailableUserGroups: React.FC<AvailableUserGroupsProps> = ({ drag }) => {
  const [mockData, setMockData] = useState<AvailableUserGroupsType[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const { t } = useTranslation();
  const { formData, setFormData } = useContext<AvailableUserGroupsContextType>(
    certificationMaintenanceContext
  );

  useEffect(() => {
    const fetchUserGroupsData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;

      try {
        if (formData.userGroupList && formData.available) {
          // Handle existing data
          const assignedWithKeys: AvailableUserGroupsType[] =
            formData.userGroupList.map((item) => ({
              key: uuidv4(),
              userGroup: item.userGroup,
            }));

          const availableWithKeys = formData.available;

          setMockData([...availableWithKeys, ...assignedWithKeys]);
          setTargetKeys(assignedWithKeys.map((item) => item.key));
        } else {
          if (drag) {
            // Handle new data
            const response = await fetchAvailableUserGroup(site);
            const available: AvailableUserGroupsType[] = Array.isArray(response)
              ? response.map((item: UserGroupItem) => ({
                  key: uuidv4(),
                  userGroup: item.userGroup,
                }))
              : [];

            setMockData(available);
            setTargetKeys([]);
          } else if (formData.userGroupList) {
            // Handle edit mode
            const availableResponse = await fetchAvailableUserGroup(site);

            const available: AvailableUserGroupsType[] = Array.isArray(
              availableResponse
            )
              ? availableResponse.map((item: UserGroupItem) => ({
                  key: uuidv4(),
                  userGroup: item.userGroup,
                }))
              : [];

            const assigned: AvailableUserGroupsType[] =
              formData.userGroupList.map((item) => ({
                key: uuidv4(),
                userGroup: item.userGroup,
              }));

            const filteredAvailable = available.filter(
              (item) =>
                !assigned.some(
                  (assignedItem) => assignedItem.userGroup === item.userGroup
                )
            );

            setMockData([...filteredAvailable, ...assigned]);
            setTargetKeys(assigned.map((item) => item.key));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserGroupsData();
  }, [drag, formData]);

  const handleChange: TransferProps["onChange"] = (newTargetKeys: string[]) => {
    setTargetKeys(newTargetKeys);

    const updatedAssignedUserGroups = mockData
      .filter((item) => newTargetKeys.includes(item.key))
      .map((item) => ({ userGroup: item.userGroup }));

    const updatedAvailableUserGroups = mockData.filter(
      (item) => !newTargetKeys.includes(item.key)
    );

    setFormData((prevData) => ({
      ...prevData,
      userGroupList: updatedAssignedUserGroups,
      available: updatedAvailableUserGroups,
    }));
  };

  const handleSearch: TransferProps["onSearch"] = (dir, value) => {
    console.log("Search:", dir, value);
  };

  const filterOption = (inputValue: string, option: AvailableUserGroupsType) =>
    option.userGroup.toLowerCase().includes(inputValue.toLowerCase());

  const renderItem = (item: AvailableUserGroupsType) => item.userGroup;

  return (
    <div style={{ padding: "20px" }}>
      <Transfer
        dataSource={mockData}
        showSearch
        filterOption={filterOption}
        targetKeys={targetKeys}
        onChange={handleChange}
        onSearch={handleSearch}
        render={renderItem}
        listStyle={{ width: "100%", height: 300 }}
        rowKey={(item) => item.key}
        titles={[t("availableUserGroups"), t("assignedUserGroups")]}
      />
    </div>
  );
};

export default AvailableUserGroups;
