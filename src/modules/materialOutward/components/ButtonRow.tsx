import React from 'react';
import { Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';

const MaterialOutwardButtons: React.FC = () => {
    const { t } = useTranslation(); 
    const buttonStyle = {
        backgroundColor: '#BEA260',
        color: 'white',
        borderColor: '#BEA260',
    };

    const handleExport = () => console.log('Export action triggered');
    const handleShip = () => console.log('Ship action triggered');
    const handleCancel = () => console.log('Cancel action triggered');
    const handleArchive = () => console.log('Archive action triggered');

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Space>
                <Button
                    style={buttonStyle}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;
                    }}
                    onClick={handleExport}
                >
                    {t('Hold')}
                </Button>
                <Button style={buttonStyle} onClick={handleShip}>
                    {t('Ok')}
                </Button>
                <Button style={buttonStyle} onClick={handleCancel}>
                    {t('cancel')}
                </Button>
                {/* <Button style={buttonStyle} onClick={handleArchive}>
                    {t('archive')}
                </Button> */}
            </Space>
        </div>
    );
};

const MyPage: React.FC = () => {
    return (
        <MaterialOutwardButtons />
    );
};

export default MyPage;
