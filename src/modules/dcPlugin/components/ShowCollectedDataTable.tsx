// src/modules/dcPlugin/components/ShowCollectedDataTable.tsx

import React from 'react';
import { Table } from 'antd';
import { useTranslation } from 'react-i18next';

const ShowCollectedDataTable: React.FC<{ reportList: any[] }> = ({ reportList }) => {
    const { t } = useTranslation();

    const columns = [
        {
            title: t('parameterName'),
            dataIndex: 'parameterBo',
            key: 'parameterBo',
            align: 'center' as 'left' | 'right' | 'center',
        },
        {
            title: t('actualValue'),
            dataIndex: 'actualValue',
            key: 'actualValue',
            align: 'center' as 'left' | 'right' | 'center',
        },
        {
            title: t('range'),
            key: 'range',
            align: 'center' as 'left' | 'right' | 'center',
            render: (text: any, record: any) => (
                <span>
                    {record.lowLimit} - {record.highLimit}
                </span>
            ),
        },
        {
            title: t('user'),
            dataIndex: 'userBO',
            key: 'userBO',
            align: 'center' as 'left' | 'right' | 'center',
        },
        {
            title: t('dateTime'),
            dataIndex: 'originalTestDateTime',
            key: 'originalTestDateTime',
            align: 'center' as 'left' | 'right' | 'center',
        },
    ];

    const data = []; // Populate this with your data

    return (
        <Table
            id="idTableShowCollectedData"
            columns={columns}
            size="small"
            dataSource={reportList}
            rowKey="id" // Replace with your unique key
            pagination={false}
            style={{width: '100%'}}
            scroll={{y: 55 * 5}}
            bordered
            onRow={() => ({
                style: {fontSize: '13.5px'}
            })}
        />
    );
};

export default ShowCollectedDataTable;