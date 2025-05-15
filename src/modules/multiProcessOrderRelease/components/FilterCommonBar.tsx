'use client';

import React, { useState } from 'react';
import styles from '@modules/processOrderRelease/styles/ProcessOrderRelease.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

interface MultiProcessOrderReleaseMainBarProps {
  handleTop50: (searchTerm: string) => void;
  handleSearchClicks: (searchTerm: string) => void;
  button: any;
}

const MultiProcessOrderReleaseMainBar: React.FC<MultiProcessOrderReleaseMainBarProps> = ({ handleTop50, handleSearchClicks, button }) => {
  const {t} = useTranslation()
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    handleSearchClicks(searchTerm)
  };

  const handleGoClick = () => {
    handleTop50(searchTerm)
    setSearchTerm('')
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
            placeholder="Search..."
            className={styles.searchInput}
            value={searchTerm}
            onKeyDown={handleKeyDown} 
            onChange={handleSearchChange}
           
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
      <div className={styles.goButton}>
          <Button onClick={handleGoClick} type='primary' >
            {t('go')}
          </Button>
          {button}
        </div>
    </div>
  );
};

export default MultiProcessOrderReleaseMainBar;
