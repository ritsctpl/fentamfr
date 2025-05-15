'use client';

import React, { useState } from 'react';
import { Button, IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import styles from '@modules/stageMaintenance/styles/FilterCommonBar.module.css';
import { useTranslation } from 'react-i18next';
import { fetchStage, fetchStageAllData } from '@services/stageService';
import { StageData } from '@modules/stageMaintenance/types/stageTypes';

interface DataFieldCommonBarProps {
  setData: (data: StageData[]) => void; // Updated to accept an array of Data
}

const DataFieldCommonBar: React.FC<DataFieldCommonBarProps> = ({ setData }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleItemFetch = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    if(searchTerm!==""){
    try {
      const stageTop50List = await fetchStageAllData(site);
      const filteredData = stageTop50List.filter(row =>
        row.operation.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setData(filteredData);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  }
  else{
    try {
      const stageData = await fetchStage(site);
      setData(stageData|| []);
      
    } catch (error) {
      console.error('Error fetching Stages:', error);
    }
  }
  };
  const handleItemFetchGo = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
      try {
        const stageTop50List = await fetchStage(site);
        const filteredData = stageTop50List.filter(row =>
          row.operation.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setData(filteredData);
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
        </div>
      </div>
    
    </div>
  );
};

export default DataFieldCommonBar;
