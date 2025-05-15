'use client';

import React, { useState } from 'react';
import styles from '../styles/ServiceExtension.module.css';
import {  IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { fetchTop50List } from '@services/serviceExtensionServices';

interface HookCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setFilteredData: ([]) => void;
}

const HookCommonBar: React.FC<HookCommonBarProps> = ({ onSearch, setFilteredData }) => {
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { t } = useTranslation()
  let hookTop50List;
 

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    onSearch(searchTerm);
  };

  const handleTop50Fetch = () => {
    const fetchTop50ItemGroup = async () => {
      const cookies = parseCookies();
      const site = cookies.site;

      try {
        hookTop50List = await fetchTop50List(site);
        hookTop50List = hookTop50List.map((item, index) => ({
          activityHookId: item.activityHookId,
          description: item.description,
          hookPoint: item.hookPoint,
          executionMode: item.executionMode,
        }));
        setFilteredData(hookTop50List);
      }
      catch (error) {
        console.error('Error fetching top 50 hook:', error);
      }
    };

    fetchTop50ItemGroup();
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
          <Button type='primary' onClick={handleTop50Fetch} >
            {t("go")}
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

export default HookCommonBar;
