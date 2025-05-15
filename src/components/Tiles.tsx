// src/components/Tiles.tsx

import React from 'react';
import Tile from './Tile';
import { Box, Typography } from '@mui/material';
//import styles from '../app/manufacturing/rits/activity_maintenance_app/ActivityMaintenance.module.css';
import styles from './Tiles.module.css';

interface Activity {
  activityId: string; // Ensure this property is included
  description: string;
  url: string;
}

interface ActivityGroup {
  activityGroupDescription: string;
  activityList: Activity[];
}

interface TilesProps {
  activityGroups: ActivityGroup[];
}

const Tiles: React.FC<TilesProps> = ({ activityGroups }) => {
  return (
    <Box>
      {activityGroups.map((group, groupIndex) => (
        <Box key={groupIndex} className={styles.tabContainer}>
          <Typography className={styles.tabTitle}>
            {group.activityGroupDescription}
          </Typography>
          <Box className={styles.tileContainer}>
            {group.activityList.map((activity, activityIndex) => (
              <Tile
                key={activityIndex}
                description={activity.description}
                url={activity.url}
                activityId={activity.activityId}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Tiles;
