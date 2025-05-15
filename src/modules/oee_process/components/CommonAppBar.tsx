// CommonAppBar.tsx
import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, TextField, Box, Autocomplete, IconButton, Menu, MenuItem, Icon } from '@mui/material';
import { siteServices } from '@services/siteServices'; // Import siteServices
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import FactoryIcon from '@mui/icons-material/Factory'; // Plant icon
import ContrastIcon from '@mui/icons-material/Contrast';
import styles from './CommonAppBar.module.css';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
// Import the image
import { parseCookies, setCookie } from 'nookies';
import api from '@services/api';
import { useTranslation } from 'react-i18next';
import { Select, Switch, theme } from 'antd';
import { DecodedToken } from '@modules/changeEquipmentStatus/types/changeEquipmentType';
import { Popover } from 'antd';
import { decryptToken } from '@utils/encryption';
import jwtDecode from 'jwt-decode';
import { useFilterContext } from '../hooks/filterData';
import { LogoutOutlined } from '@ant-design/icons';

const { Option } = Select;
interface CommonAppBarProps {
  allActivities: { description: string; url: string }[];
  username: string | null;
  site: string | null;
  appTitle: string;
  onSiteChange: (newSite: string) => void; // Add this prop
  defaultcolor: string | any
  image: any
}

const CommonAppBar: React.FC<CommonAppBarProps> = ({ appTitle, onSiteChange, defaultcolor, image }) => {
  const { isAuthenticated, token, logout } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userActivityGroups, setUserActivityGroups] = useState<any[]>([]);
  const [availableSites, setAvailableSites] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const [filteredActivities, setFilteredActivities] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const { i18n, t } = useTranslation();

  const changeLanguage = (value) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
    setCookie(null, 'language', value);
    console.error('i18n.changeLanguage is not available');

  };
  useEffect(() => {
    if (isAuthenticated && token) {
      try {
        const decryptedToken = decryptToken(token);
        const decoded: DecodedToken = jwtDecode<DecodedToken>(decryptedToken);
        setUsername(decoded.preferred_username);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    document.title = "OEE"
  }, [isAuthenticated, token]);
  useEffect(() => {
    const fetchSites = async () => {

      try {
        const response = await siteServices(username);
        if (Array.isArray(response)) {
          setAvailableSites(response);
        } else {
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();
  }, [username]);
  useEffect(() => {
    if (isAuthenticated && username) {
      api
        .post('/user-service/retrieve_detailed_user', { user: username })
        .then((response) => {
          const groups = response.data.userActivityGroupDetails;
          setUserActivityGroups(groups);
          setCookie(null, 'site', response.data.currentSite, { path: '/' });
          setSite(response.data.currentSite);
          setAvailableSites(response.data.site)
          setFilteredActivities(groups); // Set initial filtered activities
          setCookie(null, 'activities', JSON.stringify(response.data.userActivityGroupDetails), { path: '/' });

          // Flatten all activities for the search suggestions
          const activities = groups.flatMap((group: any) => group.activityList);
          setAllActivities(activities);
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
        });
    }
  }, [isAuthenticated, username]);

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleSearchChange = (event: React.ChangeEvent<{}>, newValue: string | null) => {
    const value = newValue || '';
    setSearchTerm(value);
  };

  const handleActivitySelect = (event: React.ChangeEvent<{}>, newValue: string | null) => {
    const selectedActivity = allActivities.find((activity) => activity.description === newValue);
    if (selectedActivity) {
      const cleanedUrl = selectedActivity.url.replace(/\/index\.html$/, '');
      router.push(cleanedUrl);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSiteChange = async (newSite: string) => {
    console.log(`Site changed to: ${newSite}`);
    setCookie(null, 'site', newSite, { path: '/' }); // Update the cookie
    onSiteChange(newSite); // Notify the parent about the site change


    try {
      const response = await siteServices(username);
      if (Array.isArray(response)) {
        setAvailableSites(response);
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    }

    setAnchorEl(null);
  };

  const cookies = parseCookies();
  const language = cookies.language || 'en';


  return (
    <AppBar position="static" style={{ background: 'none',width:'100%'}}>
      <Toolbar className={styles.toolbar}>
        <img src={image.src} alt="RITS Logo" className={styles.logo} onClick={handleLogoClick} />
        <Typography variant="h6" fontFamily={'robot'} className={styles.title}>
          {appTitle}
        </Typography>

        <Box className={styles.searchBox}>
          <Autocomplete
            freeSolo
            options={allActivities.map((option) => option.description)}
            inputValue={searchTerm}
            onInputChange={handleSearchChange}
            onChange={handleActivitySelect}
            filterOptions={(options, state) =>
              options.filter((option) => state.inputValue && option.toLowerCase().includes(state.inputValue.toLowerCase()))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                // placeholder={t('searchActivities')}
                className={styles.searchField}
                InputProps={{
                  ...params.InputProps,
                  classes: {
                    root: styles.searchFieldRoot,
                    notchedOutline: styles.noBorder,
                  },
                  endAdornment: (
                    <SearchOutlinedIcon style={{ color: '#0c4da2', marginLeft:1 ,fontSize:20}} />
                  ),
                }}
                
              />
            )}
          />
        </Box>

        <Box className={styles.userInfo}>
          <Typography variant="body1" className={styles.userText}>
            {username} | {site}
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen} className={styles.iconButton}>
            <FactoryIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              style: {
                maxHeight: 200,
                width: '20ch',
              },
            }}
          >

            {availableSites?.map((siteOption, index) => (
              <MenuItem key={index} onClick={() => handleSiteChange(siteOption)}>
                {siteOption}
              </MenuItem>
            ))}
          </Menu>
          <div>
            <Select defaultValue='en' style={{ width: 120 }} onChange={changeLanguage}>
              <Option value="en">English</Option>
              <Option value="ka">ಕನ್ನಡ</Option>
              <Option value="ta">தமிழ்</Option>
              <Option value="hi">हिंदी</Option>
            </Select>
          </div>
          <Button color="inherit" onClick={logout} className={styles.logoutButton}>
            <LogoutOutlined  color='#0c4da2'/>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CommonAppBar;