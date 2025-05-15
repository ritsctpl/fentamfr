'use client';

import React, { useState } from 'react';
import styles from '../styles/ActivityMaintenance.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { fetchTop50Activity } from '@services/activityService';
import { useTranslation } from 'react-i18next';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from '@modules/buyOff/components/userInstructions';
import { Button } from 'antd';


interface DataFieldCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setFilteredData: ([]) => void;
}

const ActivityCommonBar: React.FC<DataFieldCommonBarProps> = ({ onSearch, setFilteredData }) => {
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { t } = useTranslation()
  const manualContent = [
    {
      title: 'Activity Maintenance Screen User Manual',
      sections: [
        {
          title: '1. Introduction',
          content: {
            type: 'table',
            data: {
              rows: [
                { label: 'Purpose', value: 'To guide users on how to use the Activity Maintenance Screen for logging, updating, and tracking maintenance activities.' },
                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                { label: 'Module Name', value: 'Activity Maintenance' }
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
                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/activity_app' },
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
            data: 'Main Menu → Activity Maintenance → Activity Entry/Tracking'
          }
        },
        {
          title: '4. Screen Overview',
          content: {
            type: 'table',
            data: {
              headers: ['Section', 'Description'],
              rows: [
                { Section: 'Header', Description: 'Filters by Activity Id' },
                { Section: 'Activity Table', Description: 'Lists past activity records (columns like Activity Id, Description)' },
                { Section: 'Action Buttons', Description: '+ Add New, Edit, Full View, Clone, Delete' },
                { Section: 'Form Panel', Description: 'Form fields to log or update activity' }
              ]
            }
          }
        },
        {
          title: '5. Step-by-Step Instructions',
          subsections: [
            {
              title: '5.1. Add New Activity Record',
              content: {
                type: 'steps',
                data: [
                  'Click "(+) Add New"',
                  'Main Tab',
                  {
                    text: 'Fill in the required fields:',
                    subSteps: [
                      'Activity Id (Text)',
                      'Description (Text)',
                      'Activity Group (Dropdown)',
                      'Enabled (Switch)',
                      'Visible In Activity Manager (Switch)',
                      'Type (Dropdown)',
                      'Class / Program (Text)',
                      'List of Method (Browse)',
                    ]
                  },
                  'Navigate Main Tab → Activity Rules',
                  {
                    text: 'Add the activity rules for the Configuration',
                    subSteps: [
                      'Click "Add Rules"',
                      'Modal will open',
                      'Fill in the required fields:',
                      'Rules (Text)',
                      'Setting (Text)',
                      'Click "Add"',
                    ]
                  },
                  'Navigate Activity Rules Tab → Activity Hooks',
                  'Click "Insert"',
                  {
                    text: 'One by one Add the activity hooks for the activity',
                    subSteps: [
                      'Hook Point (Dropdown)',
                      'Activity (Browse)',
                      'Hookable Method (Text)',
                      'Enabled (Checkbox)',
                      'User Argument (Text)',
                    ]
                  },
                  'User can delete the activity hook by clicking the Remove button',
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
              title: '5.3. Clone Activity Record',
              content: {
                type: 'steps',
                data: [
                  'Select a record from the table',
                  'Click "Copy Button"',
                  'Change the Activity Id',
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
                { 'Field Name': 'Activity Id', Description: 'Unique identifier for the activity', Required: 'Yes' },
                { 'Field Name': 'Description', Description: 'Description of the activity', Required: 'NO' },
                { 'Field Name': 'Activity Group', Description: 'Activity Group of the activity', Required: 'Yes' },
                { 'Field Name': 'Enabled', Description: 'Enabled of the activity', Required: 'NO' },
                { 'Field Name': 'Visible In Activity Manager', Description: 'Visible In Activity Manager of the activity', Required: 'NO' },
                { 'Field Name': 'Type', Description: 'Type of the activity', Required: 'NO' },
                { 'Field Name': 'Class / Program', Description: 'Class / Program of the activity', Required: 'Yes' },
                { 'Field Name': 'List of Method', Description: 'List of Method of the activity', Required: 'NO' },
              ]
            }
          }
        },
        {
          title: '7. Activity Rules Field Definitions',
          content: {
            type: 'table',
            data: {
              headers: ['Field Name', 'Description', 'Required'],
              rows: [
                { 'Field Name': 'Rules', Description: 'Rules of the activity', Required: 'Yes' },
                { 'Field Name': 'Setting', Description: 'Setting of the activity', Required: 'Yes' },
              ]
            }
          }
        },
        {
          title: '8. Activity Hooks Field Definitions',
          content: {
            type: 'table',
            data: {
              headers: ['Field Name', 'Description', 'Required'],
              rows: [
                { 'Field Name': 'Hook Point', Description: 'Hook Point of the activity', Required: 'NO' },
                { 'Field Name': 'Activity', Description: 'Activity of the activity', Required: 'Yes' },
                { 'Field Name': 'Hookable Method', Description: 'Hookable Method of the activity', Required: 'No' },
                { 'Field Name': 'Enabled', Description: 'Enabled of the activity', Required: 'No' },
                { 'Field Name': 'User Argument', Description: 'User Argument of the activity', Required: 'No' },
              ]
            }
          }
        },
        {
          title: '9. FAQs / Troubleshooting',
          content: {
            type: 'table',
            data: {
              headers: ['Issue', 'Solution'],
              rows: [
                { Issue: 'Cannot save record', Solution: 'Check mandatory fields' },
                { Issue: 'Cannot edit closed record', Solution: 'Only Admin role can edit closed entries' },
                { Issue: 'Activity Not showing in Main Menu', Solution: 'Check the activity is visible in activity manager and enabled and the activity group is correct' },
                { Issue: 'Activity Not showing in Activity Entry/Tracking', Solution: 'Check the user group has access to the activity' }
              ]
            }
          }
        }
      ]
    }
  ];

  let activityTop50List;
  const handleFilter = () => {
    setFilter(prev => !prev);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    onSearch(searchTerm);
  };

  const handleItemFetch = () => {
    const fetchTop50Activities = async () => {
      const cookies = parseCookies();
      const site = cookies.site;

      try {
        activityTop50List = await fetchTop50Activity(site);
        setFilteredData(activityTop50List);
      }
      catch (error) {
        console.error('Error fetching top 50 activities:', error);
      }
    };

    fetchTop50Activities();
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
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={`${t('search')}...`}
            sx={{ ml: 1, flex: 1 }}
          />
          <IconButton
            type="button"
            sx={{ p: '10px' }}
            aria-label="search"
            onClick={handleSearchClick} // Trigger search on click
          >
            <SearchIcon className={styles.searchIcon} />
          </IconButton>
        </Paper>
        <div className={styles.goButton}>
          <Button type="primary" onClick={handleItemFetch}>
            {t("go")}
          </Button>
          <InstructionModal title="ActivityMaintenance">
            <UserInstructions manualContent={manualContent} />
          </InstructionModal>
        </div>
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
    </div>
  );
};

export default ActivityCommonBar;
