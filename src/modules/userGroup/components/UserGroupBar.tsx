'use client';

import React, { useState } from 'react';
import styles from '@modules/resourceMaintenances/styles/resource.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import UserInstructions from '@modules/buyOff/components/userInstructions';
import InstructionModal from '@components/InstructionModal';


interface UserGroupBarProps {
  handleTop50: (searchTerm: string) => void;
  handleSearchClicks: (searchTerm: string) => void;
}

const UserGroupBar: React.FC<UserGroupBarProps> = ({ handleTop50, handleSearchClicks }) => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const manualContent = [
    {
      title: 'User Group Maintenance User Manual',
      sections: [
        {
          title: '1. Introduction',
          content: {
            type: 'table',
            data: {
              rows: [
                { label: 'Purpose', value: 'To guide users on how to use the User Group Screen for logging, updating, and tracking maintenance activities.' },
                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                { label: 'Module Name', value: 'User Group' }
              ]
            }
          }
        },
        {
          title: '2. System Access',
          content: {
            type: 'table',
            data: {
              headers: ['Item', 'Description'],
              rows: [
                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/userGroup_app' },
                { Item: 'Login Requirement', Description: 'Username & Password' },
                { Item: 'Access Roles', Description: 'Technician, Supervisor, Admin' }
              ]
            }
          }
        },
        {
          title: '3. Navigation Path',
          content: {
            type: 'text',
            data: 'Main Menu → User Group → User Group Entry/Tracking'
          }
        },
        {
          title: '4. Screen Overview',
          content: {
            type: 'table',
            data: {
              headers: ['Section', 'Description'],
              rows: [
                { Section: 'Header', Description: 'Filters by User Group Name' },
                { Section: 'User Group Table', Description: 'Lists past user group records (columns like User Group, Description)' },
                { Section: 'Action Buttons', Description: '+ Add New, Edit, Full View, Clone, Delete' },
                { Section: 'Form Panel', Description: 'Form fields to log or update user group' }
              ]
            }
          }
        },
        {
          title: '5. Step-by-Step Instructions',
          subsections: [
            {
              title: '5.1. Add New User Group Record',
              content: {
                type: 'steps',
                data: [
                  'Click "(+) Add New"',
                  'Main Tab',
                  {
                    text: 'Fill in the required fields:',
                    subSteps: [
                      'User Group (Text)',
                      'Description (Text)',
                      'Pod (Browse)',
                    ]
                  },
                  'Navigate Main Tab → Users',
                  {
                    text: 'Add the users for the user group',
                    subSteps: [
                      'One or more elements can be selected from either column, one click on the proper direction button, and the transfer is done. The left column is considered the source and the right column is considered the target"',
                      'Right Side Column Available Users',
                      'Left Side Column Selected Users',
                      'Transfer Button (→) or (←) to move the users',
                      'Transfer all Check the top left Checkbox and click (→) or (←) to move all users',
                    ]
                  },
                  'Navigate Users Tab → Activity Group',
                  {
                    text: 'Add the activity groups for the user group',
                    subSteps: [
                      'One or more elements can be selected from list tree view',
                      'Click "(+)" to add the activity group',
                      'Select the activity group from the list tree view',
                    ]
                  },
                  'User can delete the activity group by Uncheck the activity group from the list tree view',
                  'Click "Save"'
                ]
              }
            },
            {
              title: '5.2. Edit Existing Record',
              content: {
                type: 'steps',
                data: [
                  'Select a record from the table',
                  'Click "Edit"',
                  'Modify the necessary fields',
                  'Click "Update"'
                ]
              }
            },
            {
              title: '5.3. Clone User Group Record',
              content: {
                type: 'steps',
                data: [
                  'Select a record from the table',
                  'Click "Copy Button"',
                  'Change the User Group',
                  'Change the Description',
                  'Click "Copy"'
                ]
              }
            },
            {
              title: '5.4. Delete a Record',
              content: {
                type: 'steps',
                data: [
                  'Select a record from the table',
                  'Click "Delete Button"',
                  'Confirm the prompt'
                ]
              }
            },
          ]
        },
        {
          title: '6. Field Definitions',
          content: {
            type: 'table',
            data: {
              headers: ['Field Name', 'Description', 'Required'],
              rows: [
                { 'Field Name': 'User Group', Description: 'Unique identifier for the user group', Required: 'Yes' },
                { 'Field Name': 'Description', Description: 'Description of the user group', Required: 'NO' },
                { 'Field Name': 'Pod', Description: 'Pod of the user group', Required: 'NO' },
              ]
            }
          }
        },
        {
          title: '7. FAQs / Troubleshooting',
          content: {
            type: 'table',
            data: {
              headers: ['Issue', 'Solution'],
              rows: [
                { Issue: 'Cannot save record', Solution: 'Check mandatory fields' },
                { Issue: 'Cannot edit closed record', Solution: 'Only Admin role can edit closed entries' },   
                { Issue: 'Activity Group Not showing in Activity Entry/Tracking', Solution: 'Check the activity is available in activity manager and enabled' },
              ]
            }
          }
        }
      ]
    }
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    handleSearchClicks(searchTerm)
  };

  const handleGoClick = () => {
    handleTop50(searchTerm)
    setSearchTerm('')
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearchClick();
    }
  };

  return (
    <div className={styles.dataField}>
      <div className={styles.datafieldNav}>
        <Paper component="form" className={styles.searchPaper}>
          <InputBase
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            sx={{ ml: 1, flex: 1 }}
          />
          <IconButton
            type="button"
            sx={{ p: '10px' }}
            aria-label="search"
            onClick={handleSearchClick}
          >
            <SearchIcon className={styles.searchIcon} />
          </IconButton>
        </Paper>
      </div>
      {filter && (
        <div className={styles.searchFilter}>
          <InputBase
            style={{ marginLeft: '20px' }}
            placeholder={`${t('search')}...`}
            inputProps={{ 'aria-label': 'filter-input' }}
          />
        </div>
      )}
      <div style={{ display: "flex", padding: "10px", alignItems: "center" }}>
        <Button style={{ marginRight: "20px" }} type='primary' onClick={handleGoClick}>{t("go")}</Button>
        <InstructionModal title="UserGroupMaintenance">
          <UserInstructions manualContent={manualContent} />
        </InstructionModal>
      </div>
    </div>
  );
};

export default UserGroupBar;
