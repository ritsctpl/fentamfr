import React from 'react';
import { Table } from 'antd';
import { parseCookies } from 'nookies';
import { retrieveNcGroup } from '@services/logNCService';
import { LogNCContext } from '../hooks/logNCContext';
import { useTranslation } from 'react-i18next';

interface NCGroupTableProps {
    ncGroupList: any[];
    setNcGroupList: (list: any[]) => void;
}

const NCGroupTable: React.FC<NCGroupTableProps> = ({ncGroupList, setNcGroupList}) => {
    const { setNcCodeList, selectedNcGroupRowKey, setSelectedNcGroupRowKey } = React.useContext(LogNCContext);
    const { t } = useTranslation();

    const columns = [
        {
            title: t('ncGroup'),
            dataIndex: 'ncGroup',
            key: 'ncGroup',
        },
    ];

    // Update useEffect to use context
    React.useEffect(() => {
        setSelectedNcGroupRowKey(null);
    }, [ncGroupList]);

    // Ensure data has keys
    const dataWithKeys = React.useMemo(() => {
        return ncGroupList?.map((item, index) => ({
            ...item,
            key: item.key || item.id || index.toString()
        }));
    }, [ncGroupList]);

    // Update onRow to use context
    const onRow = (record: any) => ({
        onClick: () => {
            setSelectedNcGroupRowKey(record.key === selectedNcGroupRowKey ? null : record.key);
            handleNCGroupRowClick(record?.ncGroup);
        },
        style: {
            background: record.key === selectedNcGroupRowKey ? '#1890ff33' : undefined,
            cursor: 'pointer'
        }
    });

    // Update rowSelection to use context
    const rowSelection = {
        type: 'radio' as const,
        selectedRowKeys: selectedNcGroupRowKey ? [selectedNcGroupRowKey] : [],
        onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
            debugger
            const newKey = selectedRowKeys[0];
            setSelectedNcGroupRowKey(selectedRowKeys[0] || null);
            // setSelectedNcGroupRowKey(newKey === selectedNcGroupRowKey ? undefined : newKey);
            const selectedNcGroup = selectedRows[0]?.ncGroup;
            handleNCGroupRowClick(selectedNcGroup);
        },
        // selectedRowKey: null
        preserveSelectedRowKeys: false
    };

    const handleNCGroupRowClick = async (ncGroup: string) => {
        // debugger
        const cookies = parseCookies();
        const site = cookies.site;
        const request = {site, ncGroup};
        const response = await retrieveNcGroup(request);
        if(!response.errorCode){
          
            setNcCodeList(response?.ncCodeDPMOCategoryList);
        }
    }

    return (
        <Table 
            dataSource={dataWithKeys} 
            columns={columns} 
            rowSelection={rowSelection}
            onRow={onRow}
            bordered
            size="small"
            scroll={{ y: 'calc(100vh - 500px)' }}
            pagination={false}
            style={{ fontSize: '12px' }}
        />
    );
};

export default NCGroupTable;
