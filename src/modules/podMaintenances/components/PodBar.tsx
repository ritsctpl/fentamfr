'use client';

import React, { useState } from 'react';
import styles from '@modules/podMaintenances/styles/podMainStyles.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';


interface PodBarProps {
  handleSearchClicks: (searchTerm: string) => void;
  handleTop50: (searchTerm: string) => void;
  button: any
}

const PodBar: React.FC<PodBarProps> = ({ handleSearchClicks, handleTop50, button }) => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    handleSearchClicks(searchTerm)
  };

  const handleGoClick = () => {
    handleTop50(searchTerm); 
    setSearchTerm(''); 
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      handleSearchClick();
    }
  };

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
        <Button style={{marginRight:"10px"}} type='primary' onClick={handleGoClick}>{t("go")}</Button>
        {button}
      </div>
    </div>
  );
};

export default PodBar;
