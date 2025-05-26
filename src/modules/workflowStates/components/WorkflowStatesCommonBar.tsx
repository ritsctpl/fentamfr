'use client';

import React, { useState } from 'react';
import styles from '../styles/WorkflowStates.module.css';
import {  IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { retrieveTop50ApiConfigurations } from '@services/apiConfigurationService';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

interface DataFieldCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setFilteredData: ([]) => void;
}

const ApiConfigurationCommonBar: React.FC<DataFieldCommonBarProps> = ({ onSearch, setFilteredData }) => {
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { t } = useTranslation()
  let top50List;
 
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
        top50List = await retrieveTop50ApiConfigurations(site);
        
        if(!top50List.errorCode)
          setFilteredData(top50List);
      }
      catch (error) {
        console.error('Error fetching top 50 configurations:', error);
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
        {/* <div className={styles.goButton}>
          <Button type='primary' onClick={handleItemFetch} >
            {t("go")}
          </Button>
          {button}
        </div> */}
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

export default ApiConfigurationCommonBar;
