'use client';

import React, { useState } from 'react';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import styles from '../styles/FilterCommonBar.module.css';
import { useTranslation } from 'react-i18next';
import { fetchUserAllData, fetchUserTop50 } from '@services/userService';
import { Button } from '@mui/material';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from '@modules/buyOff/components/userInstructions';

interface DataFieldCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setData: (data: any[]) => void; // Updated to accept an array of Data
}

const DataFieldCommonBar: React.FC<DataFieldCommonBarProps> = ({ onSearch, setData }) => {
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const manualContent = [
    {
      title: 'User Maintenance User Manual',
      sections: [
        {
          title: '1. Introduction',
          content: {
            type: 'table',
            data: {
              rows: [
                { label: 'Purpose', value: 'To guide users on how to use the User Maintenance Screen for logging, updating, and tracking users.' },
                { label: 'Target Users', value: 'Maintenance technicians, supervisors, and system admins.' },
                { label: 'Module Name', value: 'User Maintenance' }
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
                { Item: 'URL/Application Path', Description: 'http://localhost:8686/manufacturing/rits/user_maintenance_app' },
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
            data: 'Main Menu → User Maintenance → User Maintenance Entry/Tracking'
          }
        },
        {
          title: '4. Screen Overview',
          content: {
            type: 'table',
            data: {
              headers: ['Section', 'Description'],
              rows: [
                { Section: 'Header', Description: 'Filters by User Name' },
                { Section: 'User Table', Description: 'Lists past user records (columns like User Id (or) User Name, First Name, Last Name, Status)' },
                { Section: 'Action Buttons', Description: '+ Add New, Edit, Full View, Clone, Delete' },
                { Section: 'Form Panel', Description: 'Form fields to log or update user' }
              ]
            }
          }
        },
        {
          title: '5. Step-by-Step Instructions',
          subsections: [
            {
              title: '5.1. Add New User Record',
              content: {
                type: 'steps',
                data: [
                  'Click "(+) Add New"',
                  'Main Tab',
                  {
                    text: 'Fill in the required fields:',
                    subSteps: [
                      'User Name (Text)',
                      'First Name (Text)',
                      'Last Name (Text)',
                      'Email Address (Text)',
                      'Password (Text)',
                      'Confirm Password (Text)',
                      'Status (Dropdown)',
                      'Employee Number (Text)',
                      'ERP User (Text)',
                      'ERP Personal Number (Text)',
                    ]
                  },
                  'Navigate Main Tab → Sites',
                  {
                    text: 'Add the sites for the user',
                    subSteps: [
                      'One or more Sites can be selected from the list',
                      'User can be assigned to multiple sites',
                      'Only Admin role can assign sites to users',
                      'Click the Checkbox to select the site',
                    ]
                  },
                  'Navigate Sites Tab → User Group',
                  {
                    text: 'Add the roles for the user',
                    subSteps: [
                      'One or more elements can be selected from either column, one click on the proper direction button, and the transfer is done. The left column is considered the source and the right column is considered the target"',
                      'Right Side Column Available User Groups',
                      'Left Side Column Selected User Groups',
                      'Transfer Button (→) or (←) to move the user groups',
                      'Transfer all Check the top left Checkbox and click (→) or (←) to move all user groups',
                    ]
                  },
                  'Navigate User Group Tab → Work Center',
                  {
                    text: 'Add the work centers for the user',
                    subSteps: [
                      'One or more elements can be selected from either column, one click on the proper direction button, and the transfer is done. The left column is considered the source and the right column is considered the target"',
                      'Right Side Column Available Work Centers',
                      'Left Side Column Selected Work Centers',
                      'Transfer Button (→) or (←) to move the work centers',
                      'Transfer all Check the top left Checkbox and click (→) or (←) to move all work centers',
                    ]
                  },
                  'Navigate Work Center Tab → Labour Tracking',
                  'Click "Insert"',
                  {
                    text: 'Add the labour tracking for the user',
                    subSteps: [
                      'Valid from (Date)',
                      'Valid to (Date)',
                      'User Type (Dropdown)',
                      'Primary Shift (Text)',
                      'Secondary Shift (Text)',
                      'Cost Center (Text)',
                      'Default LCC (Text)',
                      'Department (Text)',
                      'Details (Text)',
                    ]
                  },
                  'User can delete the labour tracking by clicking the Remove button',
                  'Navigate Labour Tracking Tab → Supervisor',
                  'Click "Insert"',
                  {
                    text: 'Add the supervisor for the user',
                    subSteps: [
                      'Valid from (Date)',
                      'Valid to (Date)',
                      'Supervised CCS (Text)',
                    ]
                  },
                  'User can delete the supervisor by clicking the Remove button',
                  'Navigate Supervisor Tab → Labour Rules',
                  'Click "Insert"',
                  {
                    text: 'Add the labour rules for the user',
                    subSteps: [
                      'Laber Rule (Text)',
                      'Current Value (Text)',
                    ]
                  },
                  'User can delete the labour rules by clicking the Remove button',
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
              title: '5.3. Clone User Record',
              content: {
                type: 'steps',
                data: [
                  'Select a record from the table',
                  'Click "Clone Button"',
                  'Change the User Name',
                  'Change the First Name',
                  'Change the Last Name',
                  'Change the Email Address',
                  'Change the Password',
                  'Change the Confirm Password',
                  'Change the Status',
                  'Change the Employee Number',
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
                { 'Field Name': 'User Name', Description: 'Unique identifier for the user', Required: 'Yes' },
                { 'Field Name': 'First Name', Description: 'First name of the user', Required: 'Yes' },
                { 'Field Name': 'Last Name', Description: 'Last name of the user', Required: 'Yes' },
                { 'Field Name': 'Email Address', Description: 'Email address of the user', Required: 'Yes' },
                { 'Field Name': 'Password', Description: 'Password of the user', Required: 'Yes' },
                { 'Field Name': 'Confirm Password', Description: 'Confirm password of the user', Required: 'Yes' },
                { 'Field Name': 'Status', Description: 'Status of the user', Required: 'NO' },
                { 'Field Name': 'Employee Number', Description: 'Employee number of the user', Required: 'NO' },
                { 'Field Name': 'ERP User', Description: 'ERP user of the user', Required: 'NO' },
                { 'Field Name': 'ERP Personal Number', Description: 'ERP personal number of the user', Required: 'No' },
              ]
            }
          }
        },
        {
          title: '7. Labour Tracking',
          content: {
            type: 'table',
            data: {
              headers: ['Labour Tracking', 'Description', 'Required'],
              rows: [
                { 'Labour Tracking': 'Valid from', Description: 'Valid from of the labour tracking', Required: 'NO' },
                { 'Labour Tracking': 'Valid to', Description: 'Valid to of the labour tracking', Required: 'NO' },
                { 'Labour Tracking': 'User Type', Description: 'User type of the labour tracking', Required: 'NO' },
                { 'Labour Tracking': 'Primary Shift', Description: 'Primary shift of the labour tracking', Required: 'NO' },
                { 'Labour Tracking': 'Secondary Shift', Description: 'Secondary shift of the labour tracking', Required: 'NO' },
                { 'Labour Tracking': 'Cost Center', Description: 'Cost center of the labour tracking', Required: 'NO' },
                { 'Labour Tracking': 'Default LCC', Description: 'Default LCC of the labour tracking', Required: 'NO' },
                { 'Labour Tracking': 'Department', Description: 'Department of the labour tracking', Required: 'NO' },
                { 'Labour Tracking': 'Details', Description: 'Details of the labour tracking', Required: 'NO' },
              ]
            }
          }
        },
        {
          title: '8. Supervisor',
          content: {
            type: 'table',
            data: {
              headers: ['Supervisor', 'Description', 'Required'],
              rows: [
                { 'Supervisor': 'Valid from', Description: 'Valid from of the supervisor', Required: 'NO' },
                { 'Supervisor': 'Valid to', Description: 'Valid to of the supervisor', Required: 'NO' },
                { 'Supervisor': 'Supervised CCS', Description: 'Supervised CCS of the supervisor', Required: 'NO' },
              ]
            } 
          }
        },
        {
          title: '9. Labour Rules',
          content: {
            type: 'table',
            data: {
              headers: ['Labour Rules', 'Description', 'Required'],
              rows: [
                { 'Labour Rules': 'Laber Rule', Description: 'Laber rule of the labour rules', Required: 'Yes' },
                { 'Labour Rules': 'Current Value', Description: 'Current value of the labour rules', Required: 'NO' },
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
                { Issue: 'User Group not showing in User Maintenance', Solution: 'Check the user group is available in user group manager' },
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

  const handleItemFetch = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    if (searchTerm !== "") {
      try {
        const operationTop50List = await fetchUserAllData(searchTerm);
        console.log(operationTop50List);
        // ... existing code ...
        const extractedData = operationTop50List.map(({ user, lastName, status }) => ({
          user,
          lastName,
          status,
        }));
        // ... existing code ...
        // const filteredData = extractedData.filter(row =>
        //   row.user.toLowerCase().includes(searchTerm.toLowerCase())
        // );
        setData(extractedData);
      } catch (error) {
        console.error('Error fetching data fields:', error);
      }
    }
    else {
      try {
        const userData = await fetchUserTop50();
        const extractedData = userData.map(({ user, lastName, status }) => ({
          user,
          lastName,
          status,
        }));
        setData(extractedData || []);

      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
  };
  const handleItemFetchGo = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    try {
      const userAllList = await fetchUserTop50();
      // const filteredData = userAllList.filter(row =>
      //   row.shiftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      //   row.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      //   row.shiftType.toLowerCase().includes(searchTerm.toLowerCase())
      // );
      const extractedData = userAllList.map(({ user, lastName, status }) => ({
        user,
        lastName,
        status,
      }));
      setData(extractedData);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default form submission
      handleItemFetch();
    }
  };

  const { t } = useTranslation();

  return (
    <div className={styles.dataField}>
      <div className={styles.datafieldNav}>
        <Paper component="form" className={styles.searchPaper}>
          <InputBase
            placeholder={`${t('search')}...`}
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown} // Handle key down events
            sx={{ ml: 1, flex: 1 }}
          />
          <IconButton
            type="button"
            sx={{ p: '10px' }}
            aria-label="search"
            onClick={handleItemFetch} // Trigger search on click
          >
            <SearchIcon className={styles.searchIcon} />
          </IconButton>
        </Paper>
        <div className={styles.goButton}>
          <Button onClick={handleItemFetchGo} className={styles.blueButton} variant="contained">
            {t('go')}
          </Button>
          <InstructionModal title="UserMaintenance">
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

export default DataFieldCommonBar;
