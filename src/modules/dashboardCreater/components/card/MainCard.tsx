import React, { useState } from 'react';
import { Button, Card, Modal } from 'antd';
import styled from '@emotion/styled';
import { FullscreenOutlined } from '@ant-design/icons';
interface MainCardProps {
    title?: string;
    children?: React.ReactNode;
    style?: any;
    ref?: (element: HTMLElement) => void;
    onClick?: (e: React.MouseEvent) => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
}

const StyledCard = styled(Card)<{ $hoverStyles: any }>`
    transition: all 0.3s ease;
    &:hover {
        box-shadow: ${props => props.$hoverStyles.boxShadow};
        transform: ${props => props.$hoverStyles.transform};
        border-color: ${props => props.$hoverStyles.borderColor};
    }
`;

const MainCard: React.FC<MainCardProps> = ({ title, children, style, ref, onClick, onMouseEnter }) => {
    const {
        titleColor,
        titleFontSize,
        titleFontWeight,
        titleAlign,
        titlePadding,
        contentPadding,
        contentBackground,
        contentLayout,
        contentGap,
        borderStyle,
        borderWidth,
        borderColor,
        hoverShadow,
        hoverScale,
        hoverBorderColor,
        height,
        width,
        ...restStyle
    } = style || {};

    const [isModalOpen, setIsModalOpen] = useState(false);

    const containerStyle: React.CSSProperties = {
        height:'100%',
        width: '100%',
        ...restStyle,
        minHeight: '100px'
    };

    const headStyle: React.CSSProperties = {
        padding: titlePadding || '0 16px',
        fontSize: titleFontSize || '16px',
        fontWeight: titleFontWeight || 500,
        color: titleColor,
        textAlign: titleAlign,
        minHeight: '10px',
        borderBottom: '1px solid #f0f0f0'
    };

    const bodyStyle: React.CSSProperties = {
        padding: contentPadding || '16px',
        height: '100%',
        minHeight: '100px',
        overflow: 'auto',
        backgroundColor: contentBackground,
        display: contentLayout === 'horizontal' ? 'flex' : 'block',
        gap: contentGap,
        flexDirection: contentLayout === 'horizontal' ? 'row' : 'column'
    };

    const hoverStyles = {
        boxShadow: hoverShadow,
        transform: hoverScale,
        borderColor: hoverBorderColor
    };  

    return (
        <StyledCard
            title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {title}
                <FullscreenOutlined onClick={() => {
                    setIsModalOpen(true);
                }} />
            </div>}
            ref={ref}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            style={{
                ...containerStyle,
                ...(borderStyle && borderWidth && borderColor ? {
                    border: `${borderWidth} ${borderStyle} ${borderColor}`
                } : {})
            }}
            headStyle={headStyle}
            bodyStyle={bodyStyle}
            bordered={borderStyle !== 'none'}
            $hoverStyles={hoverStyles}
        >
            {children}
            <Modal
                open={isModalOpen}
                title={title}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={'80%'}
                centered
            >
                <div style={{ height: '80vh', width: '100%' }}>
                    {children}
                </div>
            </Modal>
        </StyledCard>
    );
};

export default MainCard;

