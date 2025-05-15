'use client';

import React, { useState } from 'react';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import styles from '../styles/FilterCommonBar.module.css';
import { useTranslation } from 'react-i18next';
import { Recipe } from '../types/recipeTypes';
import { fetchTop50Routing, retrieveAllRecipe } from '@services/recipeServices';
import InstructionModal from '@components/InstructionModal';
import { Button } from 'antd';
import RecipeManual from './RecipeManual';

interface DataFieldCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setData: (data: Recipe[]) => void; // Updated to accept an array of Data
}

const DataFieldCommonBar: React.FC<DataFieldCommonBarProps> = ({ onSearch, setData }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleItemFetch = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    try {
      const recipeTop50List = await retrieveAllRecipe(site);
      
      
      const filteredData = recipeTop50List.filter(row =>
        row.recipeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(filteredData,"recipeTop50List");
      setData(filteredData);
    } catch (error) {
      console.error('Error fetching data fields:', error);
    }
  
    // try {
    //   const operationData = await fetchTop50Routing(site);
    //   setData(operationData|| []);
      
    // } catch (error) {
    //   console.error('Error fetching Operations:', error);
    // }
  
  };
  const handleItemFetchGo = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
      try {
        const recipeTop50List = await fetchTop50Routing(site);
        // const filteredData = recipeTop50List.filter(row =>
        //   row.recipeName.toLowerCase().includes(searchTerm.toLowerCase())
        // );
        setData(recipeTop50List);
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
            onKeyDown={handleKeyDown} 
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
      
        <div style={{display:'flex', padding:'10px'}}>      <Button style={{marginRight:"20px"}} type='primary' onClick={handleItemFetchGo}>{t("go") }</Button>
           <InstructionModal title="Recipe Maintenance">
      <RecipeManual />
     </InstructionModal>
      </div> 
      </div>

    </div>
  );
};

export default DataFieldCommonBar;
