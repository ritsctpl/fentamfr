'use client';

import React, { useState } from 'react';
import styles from '../styles/ItemGroupMaintenance.module.css';
import {  IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { fetchTop50Activity } from '@services/activityService';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { retrieveTop50ItemGroup } from '@services/itemGroupServices';

interface ItemGroupCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setFilteredData: ([]) => void;
  button: any;
}

const ItemGroupCommonBar: React.FC<ItemGroupCommonBarProps> = ({ onSearch, setFilteredData, button }) => {
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { t } = useTranslation()
  let itemGroupTop50List;
 

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
        itemGroupTop50List = await retrieveTop50ItemGroup(site);
        debugger
        itemGroupTop50List = itemGroupTop50List.map(item => ({
          ...item,
          itemGroup: item.itemGroup
        }));
        setFilteredData(itemGroupTop50List);
        // console.log("itemGroupTop50List: ", itemGroupTop50List);
      }
      catch (error) {
        console.error('Error fetching top 50 item group:', error);
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
            placeholder={`${t('search')}...`}
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
          <Button type='primary' onClick={handleItemGroupFetch} style={{marginRight: '10px'}}>
            {t("go")}
          </Button>
          {button}
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

export default ItemGroupCommonBar;
