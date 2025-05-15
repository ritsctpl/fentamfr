'use client';
 
import React, { useState } from 'react';
import styles from '@modules/lineClearance/styles/lineClearance.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import InstructionModal from '@components/InstructionModal';
import LineClearanceManual from './LineClearanceManual';


interface lineClearanceBarProps {
  handleTop50: (searchTerm: string) => void;
  handleSearchClicks: (searchTerm: string) => void;
}

const LineClearanceBar: React.FC<lineClearanceBarProps> = ({ handleTop50, handleSearchClicks }) => {
  const {t} = useTranslation()
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

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
  const renderDiv = () => {
    return (
<div style={{
    fontFamily: 'Arial, sans-serif',
    maxWidth: '900px',
    // margin: '40px auto',
    padding: '20px',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#000',
    backgroundColor: '#fff'
}}>
    <div style={{
        borderBottom: '2px solid #000',
        marginBottom: '30px',
        paddingBottom: '10px'
    }}>
        <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 0 5px 0'
        }}>Line Clearance Instructions</h1>
    </div>

    <div style={{ marginBottom: '25px' }}>
        <h2 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '15px',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
        }}>Add New Maintenance Record</h2>
        <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li style={{ marginBottom: '5px' }}>Click "+ Add New"</li>
            <li style={{ marginBottom: '5px' }}>
                Fill in required fields:
                <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                    <li>Template Name (Input) <span style={{ color: 'red' }}>*</span></li>
                    <li>Description</li>
                    <li>Clearance Time Limit</li>
                    <li>Max Pending Tasks</li>
                    <li>Clearance Reminder Interval</li>
                    <li>Notify On Completion</li>
                    <li>Enable Photo Evidence</li>
                </ul>
            </li>
            <li style={{ marginBottom: '5px' }}>Click "Save"</li>
        </ul>
    </div>

    <div style={{ marginBottom: '25px' }}>
        <h2 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '15px',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
        }}>Edit/Close/Delete Records</h2>
        <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li style={{ marginBottom: '5px' }}>To Edit: Select record → Click On Row → Update fields → Click "Save"</li>
            <li style={{ marginBottom: '5px' }}>To Close: Select in-progress record → Click "Cancel" Or Close Button on Top</li>
            <li style={{ marginBottom: '5px' }}>To Delete: Select draft record → Click "Delete Icon" → Confirm deletion</li>
        </ul>
    </div>

    <div style={{ marginBottom: '25px' }}>
        <h2 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '15px',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
        }}>Field Definitions</h2>
        <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '20px',
            border: '1px solid #000'
        }}>
            <thead>
                <tr>
                    <th style={{
                        border: '1px solid #000',
                        padding: '8px',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        backgroundColor: '#f5f5f5'
                    }}>Field Name</th>
                    <th style={{
                        border: '1px solid #000',
                        padding: '8px',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        backgroundColor: '#f5f5f5'
                    }}>Description</th>
                    <th style={{
                        border: '1px solid #000',
                        padding: '8px',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        backgroundColor: '#f5f5f5'
                    }}>Required</th>
                </tr>
            </thead>
            <tbody>
                {[
                    ['Template Name', 'Name of the maintenance template', '*'],
                    ['Description', 'Detailed description of the maintenance template', '-'],
                    ['Clearance Time Limit', 'Maximum time allowed for clearance', '-'],
                    ['Max Pending Tasks', 'Maximum number of pending tasks allowed', '-'],
                    ['Clearance Reminder Interval', 'Frequency of clearance reminders', '-'],
                    ['Notify On Completion', 'Enable notifications when tasks are completed', '-'],
                    ['Enable Photo Evidence', 'Require photo documentation', '-']
                ].map((row, index) => (
                    <tr key={index}>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>{row[0]}</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>{row[1]}</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>{row[2]}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

    <div style={{ marginBottom: '25px' }}>
        <h2 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '15px',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
        }}>Export Data</h2>
        <p>Click "Export" button to download maintenance records as Excel/PDF</p>
    </div>

    <div style={{ marginBottom: '25px' }}>
        <h2 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '15px',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
        }}>Troubleshooting</h2>
        <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li style={{ marginBottom: '5px' }}>Cannot save: Check all mandatory fields (*) are filled</li>
            <li style={{ marginBottom: '5px' }}>Check all tabs to ensure required fields are filled in</li>
        </ul>
    </div>
</div>
    )
  }

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
     <div style={{display:'flex', padding:'10px'}}><Button style={{marginRight:"20px"}} type='primary' onClick={handleGoClick}>{t("go")}</Button>
     <InstructionModal title='Line Clearance Maintenance'>
      <LineClearanceManual />
     </InstructionModal>
      </div> 
    </div>
  );
};

export default LineClearanceBar;
