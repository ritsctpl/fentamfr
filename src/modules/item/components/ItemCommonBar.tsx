'use client';

import React, { useState } from 'react';
import styles from '@modules/item/styles/ItemMaintenance.module.css';
import {  IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { fetchTop50 } from '@services/itemServices';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import InstructionModal from '@components/InstructionModal';
import ItemManual from './ItemMaintenancesManual';

interface ItemCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setFilteredData: (searchTerm: any) => void;
}

const ItemCommonBar: React.FC<ItemCommonBarProps> = ({  onSearch, setFilteredData }) => {
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
      debugger
      try {
        itemTop50List = await fetchTop50(site);
        setFilteredData(itemTop50List);
      }
      catch (error) {
        console.error('Error searching item:', error);
      }
    };

    fetchItemData();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      handleSearchClick();
    }
  };

  const {t} = useTranslation() ;

  return (
    <div className={styles.dataField}>
      <div className={styles.datafieldNav}>
        <Paper component="form" className={styles.searchPaper}>
          <InputBase
            className={styles.searchInput}
            placeholder={`${t('search')}...`}
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
        <div className={styles.goButton}>
          
         
        </div>
        <div style={{display:'flex', padding:'10px'}}>    <Button style={{marginRight:'10px'}} onClick={handleItemFetch} type='primary'>
            {t('go')}
          </Button>
           <InstructionModal title='Item Maintenance'>
      <ItemManual />
     </InstructionModal>
      </div> 
      </div>
      {filter && (
        <div className={styles.searchFilter}>
          <InputBase
            style={{ marginLeft: '20px' }}
            inputProps={{ 'aria-label': 'filter-input' }}
          />
        </div>
      )}
    </div>
  );
};

export default ItemCommonBar;
