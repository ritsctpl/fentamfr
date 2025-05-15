'use client';

import React, { useState } from 'react';
import styles from '../styles/DataCollectionMaintenance.module.css';
import {  IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { Button } from 'antd';
import { t } from 'i18next';
import { fetchTop50DataCollection } from '@services/dataCollectionServices';

interface RoutingCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setFilteredData: (any) => void;
}

const RoutingCommonBar: React.FC<RoutingCommonBarProps> = ({ onSearch, setFilteredData }) => {
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  let itemTop50List;
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
    const fetchItemData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;

      try {
        itemTop50List = await fetchTop50DataCollection(site);
        console.log("top 50: ", itemTop50List)
        setFilteredData(itemTop50List);
      }
      catch (error) {
        console.error('Error fetching data fields:', error);
      }
    };

    fetchItemData();
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
          <Button type='primary' onClick={handleItemFetch}  >
            {t('go')}
          </Button>
          
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

export default RoutingCommonBar;
