'use client';

import React, { useState } from 'react';
import styles from '@modules/workflowIntegration/styles/WorkflowIntegration.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from '@modules/buyOff/components/userInstructions';


interface WorkflowIntegrationProps {
  handleSearchClicks: (searchTerm: string) => void;
}

const WorkflowIntegrationBar: React.FC<WorkflowIntegrationProps> = ({ handleSearchClicks }) => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState<string>('');

  const manualContent = [
    {
      title: 'Workflow Integration Maintenance User Manual',
      sections: [
        {
          title: '1. Introduction',
          content: {
            type: 'table',
            data: {
              rows: [
                { label: 'Purpose', value: 'To guide users on how to use the Workflow Integration Screen for logging, updating, and tracking workflow integration.' },
                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                { label: 'Module Name', value: 'Workflow Integration' }
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
                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/workflowIntegration_app' },
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
            data: 'Main Menu → Workflow Integration → Workflow Integration Entry/Tracking'
          }
        },
        {
          title: '4. Screen Overview',
          content: {
            type: 'table',
            data: {
              headers: ['Section', 'Description'],
              rows: [
                { Section: 'Header', Description: 'Filters by Workflow Integration Name' },
                { Section: 'Workflow Integration Table', Description: 'Lists past workflow integration records (columns like Identifier, Message Id, Type)' },
                { Section: 'Action Buttons', Description: '+ Add New, Edit, Full View, Clone, Delete' },
                { Section: 'Form Panel', Description: 'Form fields to log or update workflow integration' }
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
                      'Identifier (Text)',
                      'Type (Dropdown)',
                      'Message Id (Text)',
                      'Process By (Dropdown)',
                      'Transformation Type (Dropdown)',
                      'Per-Process Jolt (Text)',
                      'Post-Process Api (Text)',
                      'Api to Process (Text)',
                      'Post-Process Jolt (Browse)',
                      'Post-Process API (Dropdown)',
                      'Pass Handler (Text)',
                      'Fail Handler (Text)',
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
              title: '5.3. Clone Workflow Integration Record',
              content: {
                type: 'steps',
                data: [
                  'Select a record from the table',
                  'Click "Copy Button"',
                  'Change the Identifier',
                  'Change the Message Id',
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
                { 'Field Name': 'Identifier', Description: 'Unique identifier for the workflow integration', Required: 'Yes' },
                { 'Field Name': 'Type', Description: 'Type of the workflow integration', Required: 'Yes' },
                { 'Field Name': 'Message Id', Description: 'Message Id of the workflow integration', Required: 'No' },
                { 'Field Name': 'Process By', Description: 'Process By of the workflow integration', Required: 'NO' },
                { 'Field Name': 'Transformation Type', Description: 'Transformation Type of the workflow integration', Required: 'NO' },
                { 'Field Name': 'Per-Process Jolt', Description: 'Per-Process Jolt of the workflow integration', Required: 'NO' },
                { 'Field Name': 'Post-Process Api', Description: 'Post-Process Api of the workflow integration', Required: 'NO' },
                { 'Field Name': 'Api to Process', Description: 'Api to Process of the workflow integration', Required: 'Yes' },
                { 'Field Name': 'Post-Process Jolt', Description: 'Post-Process Jolt of the workflow integration', Required: 'NO' },
                { 'Field Name': 'Post-Process API', Description: 'Post-Process API of the workflow integration', Required: 'NO' },
                { 'Field Name': 'Pass Handler', Description: 'Pass Handler of the workflow integration', Required: 'NO' },
                { 'Field Name': 'Fail Handler', Description: 'Fail Handler of the workflow integration', Required: 'NO' },
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
            placeholder="Search..."
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

        <div style={{ marginRight: '20px' }}>
          <InstructionModal title="WorkflowIntegrationMaintenance">
            <UserInstructions manualContent={manualContent} />
          </InstructionModal>
        </div>
      </div>
    </div>
  );
};

export default WorkflowIntegrationBar;