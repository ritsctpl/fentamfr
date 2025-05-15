import React from 'react';
import { Table } from 'antd';
import { useTranslation } from 'react-i18next';

interface LogToolTableProps {
    dataSource: any[];
    onRowClick: (record: any) => void;
}

const LogToolTable: React.FC<LogToolTableProps> = ({ dataSource, onRowClick }) => {
    const { t } = useTranslation();
    const columns = [
        { title: t('dataType'), dataIndex: 'componentType', key: 'componentType' },
        { title: t('component'), dataIndex: 'component', key: 'component' },
        { title: t('componentDescription'), dataIndex: 'componentDescription', key: 'componentDescription' },
        { title: t('required') + ' ' + t('qty'), dataIndex: 'assyQty', key: 'assyQty' },
        { title: t('assembled') + ' ' + t('qty'), dataIndex: 'assembledQty', key: 'assembledQty' },
    ];

    return (
        <Table
            dataSource={dataSource}
            columns={columns}
            rowKey="key"
            pagination={false}
            scroll={{ y: 55 * 5 }}
            bordered
            size="small"
            onRow={(record) => ({
                onClick: () => onRowClick(record),
                style: {fontSize: '13.5px' }
            })}
        />
    );
};

export default LogToolTable;
