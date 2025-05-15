'use client';

import React, { useState } from 'react';
import { Button, IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import styles from '../styles/FilterCommonBar.module.css';
import { useTranslation } from 'react-i18next';
import { fetchInventoryTop50 } from '@services/inventoryServices';

interface DataFieldCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setData: (data: any[]) => void; // Updated to accept an array of Data
}

const DataFieldCommonBar: React.FC<DataFieldCommonBarProps> = ({ onSearch, setData }) => {
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleItemFetch = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    
    try {
      // Fetch all inventory data regardless of search term
      const siteTop50List = await fetchInventoryTop50(site);
      console.log(siteTop50List);
      
      const processedData = siteTop50List.map(item => ({
        inventoryId: item.inventoryId,
        item: item.item, 
        qty: item.qty,
        receiveQty: item.receiveQty,
        version: item.version
      }));
      
      // If search term is empty, return all data
      // If search term is not empty, filter the data
      const filteredData = searchTerm 
        ? processedData.filter(row =>
            row.inventoryId.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : processedData;
      
      setData(filteredData || []);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  };
  const handleItemFetchGo = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
      try {
        const inventoryAllList = await fetchInventoryTop50(site);
        
        setData(inventoryAllList?.map(item => ({
          inventoryId: item.inventoryId,
          item: item.item,
          qty: item.qty, 
          receiveQty: item.receiveQty,
          version: item.version
        })) || []);
        setSearchTerm("");
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
