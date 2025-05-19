'use client';
 
import React, { useState } from 'react';
import styles from '@modules/templateCreater/styles/templateBuilder.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { parseCookies } from 'nookies';
import { getTop50Templates } from '@services/templateService';


interface TemplateBuilderBarProps {
  setFilteredData: (data: any) => void;
  handleSearchClicks: (searchTerm: string) => void;
  button: any;
}

const TemplateBuilderBar: React.FC<TemplateBuilderBarProps> = ({ setFilteredData, handleSearchClicks, button }) => {
  const {t} = useTranslation()
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    handleSearchClicks(searchTerm)
  };

  const handleGoClick = async () => {
      setSearchTerm('')
      const cookies = parseCookies();
      const site = cookies.site;
      try {
        const response = await getTop50Templates(site);
        setFilteredData(response);
      } catch (error) {
        console.error('Error fetching data fields:', error);
      }
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
        <Button onClick={handleGoClick} style={{marginRight:"10px"}} type="primary">{t("go")}</Button>
        {button}
       </div>
    </div>
  );
};

export default TemplateBuilderBar;
