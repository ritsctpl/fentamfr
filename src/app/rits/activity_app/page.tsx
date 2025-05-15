
'use client';

import React from 'react';
import ActivityMaintenance from '@modules/activity/components/ActivityMaintenance'; // Adjust path as necessary

const ActivityMaintenancePage: React.FC = () => {
  return <ActivityMaintenance />;
};

export default ActivityMaintenancePage;

/*

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@services/api';
import styles from './ActivityMaintenance.module.css';
import { parseCookies } from 'nookies';

interface Activity {
  activityId: string;
  description: string;
  activityRules: { ruleName: string; setting: string }[] | null;
}

const ActivityMaintenance: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchActivities = async () => {
      const cookies = parseCookies();
      const site = cookies.site;// || 'RITS'; // default to 'RITS' if not found
      console.log("Site Value --"+ site);
      try {
        const response = await api.post('/activity-service/retrieveTop50', { site: site });
        setActivities(response.data.activityList);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, []);

  const navigateHome = () => {
    router.push('/'); // Ensure this matches your home page path
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Activity Maintenance</h1>
      <button className={styles.homeButton} onClick={navigateHome}>
        Home
      </button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Activity ID</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.activityId}>
              <td>{activity.activityId}</td>
              <td>{activity.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityMaintenance;
*/