import React, { useState } from 'react';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import styles from '../styles/FilterCommonBar.module.css';
import { useTranslation } from 'react-i18next';
import { fetchShopAllData, fetchShopTop50 } from '@services/shopOrderService';
import { Button } from '@mui/material';

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
    if(searchTerm!==""){
      try {
        const shopOrderTop50List = await fetchShopAllData(site);
    console.log(shopOrderTop50List);

    const filteredData = shopOrderTop50List.filter(row =>
      row.shopOrder.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setData(filteredData);
      } catch (error) {
        console.error('Error fetching data fields:', error);
      }
    }
    else{
      try {
        const shopOrderData = await fetchShopTop50(site);
        setData(shopOrderData|| []);
        console.log(shopOrderData,"operationData");
        
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    }
   
  };
  const handleItemFetchGo = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
      try {
        const shopAllList = await fetchShopTop50(site);
        const filteredData = shopAllList.filter(row =>
          row.shiftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.shiftType.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log(filteredData,"filteredData");
        
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
          <Button variant="contained" color="primary" onClick={handleItemFetchGo} className={styles.blueButton}>
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
