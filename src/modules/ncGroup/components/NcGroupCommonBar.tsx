'use client';

import React, { useState } from 'react';
import styles from '../styles/NcGroupMaintenance.module.css';
import {  IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { fetchTop50NcGroup } from '@services/ncGroupServices';

interface NcGroupCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setFilteredData: ([]) => void;
}

const NcGroupCommonBar: React.FC<NcGroupCommonBarProps> = ({ onSearch, setFilteredData }) => {
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { t } = useTranslation()
  let ncGroupTop50List;
 

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    onSearch(searchTerm);
  };

  const handleItemGroupFetch = () => {
    const fetchTop50ItemGroup = async () => {
      const cookies = parseCookies();
      const site = cookies.site;

      try {
        ncGroupTop50List = await fetchTop50NcGroup(site);
        debugger
        ncGroupTop50List = ncGroupTop50List.map((item, index) => ({
          ...item,
          id: index
        }));
        setFilteredData(ncGroupTop50List);
        // console.log("ncGroupTop50List: ", ncGroupTop50List);
      }
      catch (error) {
        console.error('Error fetching top 50 NC group:', error);
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
          <Button type='primary' onClick={handleItemGroupFetch} >
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

export default NcGroupCommonBar;
