'use client';
 
import React, { useState } from 'react';
import styles from '@modules/resourceMaintenances/styles/resource.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';


interface DocumentCreatorBarProps {
  handleTop50: () => void;
  handleSearchClicks: (searchTerm: string) => void;
}

const DocumentCreatorBar: React.FC<DocumentCreatorBarProps> = ({ handleTop50, handleSearchClicks }) => {
  const {t} = useTranslation()
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    handleSearchClicks(searchTerm);
  };

  const handleGoClick = () => {
    handleTop50();
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
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={`${t('Search MFR No')}...`}
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
      <Button style={{marginRight:"20px"}} type='primary' onClick={handleGoClick}>{t("Go")}</Button>
    </div>
  );
};

export default DocumentCreatorBar;
