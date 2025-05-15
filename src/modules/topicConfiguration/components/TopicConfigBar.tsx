'use client';

import React, { useState } from 'react';
import styles from '@/modules/topicConfiguration/styles/topicConfig.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import UserInstructions from '@modules/buyOff/components/userInstructions';
import InstructionModal from '@components/InstructionModal';


interface TopicBarProps {
  handleTop50: (searchTerm: string) => void;
  handleSearchClicks: (searchTerm: string) => void;
}

const TopicBar: React.FC<TopicBarProps> = ({ handleTop50, handleSearchClicks }) => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const manualContent = [
    {
      title: 'Topic Configuration User Manual',
      sections: [
        {
          title: '1. Introduction',
          content: {
            type: 'table',
            data: {
              rows: [
                { label: 'Purpose', value: 'To guide users on how to use the Topic Configuration Screen for logging, updating, and tracking topic configuration.' },
                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                { label: 'Module Name', value: 'Topic Configuration' }
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
                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/topic_configuration' },
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
            data: 'Main Menu → Topic Configuration → Topic Configuration Entry/Tracking'
          }
        },
        {
          title: '4. Screen Overview',
          content: {
            type: 'table',
            data: {
              headers: ['Section', 'Description'],
              rows: [
                { Section: 'Header', Description: 'Filters by Topic Name' },
                { Section: 'Topic Table', Description: 'Lists past topic records (columns like Topic Name, Api URL, Status)' },
                { Section: 'Action Buttons', Description: '+ Add New, Edit, Full View, Clone, Delete' },
                { Section: 'Form Panel', Description: 'Form fields to log or update topic' }
              ]
            }
          }
        },
        {
          title: '5. Step-by-Step Instructions',
          subsections: [
            {
              title: '5.1. Add New Topic Record',
              content: {
                type: 'steps',
                data: [
                  'Click "(+) Add New"',
                  'Main Tab',
                  {
                    text: 'Fill in the required fields:',
                    subSteps: [
                      'Topic Name (Text)',
                      'Api URL (Text)',
                      'Status (Switch)',
                    ]
                  },
                  'Click "Create"'
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
                { 'Field Name': 'Topic Name', Description: 'Unique identifier for the topic', Required: 'Yes' },
                { 'Field Name': 'Api URL', Description: 'Api URL of the topic', Required: 'NO' },
                { 'Field Name': 'Status', Description: 'Status of the topic', Required: 'NO' },
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
            placeholder={`${t('search')}...`}
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
      <div style={{ display: 'flex', padding: '10px', alignItems: 'center' }}>
        <Button style={{ marginRight: "20px" }} type='primary' onClick={handleGoClick}>{t("go")}</Button>
        <InstructionModal title="TopicConfigurationMaintenance">
          <UserInstructions manualContent={manualContent} />
        </InstructionModal>
      </div>
    </div>
  );
};

export default TopicBar;
