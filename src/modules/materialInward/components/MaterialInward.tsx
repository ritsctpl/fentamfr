import React, { useEffect, useState } from 'react';
import FormMaterial from './DynamicForm';
import Image from 'next/image';
import headLogo from '../images/headLogo.png';
import footerLogo from '../images/footerLogo.png';
import MyTable from './Table';
import ButtonRow from './ButtonRow';
import { LogoutOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import styles from '../styles/Tab.module.css';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import FormMaterials from './Form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@context/AuthContext';
const { Option } = Select;

const MaterialInward: React.FC = () => {
  const {  logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const { i18n, t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  const changeLanguage = (value) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
  };

  const handleLogout = () => {
    alert("Logged out!");
  };

  // if (loading) {
  //   return (
  //     <div style={{ textAlign: 'center', marginTop: '20%' }}>
  //       <Spin size="large" style={{ color: '#BFA061' }} />
  //     </div>
  //   );
  // }

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <>
      <div className={styles.pickListHeading}>
        <Image src={headLogo} alt="RITS Logo" style={{ width: '75px', height: 'auto', marginRight: '20px' }} onClick={handleLogoClick} />
        <h2>{t('materialInwardManagement')}</h2>
        <div className={styles.logOutSection}>
          <Select defaultValue='en' style={{ width: 120 }} onChange={changeLanguage}>
            <Option value="en">English</Option>
            <Option value="ka">ಕನ್ನಡ</Option>
            <Option value="ta">தமிழ்</Option>
            <Option value="hi">हिंदी</Option>
          </Select>
          <span style={{ marginLeft: '20px' }}>RITS  |</span>
          <span style={{ marginRight: '20px', marginLeft: '3px' }}><LogoutOutlined onClick={logout} /></span>
        </div>
      </div>

      <main style={{ padding: '20px', marginTop: '60px', marginBottom: '40px' }}>
        <FormMaterials />
        
      </main>

      <footer style={{ backgroundColor: '#BEA260', color: 'white', textAlign: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div className={styles.footer}>
          <Image src={footerLogo} alt="Fenta Logo" style={{ width: '95px', height: '55px' }} />
          <div style={{ color: 'gray' }}>&copy; {new Date().getFullYear()} Fenta Powered by Rits | All Rights Reserved</div>
        </div>
      </footer>
    </>
  );
};

export default MaterialInward;
