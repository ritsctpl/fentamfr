'use client';

import React, { useState } from 'react';
import styles from '../styles/activityGroup.module.css';
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

const ActivityGroupBar: React.FC<UserGroupBarProps> = ({ handleTop50, handleSearchClicks }) => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const manualContent = [
    {
      title: 'Activity Group Maintenance User Manual',
      sections: [
        {
          title: '1. Introduction',
          content: {
            type: 'table',
            data: {
              rows: [
                { label: 'Purpose', value: 'To guide users on how to use the Activity Group Screen for logging, updating, and tracking maintenance activities.' },
                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                { label: 'Module Name', value: 'Activity Group' }
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
                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/activityGroup_app' },
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
            data: 'Main Menu → Activity Group → Activity Group Entry/Tracking'
          }
        },
        {
          title: '4. Screen Overview',
          content: {
            type: 'table',
            data: {
              headers: ['Section', 'Description'],
              rows: [
                { Section: 'Header', Description: 'Filters by Activity Group Name' },
                { Section: 'Activity Group Table', Description: 'Lists past activity group records (columns like Activity Group Name, Description, Activity Id)' },
                { Section: 'Action Buttons', Description: '+ Add New, Edit, Full View, Clone, Delete' },
                { Section: 'Form Panel', Description: 'Form fields to log or update activity group' }
              ]
            }
          }
        },
        {
          title: '5. Step-by-Step Instructions',
          subsections: [
            {
              title: '5.1. Add New Activity Group Record',
              content: {
                type: 'steps',
                data: [
                  'Click "(+) Add New"',
                  'Main Tab',
                  {
                    text: 'Fill in the required fields:',
                    subSteps: [
                      'Activity Group Name (Text)',
                      'Activity Group Description (Text)',
                    ]
                  },
                  'Navigate Main Tab → Activities',
                  {
                    text: 'Add the activities for the activity group',
                    subSteps: [
                      'One or more elements can be selected from either column, one click on the proper direction button, and the transfer is done. The left column is considered the source and the right column is considered the target"',
                      'Right Side Column Available Activities',
                      'Left Side Column Selected Activities',
                      'Transfer Button (→) or (←) to move the activities',
                      'Transfer all Check the top left Checkbox and click (→) or (←) to move all activities',
                    ]
                  },
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
              title: '5.3. Clone Activity Group Record',
              content: {
                type: 'steps',
                data: [
                  'Select a record from the table',
                  'Click "Copy Button"',
                  'Change the Activity Group Name',
                  'Change the Activity Group Description',
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
                { 'Field Name': 'Activity Group Name', Description: 'Unique identifier for the activity group', Required: 'Yes' },
                { 'Field Name': 'Activity Group Description', Description: 'Description of the activity group', Required: 'NO' },
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
                { Issue: 'Activities Not showing in Activity Group Maintenance', Solution: 'Check the activities are transferred to the activity group' }
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
      event.preventDefault(); // Prevent the default form submission
      handleSearchClick();
    }
  };

  return (
    <div className={styles.dataField}>
      <div className={styles.datafieldNav}>
        <Paper component="form" className={styles.searchPaper}>
          <InputBase
            placeholder={`${t('search')}...`}
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
            placeholder="Search..."
            inputProps={{ 'aria-label': 'filter-input' }}
          />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
        <Button style={{ marginRight: "20px" }} type='primary' onClick={handleGoClick}>{t("go")}</Button>
        <InstructionModal title="ActivityGroupMaintenance">
          <UserInstructions manualContent={manualContent} />
        </InstructionModal>
      </div>
    </div>
  );
};

export default ActivityGroupBar;
