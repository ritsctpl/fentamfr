'use client';

import React, { useState } from 'react';
import styles from '@modules/bom/styles/bomStyles.module.css'
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface BomBarProps {
  handleSearchClicks: (searchTerm: string) => void;
  handleTop50: (val: any) => void;
}

const BomBar: React.FC<BomBarProps> = ({ handleSearchClicks, handleTop50 }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    handleSearchClicks(searchTerm);
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

      <Button style={{ marginRight: "20px" }} variant="contained" onClick={handleGoClick}>
        {t("go")}
      </Button>
    </div>
  );
};

export default BomBar;
