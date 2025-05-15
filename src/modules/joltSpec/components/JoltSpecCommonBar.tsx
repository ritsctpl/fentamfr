'use client';

import React, { useState } from 'react';
import styles from '../styles/ActivityMaintenance.module.css';
import {  IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { fetchTop50Activity } from '@services/activityService';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { fetchTop50Specs } from '@services/joltSpecService';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from '@modules/buyOff/components/userInstructions';

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
      title: 'Jolt Spec Maintenance User Manual',
      sections: [
        {
          title: '1. Introduction',
          content: {
            type: 'table',
            data: {
              rows: [
                { label: 'Purpose', value: 'To guide users on how to use the Jolt Spec Screen for logging, updating, and tracking maintenance activities.' },
                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                { label: 'Module Name', value: 'Jolt Spec' }
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
                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/joltSpec_app' },
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
            data: 'Main Menu → Jolt Spec → Jolt Spec Entry/Tracking'
          }
        },
        {
          title: '4. Screen Overview',
          content: {
            type: 'table',
            data: {
              headers: ['Section', 'Description'],
              rows: [
                { Section: 'Header', Description: 'Filters by Jolt Spec Name' },
                { Section: 'Jolt Spec Table', Description: 'Lists past jolt spec records (columns like Jolt Spec Name, Description, Jolt Spec Id)' },
                { Section: 'Action Buttons', Description: '+ Add New, Edit, Full View, Clone, Delete' },
                { Section: 'Form Panel', Description: 'Form fields to log or update jolt spec' }
              ]
            }
          }
        },
        {
          title: '5. Step-by-Step Instructions',
          subsections: [
            {
              title: '5.1. Add New Jolt Spec Record',
              content: {
                type: 'steps',
                data: [
                  'Click "(+) Add New"',
                  'Main Tab',
                  {
                    text: 'Fill in the required fields:',
                    subSteps: [
                      'Jolt Spec Name (Text)',
                      'Jolt Spec Description (Text)',
                      'Type (Dropdown)',
                      'Jolt Spec (Text Area)',
                    ]
                  },
                  {
                    text: 'Type (Dropdown)',
                    subSteps: [
                      'JOLT',
                      'XSLT',
                      'JSONATA',
                    ]
                  },
                  {
                    text: 'Jolt Spec (Text Area)',
                    subSteps: [
                      'Paste the jolt spec in the text area this format is based on the type selected',
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
              title: '5.3. Clone Jolt Spec Record',
              content: {
                type: 'steps',
                data: [
                  'Select a record from the table',
                  'Click "Copy Button"',
                  'Change the Jolt Spec Name',
                  'Change the Jolt Spec Description',
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
                { 'Field Name': 'Jolt Spec Name', Description: 'Unique identifier for the jolt spec', Required: 'Yes' },
                { 'Field Name': 'Jolt Spec Description', Description: 'Description of the jolt spec', Required: 'NO' },
                { 'Field Name': 'Type', Description: 'Type of the jolt spec', Required: 'Yes' },
                { 'Field Name': 'Jolt Spec', Description: 'Jolt spec in the selected type', Required: 'Yes' },
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
                { Issue: 'Jolt Spec is not working', Solution: 'Check the jolt spec is correct format' }
                
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
    const fetchTop50 = async () => {
      const cookies = parseCookies();
      const site = cookies?.site;
      try {
        activityTop50List = await fetchTop50Specs(site);
        
        if(!activityTop50List.errorCode)
          setFilteredData(activityTop50List);
      }
      catch (error) {
        console.error('Error fetching top 50 specs:', error);
      }
    };

    fetchTop50();
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
            placeholder='Search...'
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
          <Button type='primary' onClick={handleItemFetch} >
            {t("go")}
          </Button>
          <InstructionModal title="JoltSpecMaintenance">
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
