import { Typography } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';
import { parseCookies } from 'nookies';
const NoDataFound = () => {
  const cookies = parseCookies();
  const site = cookies.site;
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '20px', 
      height: '300px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '8px'
    }}>
      <FileSearchOutlined style={{
        fontSize: '48px',
        color: site?.toLowerCase() === 'rsits' ? 'rgb(226, 69, 77)' : site?.toLowerCase() === 'rits' ? '#EC7823'  : '#bfbfbf',
        marginBottom: '12px'
      }}/>
      <h3 style={{
        color: site?.toLowerCase() === 'rsits' ? '#0B499D' : site?.toLowerCase() === 'rits' ? 'rgb(4,97,105)'  : '#bfbfbf',
        fontSize: '16px',
        fontWeight: 500,
        margin: 0
      }}>No data found</h3>

    </div>
  );
};

export default NoDataFound;
