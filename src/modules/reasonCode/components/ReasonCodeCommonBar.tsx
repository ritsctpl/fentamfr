'use client';

import React, { useState } from 'react';
import styles from '../styles/ReasonCodeMaintenance.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { fetchTop50ReasonCode } from '@services/reasonCodeService';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import InstructionModal from '@components/InstructionModal';
import ReasonCodeManual from './ReasonCodeMaintenancesManual';

interface ReasonCodeCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setFilteredData: ([]) => void;
}

const ReasonCodeCommonBar: React.FC<ReasonCodeCommonBarProps> = ({ onSearch, setFilteredData }) => {
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { t } = useTranslation();
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

      try {
        itemTop50List = await fetchTop50ReasonCode(site);
        console.log("Top 50: ", itemTop50List);
        setFilteredData(itemTop50List);
      }
      catch (error) {
        console.error('Error fetching data fields:', error);
      }
    };

    fetchItemData();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default form submission
      handleSearchClick();
    }
  };
  const handleGoClick = () => {
    onSearch(searchTerm);
  };

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
            onClick={handleSearchClick} // Trigger search on click
          >
            <SearchIcon className={styles.searchIcon} />
          </IconButton>
        </Paper>
        <div style={{ display: 'flex', padding: '10px' }}>
          <Button style={{ marginRight: "10px" }} type='primary' onClick={handleGoClick}>{t("go")}</Button>
          <InstructionModal>
            <ReasonCodeManual />
          </InstructionModal>
        </div>
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
    </div>
  );
};

export default ReasonCodeCommonBar;
