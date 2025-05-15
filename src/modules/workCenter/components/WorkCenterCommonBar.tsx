'use client';

import React, { useState } from 'react';
import styles from '../styles/WorkCenterMaintenance.module.css';
import {  IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { fetchAllWorkCenter, fetchTop50WorkCenter } from '@services/workCenterService';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

interface CommonBarProps {
  onSearch: (searchTerm: string) => void;
  setFilteredData: ([]) => void;
  button: any;
}

const WorkCenterCommonBar: React.FC<CommonBarProps> = ({ onSearch, setFilteredData, button }) => {
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { t } = useTranslation()
  let oWCList;
  const handleFilter = () => {
    setFilter(prev => !prev);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    onSearch(searchTerm);
  };

  const handleFetch = () => {
    const fetchAllWC = async () => {
      const cookies = parseCookies();
      const site = cookies.site ;

      try {
        oWCList = await fetchTop50WorkCenter(site);
        setFilteredData(oWCList);
      }
      catch (error) {
        console.error('Error fetching top 50 WC:', error);
      }
    };

    fetchAllWC();
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
            onClick={handleSearchClick} // Trigger search on click
          >
            <SearchIcon className={styles.searchIcon} />
          </IconButton>
        </Paper>
        <div className={styles.goButton}>
          <Button onClick={handleFetch} style={{marginRight:"10px"}} type='primary'>
            {t("go")}
          </Button>
          {button}
        </div>
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
    </div>
  );
};

export default WorkCenterCommonBar;
