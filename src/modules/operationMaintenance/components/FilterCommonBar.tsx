'use client';
import React, { useState } from 'react';
import { Button, IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import styles from '@modules/operationMaintenance/styles/FilterCommonBar.module.css';
import { useTranslation } from 'react-i18next';
import { fetchOperation, fetchOperationAllData } from '@services/operationService';
import { OperationData } from '@modules/operationMaintenance/types/operationTypes';

interface DataFieldCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setData: (data: OperationData[]) => void; // Updated to accept an array of Data
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
      const operationTop50List = await fetchOperationAllData(site);
      const filteredData = operationTop50List.filter(row =>
        row.operation.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setData(filteredData);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  }
  else{
    try {
      const operationData = await fetchOperation(site);
      setData(operationData|| []);
      
    } catch (error) {
      console.error('Error fetching Operations:', error);
    }
  }
  };
  const handleItemFetchGo = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
      try {
        const operationTop50List = await fetchOperation(site);
        const filteredData = operationTop50List.filter(row =>
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
