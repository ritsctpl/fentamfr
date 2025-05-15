import React, { useEffect, useState } from 'react';
import { Button, Flex, Table, InputNumber, message } from 'antd';
import { MinusOutlined, PlusOutlined, PlayCircleTwoTone } from '@ant-design/icons';
import type { TableColumnsType, TableProps } from 'antd';
import { parseCookies } from 'nookies';
import { ProcessOrderReleaseData, retrieveActivity } from '@services/processOrderService';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

interface DataType {
  key: React.Key;
  orderNumber: string;
  material: string;
  materialVersion: string;
  materialDescription: string;
  orderType: string;
  status: string;
  availableQtyToRelease: number | null;
  qtyToRelease: number;
  batchNumber: string;
}

interface MultiProcessOrderReleaseTableProps {
  datas: any;
  setCall: any;
  call: number;
  onSelectedRowsChange: (selectedRows: DataType[]) => void;
}

const MultiProcessOrderReleaseTable: React.FC<MultiProcessOrderReleaseTableProps> = ({ datas, setCall, call, onSelectedRowsChange }) => {
  console.log(datas, 'datas');

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [data, setData] = useState<DataType[]>();
  const { t } = useTranslation();


  const [showQty, setShowQty] = useState<any>();

  useEffect(() => {
    // setData(datas.map((item: any, index: number) => ({
    //   ...item,
    //   key: index,
    //   qtyToRelease: 0,
    //   availableQtyToRelease: item.availableQtyToRelease || 0
    // })));
    setData(datas?.map((item: any, index: number) => {
      // Find existing item to preserve its qtyToRelease if it exists
      const existingItem = data?.find(
        existing => existing.orderNumber === item.orderNumber
      );

      return {
        ...item,
        key: index,
        qtyToRelease: existingItem ? existingItem.qtyToRelease : 0,
        availableQtyToRelease: item.availableQtyToRelease || 0
      };
    }));
  }, [datas]);

  useEffect(() => {

    const fetchActivity = async () => {
      // debugger
      const searchParams = new URLSearchParams(window.location.search);
      const activityIdFromWebURL = searchParams.get('activityId');
      const cookies = parseCookies();
      const site = cookies?.site;
      let response = await retrieveActivity(activityIdFromWebURL);
      const activityRule = response?.activityRules;
      const rule = activityRule?.[0];
      const showQuantitySetting = rule?.setting === 'true';
      // const parsedvalue = Boolean(showQuantitySetting);
      setShowQty(showQuantitySetting);
    }
    fetchActivity();
  }, [])

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [call]);

  const handleQuantityChange = (key: React.Key, action: 'increase' | 'decrease' | 'set', value?: number | null) => {
    setData(prevData => {
      const updatedData = prevData.map(item => {
        if (item.key === key) {
          let newValue = item.qtyToRelease;

          switch (action) {
            case 'increase':
              newValue = Math.min(item.qtyToRelease + 1, item.availableQtyToRelease);
              break;
            case 'decrease':
              newValue = Math.max(item.qtyToRelease - 1, 0);
              break;
            case 'set':
              newValue = value ?? 0;
              break;
          }

          return {
            ...item,
            qtyToRelease: newValue
          };
        }
        return item;
      });

      // Update selected rows data whenever quantity changes
      const selectedRows = updatedData.filter(row => selectedRowKeys.includes(row.key));
      onSelectedRowsChange(selectedRows);

      return updatedData;
    });
  };

  const selectedDataRelease = async (record: DataType) => {
    console.log("Record: ", record);
    try {
      const cookies = parseCookies();
      const site = cookies.site;
      const userId = cookies.rl_user_id;
      const payload = {
        site: site,
        user: userId,
        processOrder: record?.orderNumber,
        qtyToRelease: record?.qtyToRelease,
        plannedMaterial: record?.material,
        materialVersion: record?.materialVersion,
        materialDescription: record?.materialDescription,
        batchNumber: record?.batchNumber,
        orderType: record?.orderType,
      }

      const payloads = {
        orders: [payload]
      }
      const response = await ProcessOrderReleaseData(site, payloads);
      debugger
      if (response[0].status === 'FAILED') {
        message.error(response[0].message)
      }
      else {
        message.success(response[0].message)
        setCall(call + 1);
      }
    } catch (error) {
      message.error('Error processing release orders');
    }
  };

  const columns: TableColumnsType<DataType> = [
    { title: t('processOrder'), dataIndex: 'orderNumber', ellipsis: true },
    {
      title: 'Batch Number',
      dataIndex: 'batchNumber',
      ellipsis: true
    },
    { title: t('orderType'), dataIndex: 'orderType', ellipsis: true },
    { title: t('Production Version'), dataIndex: 'productionVersion', ellipsis: true },
    { title: t('productCode'), dataIndex: 'material', ellipsis: true },
    { title: t('productName'), dataIndex: 'materialDescription', ellipsis: true },
    { title: t('batchSize'), dataIndex: 'availableQtyToRelease', ellipsis: true },
    { title: t('uom'), dataIndex: 'uom', ellipsis: true },
    { title: t('downloadDate'), dataIndex: 'createdDateTime', ellipsis: true },
    {
      title: t('releaseQty'),
      dataIndex: 'releaseQty',
      ellipsis: true,
      render: (_, record) => (
        <Flex align="center" gap="small">
          {showQty && (
            <InputNumber
              min={0}
              max={record.availableQtyToRelease}  
              value={record.qtyToRelease}
              onChange={(value) => handleQuantityChange(record.key, 'set', value)}
              style={{ width: '100%' }}
            />
          )}
        </Flex>
      ),
    },
    {
      title: t('release'),
      dataIndex: 'qtyToRelease',
      ellipsis: true,
      render: (_, record) => (
          <Button
            icon={<PlayCircleTwoTone />}
            onClick={() => selectedDataRelease(record)}
          />
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    onSelectedRowsChange(selectedRows);
  };

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <Flex gap="middle" vertical>
      <Table<DataType> rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false}
        scroll={{ y: 'calc(100vh - 230px)' }} />
    </Flex>
  );
};

export default MultiProcessOrderReleaseTable;