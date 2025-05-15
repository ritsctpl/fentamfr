'use client';

import React, { useState } from 'react';
import styles from '../styles/CycleTime.module.css';
import { Button, IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';


interface UserGroupBarProps {
  handleSearchClicks: (searchTerm: string) => void;
  handleGoClick: () => void;
}

const CycleTimeBar: React.FC<UserGroupBarProps> = ({ handleSearchClicks, handleGoClick }) => {
  const {t} = useTranslation()
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    handleSearchClicks(searchTerm)
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default form submission
      handleSearchClick();
    }
  };
  
  const handleGoClicks = () => {
    handleSearchClicks(searchTerm)
    handleGoClick()
  }


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
            onClick={handleSearchClick} 
          >
            <SearchIcon className={styles.searchIcon} />
          </IconButton>
        </Paper>
        <div className={styles.goButton}> 
          <Button onClick={handleGoClicks} className={styles.blueButton} variant="contained">
            {t('go')}
          </Button>
        </div>
      </div>
     
    </div>
  );
};

export default CycleTimeBar;
