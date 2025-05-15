import { TbFileSearch } from "react-icons/tb";

import { parseCookies } from 'nookies';
const NoDataFound = () => {
  const cookies = parseCookies();
  const site = cookies.site;
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '20px', 
      height: 'calc(100vh - 305px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '8px'
    }}>
      <TbFileSearch  style={{
        fontSize: '48px',
        color: site?.toLowerCase() === 'rits' ? '#EF3639' : site?.toLowerCase() !== 'rits' ? '#EC7823'  : '#bfbfbf',
        marginBottom: '12px'
      }}/>
      <h3 style={{
        color: site?.toLowerCase() === 'rits' ? 'rgb(0,90,96)' : site?.toLowerCase() !== 'rits' ? 'rgb(4,97,105)'  : '#bfbfbf',
        fontSize: '16px',
        fontWeight: 500,
        margin: 0
      }}>No data found</h3>

    </div>
  );
};

export default NoDataFound;
