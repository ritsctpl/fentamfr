import React, { useState } from 'react';
import { Input, message, Modal } from 'antd';
import { TextInputConfig } from '../../types';
import { GrChapterAdd } from 'react-icons/gr';
import DynamicTable from '../form/DynamicTable';
import { commonApi } from '@services/dashboard';
import { parseCookies } from 'nookies';
const cookies = parseCookies();
interface BrowseProps {
    value?: string;
    onChange?: (value: string) => void;
    style?: React.CSSProperties;
    config?: TextInputConfig;
    labelStyle?: React.CSSProperties;
    inputStyle?: React.CSSProperties;
}

const Browse: React.FC<BrowseProps> = ({
    value,
    onChange,
    style,
    config = {},
    labelStyle,
    inputStyle
}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [data, setData] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const {
        placeholder,
        disabled,
        size = 'middle',
        allowClear,
        maxLength,
        showCount,
        type = 'text',
        url,
        arrayParameter,
        fieldValue,
        payload
    } = config;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    const handleBrowseClick = async () => {
        try {
            let processedPayload = payload;
            if (typeof payload === 'string') {
                processedPayload = payload.replace(/\${cookies\.(\w+)}/g, (match, cookieName) => {
                    return cookies[cookieName] || '';
                });
                processedPayload = JSON.parse(processedPayload);
            }
            const res = await commonApi(url, processedPayload);
            setData(arrayParameter ? res[arrayParameter] : res);
            setModalOpen(true);
        } catch (error) {
            setData([]);
            message.error('Failed to process payload or fetch data');
            console.error('Error:', error);
        }
    };

    const handleRowSelect = (record: any) => {
        setSelectedRow(record);
        onChange?.(record[fieldValue]);
        setModalOpen(false);
    };

    return (
        <>
            <Input
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                size={size}
                allowClear={allowClear}
                maxLength={maxLength}
                showCount={showCount}
                type={type}
                style={{
                    ...inputStyle,
                }}
                suffix={<GrChapterAdd color='#124561' size={14} onClick={() => handleBrowseClick()} />}
            />
            <Modal
                title={config.placeholder}
                open={modalOpen}
                // centered
                width={1500}
                onCancel={() => setModalOpen(false)}
                footer={null}
            >
                <DynamicTable
                    data={selectedRow ? [selectedRow] : data}
                    onRow={(record) => ({
                        onClick: () => handleRowSelect(record),
                    })}
                />
            </Modal>
        </>
    );
};

export default Browse;