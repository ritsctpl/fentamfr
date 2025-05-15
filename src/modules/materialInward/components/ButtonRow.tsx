import React from 'react';
import { Button, Space, notification } from 'antd';
import { useTranslation } from 'react-i18next';

interface ButtonRowProps {
    onClear: () => void; // Define the prop type for the callback
}

const ButtonRow: React.FC<ButtonRowProps> = ({ onClear }) => {
    const { t } = useTranslation(); 
    const buttonStyle = {
        backgroundColor: '#BEA260',
        color: 'white',
        borderColor: '#BEA260',
    };

    const handleButtonClick = (action: string) => {
        notification.success({
            message: <span style={{ color: '#000' }}>{t(action)}</span>,
            description: <span style={{ color: '#000' }}>{t(`${action}_message`)}</span>, // Optional: you can provide a description based on the action
            style: {
                backgroundColor: "#fff",
            },
        });
        
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Space>
                <Button
                    style={buttonStyle}
                    onClick={() => handleButtonClick('hold')}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor; // Revert back on mouse leave
                    }}
                >
                    {t('hold')}
                </Button>
                <Button 
                    style={buttonStyle}
                    onClick={() => handleButtonClick('receive')}
                >
                    {t('receive')}
                </Button>
                <Button 
                    style={buttonStyle}
                    onClick={() => handleButtonClick('reject')}
                >
                    {t('reject')}
                </Button>
                <Button 
                    style={buttonStyle} 
                    onClick={() => {
                        handleButtonClick('clear');
                        onClear(); // Call the clear callback after showing the notification
                    }}
                >
                    {t('clear')}
                </Button>
            </Space>
        </div>
    );
};

export default ButtonRow;
