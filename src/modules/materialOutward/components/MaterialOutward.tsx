import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import headLogo from '../images/headLogo.png';
import footerLogo from '../images/footerLogo.png';
import MyTable from './Table';
import ButtonRow from './ButtonRow';
import { LogoutOutlined } from '@ant-design/icons';
import styles from '../styles/Tab.module.css';
import { Select, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import FormMaterials from './Form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@context/AuthContext';
const { Option } = Select;

const MaterialOutward: React.FC = () => {
  const {  logout } = useAuth();
  const router = useRouter();
  // CSS styles
  const headerStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(190, 160, 96, 0.5)',
    padding: '10px 20px',
  };

  const logoStyle: React.CSSProperties = {
    width: '75px',
    height: 'auto',
    marginRight: '20px',
  };

  const headerTitleStyle: React.CSSProperties = {
    fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
    fontWeight: 600,
    fontSize: '24px',
    color: '#BEA060',
  };

  const logOutSectionStyle: React.CSSProperties = {
    marginRight: '20px',
    cursor: 'pointer',
  };

  const logOutTextStyle: React.CSSProperties = {
    fontWeight: 400,
    fontSize: '16px',
    color: '#BEA060',
  };

  const footerStyle: React.CSSProperties = {
    backgroundColor: '#BEA260',
    color: 'white',
    textAlign: 'center',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  };

  const footerContentStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };


  const [loading, setLoading] = useState(true);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);
  const changeLanguage = (value) => {
      i18n.changeLanguage(value);
      localStorage.setItem('language', value);
      console.error('i18n.changeLanguage is not available');
    
  };
  const handleLogoClick = () => {
    router.push('/');
  };

  // if (loading) {
  //   return (
  //     <div style={{ textAlign: 'center', marginTop: '20%' }}>
  //       <Spin size="large" style={{ color: '#BFA061' }} />
  //     </div>
  //   );
  // }
  return (
    <>
      <div className={styles.pickListHeading}>
            <Image src={headLogo} alt="RITS Logo" style={logoStyle} width={70} height={70} onClick={handleLogoClick}/>
            <h2>
              {t('DG Gate - Material Exit')}
            </h2>
            <div className={styles.logOutSection}>
            <Select defaultValue='en' style={{ width: 120 }} onChange={changeLanguage}> 
              <Option value="en">English</Option>
              <Option value="ka">ಕನ್ನಡ</Option>
              <Option value="ta">தமிழ்</Option>
              <Option value="hi">हिंदी</Option>
            </Select>
            <span style={{marginLeft:'20px'}}>RITS  |</span>
            <span style={{marginRight:'20px',marginLeft:'3px'}}>  <LogoutOutlined onClick={logout}/></span>
            </div>
      </div>
      
      <main style={{ padding: '20px', marginTop: '60px', marginBottom: '40px' }}>
        <FormMaterials />
        <ButtonRow />
      </main>
      
      <footer style={footerStyle}>
      <div className={styles.footer}>
      <Image src={footerLogo} alt="Fenta Logo" style={{ width: '95px', height: '55px' }} />
      <div style={{ color: 'gray' }}>&copy; {new Date().getFullYear()} Fenta Powered by Rits | All Rights Reserved</div>
      </div>
      </footer>
    </>
  );
};

export default MaterialOutward;
