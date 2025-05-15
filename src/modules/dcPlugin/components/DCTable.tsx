import React from 'react';
import { Button, Table } from 'antd';
import styles from '@modules/assembly/styles/Assembly.module.css';
import { useTranslation } from 'react-i18next';
import CollectDataIcon from '@mui/icons-material/DataUsage'; // Replaced with an available icon
import ShowDetailsIcon from '@mui/icons-material/Visibility'; // Use the correct icon name// Import the appropriate icon


interface AssemblyTableProps {
    dataSource: any;
    onRowClick: (record: any) => void;
    showTable: boolean;
    setShowTable: (record: boolean) => any;
}

const AssemblyTable: React.FC<AssemblyTableProps> = ({ dataSource, onRowClick, showTable, setShowTable }) => {
    const { t } = useTranslation();
   

    const handleFirstButtonClick = (record) => {
        // Handle first button click
        setShowTable(false);
        console.log('First button clicked for:', record);
    };

    const handleSecondButtonClick = (record) => {
        // Handle second button click
        console.log('Second button clicked for:', record);
    };

    console.log(dataSource?.dataCollected)
    const oDCTableColumns = [
        { "title": t("dataCollection"), "dataIndex": "dataCollection", "key": "dataCollection" },
        { "title": t("version"), "dataIndex": "version", "key": "version" },
        { "title": t("description"), "dataIndex": "description", "key": "description" },
        { "title": t("description"), "dataIndex": "description", "key": "description" },
        { "title": t("collectDataAt"), "dataIndex": "collectDataAt", "key": "collectDataAt" },
        {
            title: t("details"),
            dataIndex: "details",
            key: "details",
            render: (text, record) => (
                <>
                    <Button 
                        disabled={dataSource?.dataCollected} 
                        onClick={() => handleFirstButtonClick(record)} 
                        style={{ marginRight: '8px' }}
                    >
                        <CollectDataIcon />
                    </Button>
                    <Button 
                        disabled={dataSource?.showReport} 
                        onClick={() => handleSecondButtonClick(record)}
                    >
                        <ShowDetailsIcon />
                    </Button>
                </>
            ),
        },
    ]

    return (
       
        <>
            {showTable && ( // Conditional rendering based on showTable prop
                <Table
                    className={styles.assemblyTable}
                    dataSource={dataSource}
                    columns={oDCTableColumns}
                    rowKey="key"

                    pagination={false}
                    size="small"
                    scroll={{ y: 55 * 5 }}
                    bordered
                    onRow={(record) => ({
                        onClick: () => onRowClick(record),
                        style: {fontSize: '13.5px' }
                    })}
                />
            )}
        </>
            
    );
};

export default AssemblyTable;
