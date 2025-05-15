'use client';

import React, { useEffect, useState } from 'react';
import styles from "../styles/picklist.module.css";
import { Input, Button, Select, Table, message, Image, Spin } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import image from '../images/logo.jpeg';
import fentalogo from '../../../images/fenta_logo.png';
import { useTranslation } from 'react-i18next';
import { LogoutOutlined,FilterOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import JsBarcode from 'jsbarcode';

const { Option } = Select;

// const biscuitData = {
//     option1: [
//         { key: uuidv4(), orderNumber: 'OR12345', itemCode: 'RawMat-001', inventory: 'INV001', itemDescription: 'Flour (Wheat)', qtyOrdered: '1000 kg', qtyPicked: '1000 kg', fromLocation: 'Raw Material Aisle 1', toLocation: 'Mixing Area 1', workHouse: 'Warehouse A' },
//         { key: uuidv4(), orderNumber: 'OR12345', itemCode: 'RawMat-002', inventory: 'INV002', itemDescription: 'Sugar', qtyOrdered: '300 kg', qtyPicked: '300 kg', fromLocation: 'Raw Material Aisle 2', toLocation: 'Mixing Area 1', workHouse: 'Warehouse A' },
//         { key: uuidv4(), orderNumber: 'OR12345', itemCode: 'RawMat-003', inventory: 'INV003', itemDescription: 'Butter', qtyOrdered: '200 kg', qtyPicked: '200 kg', fromLocation: 'Raw Material Aisle 3', toLocation: 'Mixing Area 1', workHouse: 'Warehouse A' },
//         { key: uuidv4(), orderNumber: 'OR12345', itemCode: 'RawMat-004', inventory: 'INV004', itemDescription: 'Chocolate Chips', qtyOrdered: '150 kg', qtyPicked: '150 kg', fromLocation: 'Raw Material Aisle 4', toLocation: 'Mixing Area 1', workHouse: 'Warehouse A' }
//     ],
//     option2: [
//         { key: uuidv4(), orderNumber: 'OR12346', itemCode: 'RawMat-005', inventory: 'INV005', itemDescription: 'Oats', qtyOrdered: '500 kg', qtyPicked: '500 kg', fromLocation: 'Raw Material Aisle 2', toLocation: 'Mixing Area 2', workHouse: 'Warehouse B' },
//         { key: uuidv4(), orderNumber: 'OR12346', itemCode: 'RawMat-006', inventory: 'INV006', itemDescription: 'Raisins', qtyOrdered: '200 kg', qtyPicked: '200 kg', fromLocation: 'Raw Material Aisle 3', toLocation: 'Mixing Area 2', workHouse: 'Warehouse B' },
//         { key: uuidv4(), orderNumber: 'OR12346', itemCode: 'RawMat-007', inventory: 'INV007', itemDescription: 'Milk Powder', qtyOrdered: '100 kg', qtyPicked: '100 kg', fromLocation: 'Raw Material Aisle 1', toLocation: 'Mixing Area 2', workHouse: 'Warehouse B' }
//     ],
//     option3: [
//         { key: uuidv4(), orderNumber: 'OR12347', itemCode: 'RawMat-008', inventory: 'INV008', itemDescription: 'Ginger Powder', qtyOrdered: '100 kg', qtyPicked: '100 kg', fromLocation: 'Raw Material Aisle 5', toLocation: 'Mixing Area 3', workHouse: 'Warehouse C' },
//         { key: uuidv4(), orderNumber: 'OR12347', itemCode: 'RawMat-009', inventory: 'INV009', itemDescription: 'Molasses', qtyOrdered: '50 liters', qtyPicked: '50 liters', fromLocation: 'Raw Material Aisle 6', toLocation: 'Mixing Area 3', workHouse: 'Warehouse C' }
//     ]
// };
const biscuitData = {
    option1: [
        {
            key: uuidv4(), 
            palletNo: 'P12345', 
            qty: '1000 kg', 
            shift: 'A', 
            batchNo: 'B001', 
            time: '08:00 AM', 
            rackNo: 'Rack 1', 
            inventory: 'INV001',  // Added Inventory
            fromLocation: 'Raw Material Aisle 1', 
            toLocation: 'Mixing Area 1', 
            workHouse: 'Warehouse A'
        },
        {
            key: uuidv4(), 
            palletNo: 'P12346', 
            qty: '300 kg', 
            shift: 'A', 
            batchNo: 'B002', 
            time: '08:30 AM', 
            rackNo: 'Rack 2', 
            inventory: 'INV002',  // Added Inventory
            fromLocation: 'Raw Material Aisle 2', 
            toLocation: 'Mixing Area 1', 
            workHouse: 'Warehouse A'
        },
        {
            key: uuidv4(), 
            palletNo: 'P12347', 
            qty: '200 kg', 
            shift: 'A', 
            batchNo: 'B003', 
            time: '09:00 AM', 
            rackNo: 'Rack 3', 
            inventory: 'INV003',  // Added Inventory
            fromLocation: 'Raw Material Aisle 3', 
            toLocation: 'Mixing Area 1', 
            workHouse: 'Warehouse A'
        },
        {
            key: uuidv4(), 
            palletNo: 'P12348', 
            qty: '150 kg', 
            shift: 'B', 
            batchNo: 'B004', 
            time: '09:30 AM', 
            rackNo: 'Rack 4', 
            inventory: 'INV004',  // Added Inventory
            fromLocation: 'Raw Material Aisle 4', 
            toLocation: 'Mixing Area 1', 
            workHouse: 'Warehouse A'
        }
    ],
    option2: [
        {
            key: uuidv4(), 
            palletNo: 'P22345', 
            qty: '500 kg', 
            shift: 'B', 
            batchNo: 'B005', 
            time: '12:00 PM', 
            rackNo: 'Rack 5', 
            inventory: 'INV005',  // Added Inventory
            fromLocation: 'Raw Material Aisle 2', 
            toLocation: 'Mixing Area 2', 
            workHouse: 'Warehouse B'
        },
        {
            key: uuidv4(), 
            palletNo: 'P22346', 
            qty: '200 kg', 
            shift: 'B', 
            batchNo: 'B006', 
            time: '12:30 PM', 
            rackNo: 'Rack 6', 
            inventory: 'INV006',  // Added Inventory
            fromLocation: 'Raw Material Aisle 3', 
            toLocation: 'Mixing Area 2', 
            workHouse: 'Warehouse B'
        },
        {
            key: uuidv4(), 
            palletNo: 'P22347', 
            qty: '100 kg', 
            shift: 'B', 
            batchNo: 'B007', 
            time: '01:00 PM', 
            rackNo: 'Rack 7', 
            inventory: 'INV007',  // Added Inventory
            fromLocation: 'Raw Material Aisle 1', 
            toLocation: 'Mixing Area 2', 
            workHouse: 'Warehouse B'
        }
    ],
    option3: [
        {
            key: uuidv4(), 
            palletNo: 'P32345', 
            qty: '100 kg', 
            shift: 'C', 
            batchNo: 'B008', 
            time: '04:00 PM', 
            rackNo: 'Rack 8', 
            inventory: 'INV008',  // Added Inventory
            fromLocation: 'Raw Material Aisle 5', 
            toLocation: 'Mixing Area 3', 
            workHouse: 'Warehouse C'
        },
        {
            key: uuidv4(), 
            palletNo: 'P32346', 
            qty: '50 liters', 
            shift: 'C', 
            batchNo: 'B009', 
            time: '04:30 PM', 
            rackNo: 'Rack 9', 
            inventory: 'INV009',  // Added Inventory
            fromLocation: 'Raw Material Aisle 6', 
            toLocation: 'Mixing Area 3', 
            workHouse: 'Warehouse C'
        }
    ]
};



const PickList: React.FC = () => {
    const router = useRouter();
    const [inputValue, setInputValue] = useState<string>('');
    const [inventory, setInventory] = useState<string>('');
    const [data, setData] = useState<any[]>([]);
    const [valueArray, setValueArray] = useState(null);
    const [randomId, setRandomId] = useState<string>('');
    const [isOrderSelected, setIsOrderSelected] = useState<boolean>(false);
    const { i18n, t } = useTranslation();
    const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust time as needed
 
    return () => clearTimeout(timer);
  }, []);

    const changeLanguage = (value) => {
        i18n.changeLanguage(value);
        localStorage.setItem('language', value);
    };

    const generateRandomId = (length: number) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    };

    const handleGenerate = () => {
        const randomValue = generateRandomId(8);
        setInputValue(randomValue);
        setRandomId(randomValue);
    };
    const handleScan = () => {
     

        // Check if inventory is not empty before filtering
        if (inventory !== "") {
            const filteredData = data.filter(item => item.inventory.toLowerCase() === inventory.toLowerCase());
            setData(filteredData);
        } else {
            // Reset to the original data if inventory is empty
            setData(biscuitData[valueArray]);
        }
    };
    
    const handleSelectChange = (value: string) => {
        setData(biscuitData[value]);
        setValueArray(value)
        setIsOrderSelected(value !== 'none');
    };

    const handlePick = () => {
        message.success('Picked the order successfully!');
    };

 

    const handleQtyPickedChange = (key: string, value: string) => {
        const qtyPicked = parseInt(value, 10);
        const item = data.find(item => item.key === key);

        if (item) {
            const qtyOrdered = item.qtyOrdered;

            if (qtyPicked < 0) {
                message.error('Qty Picked cannot be negative.');
                return; 
            }

            if (qtyPicked > qtyOrdered) {
                message.error('Qty Picked cannot exceed Qty Ordered.');
                return;
            }

            const updatedData = data.map(item => {
                if (item.key === key) {
                    return { ...item, qtyPicked: qtyPicked };
                }
                return item;
            });
            setData(updatedData);
        }
    };

    const handleStatusChange = (key: string, value: string) => {
        const updatedData = data.map(item => {
            if (item.key === key) {
                return { ...item, status: value };
            }
            return item;
        });
        setData(updatedData);
    };

    const handlePrint = () => {
        const doc = new jsPDF();
    
        const imgData = image.src;
        doc.addImage(imgData, 'JPEG', 10, 10, 30, 30);
    
        const title = 'PICK LIST';
        const titleWidth = doc.getTextWidth(title);
        const pageWidth = doc.internal.pageSize.getWidth();
        const titleX = (pageWidth - titleWidth) / 2;
    
        doc.text(title, titleX, 25);
        doc.setFontSize(10);
        doc.text(`Pick List No: ${inputValue}`, 20, 45);
        doc.text(`Order No: LF2-050`, 20, 55);
    
        // Generate the barcode
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, inputValue, {
            format: "CODE128",
            width: 2,
            height: 40,
        });
    
        // Convert the canvas to an image
        const barcodeImage = canvas.toDataURL("image/png");
    
        // Add the barcode image to the PDF
        doc.addImage(barcodeImage, 'PNG', 150, 45, 50, 20); // Adjust the position and size as needed
    
        const startY = 65;
        autoTable(doc, {
            head: [['Pallet No', 'Quantity', 'Qty Ordered', 'Shift', 'Batch No', 'Time', 'Rack No']],
            body: data.map(item => [
                item.palletNo,
                item.qty,
                item.qtyOrdered, // assuming this is the correct field for quantity ordered
                item.shift,
                item.batchNo,
                item.time,
                item.rackNo
            ]),
            startY: startY,
        });
    
        doc.save('selected_orders.pdf');
    };
    
    

    const handleClear = () => {
        setInputValue('');
        setRandomId('');
        setData([]);
        setIsOrderSelected(false);
    };
    const columns = [
        { title: 'Pallet No', dataIndex: 'palletNo', key: 'palletNo' },
        { title: 'Quantity', dataIndex: 'qty', key: 'qty' },
        { title: 'Shift', dataIndex: 'shift', key: 'shift' },
        { title: 'Batch No', dataIndex: 'batchNo', key: 'batchNo' },
        { title: 'Time', dataIndex: 'time', key: 'time' },
        { title: 'Rack No', dataIndex: 'rackNo', key: 'rackNo' },
        { title: 'Inventory', dataIndex: 'inventory', key: 'inventory' },  // Added Inventory
        { title: 'From Location', dataIndex: 'fromLocation', key: 'fromLocation' },
        { title: 'To Location', dataIndex: 'toLocation', key: 'toLocation' },
        { title: 'Warehouse', dataIndex: 'workHouse', key: 'workHouse' },
      
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string, record: any) => (
                <Select
                    defaultValue='Open'
                    style={{ width: 120 }}
                    onChange={(value) => handleStatusChange(record.key, value)}
                >
                    <Option value="open">Open</Option>
                    <Option value="partial">Partial</Option>
                    <Option value="completed">Completed</Option>
                </Select>
            ),
        },
    ];
    
    
    // const columns = [
    //     { title: 'Order Number', dataIndex: 'orderNumber', key: 'orderNumber' },
    //     { title: 'Item Code', dataIndex: 'itemCode', key: 'itemCode' },
    //     { title: 'Inventory', dataIndex: 'inventory', key: 'inventory' },
    //     { title: 'Item Description', dataIndex: 'itemDescription', key: 'itemDescription' },
    //     { title: 'Ordered Qty', dataIndex: 'qtyOrdered', key: 'qtyOrdered' },
    //     {
    //         title: 'Picked Qty',
    //         dataIndex: 'qtyPicked',
    //         key: 'qtyPicked',
    //         width: 200,
    //         render: (text: string, record: any) => (
    //             <Input
    //                 min={0}
    //                 type="text"
    //                 value={text}
    //                 onChange={(e) => handleQtyPickedChange(record.key, e.target.value)}
    //                 style={{ width: '100%' }}
    //             />
    //         ),
    //     },
    //     { title: 'From Location', dataIndex: 'fromLocation', key: 'fromLocation' },
    //     { title: 'To Location', dataIndex: 'toLocation', key: 'toLocation' },
    //     { title: 'Warehouse', dataIndex: 'workHouse', key: 'workHouse' },
    //     {
    //         title: 'Status',
    //         dataIndex: 'status',
    //         key: 'status',
    //         render: (text: string, record: any) => (
    //             <Select
    //                 defaultValue='Open'
    //                 style={{ width: 120 }}
    //                 onChange={(value) => handleStatusChange(record.key, value)}
    //             >
    //                 <Option value="open">Open</Option>
    //                 <Option value="partial">Partial</Option>
    //                 <Option value="completed">Completed</Option>
    //             </Select>
    //         ),
    //     },
    // ];
    const handleLogoClick = () => {
        router.push('/');
      };
    // if (loading) {
    //     return (
    // <div style={{ textAlign: 'center', marginTop: '20%' }}>
    // <Spin size="large" style={{ color: '#BFA061' }} />
    // </div>
    //     );
    //   }
      console.log(data ,inventory,"data");
      
    return (
        <div className={styles.pickListContainer}>
            <div className={styles.pickListHeading}>
                <img src={image.src} alt="RITS Logo" className={styles.logo} onClick={handleLogoClick}/>
                <h2>{t('pickListManagement')}</h2>
                <div className={styles.logOutSection}>
                    <Select defaultValue='en' style={{ width: 120 }} onChange={changeLanguage}>
                        <Option value="en">English</Option>
                        <Option value="ka">ಕನ್ನಡ</Option>
                        <Option value="ta">தமிழ்</Option>
                        <Option value="hi">हिंदी</Option>
                    </Select>
                    <span style={{ marginLeft: '20px' }}>RITS  |</span>
                    <span style={{marginRight:'20px',marginLeft:'3px'}}>  <LogoutOutlined /></span>
                </div>
            </div>

            <div className={styles.formContainer}>
                <div className={styles.row}>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>{t("pickListNo")}:</label>
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={t("pickListNo")}
                            className={styles.input}
                        />
                        <Button
                            onClick={handleGenerate}
                            disabled={!isOrderSelected}
                            className={styles.button}>
                            {t("generate")}
                        </Button>
                    </div>

                    <div className={styles.selectContainer}>
                        <label className={styles.labels}>{t("orderNo")}:</label>
                        <Select
                            defaultValue="none"
                            className={styles.select}
                            onChange={handleSelectChange}>
                            <Option value="none" disabled>{t("selectOrder")}</Option>
                            <Option value="option1">23456-order1</Option>
                            <Option value="option2">67453-order2</Option>
                            <Option value="option3">64798-order3</Option>
                        </Select>
                    </div>
                        </div>
                           
                     </div>
                     <div>
                     <Input
                            value={inventory}
                            onChange={(e) => setInventory(e.target.value)}
                            placeholder={t("Inventory")}
                            style={{marginRight:'20px' ,marginBottom:'20px',marginLeft:'20px'}}
                            className={styles.input}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleScan();
                                }
                            }}
                        />
                        <Button
                            onClick={handleScan}
                            className={styles.button}>
                            <FilterOutlined/>
                        </Button>
                     </div>

            <Table
                dataSource={data}
                columns={columns}
                className={styles.table}
                pagination={false}
            />

            <div className={styles.buttonContainer}>
                <Button onClick={handlePick} className={styles.button}>{t("pick")}</Button>
                <Button onClick={handlePrint} className={styles.button}>{t("print")}</Button>
                <Button onClick={handleClear} className={styles.button}>{t("clear")}</Button>
            </div>

            <div className={styles.footer}>
                <img src={fentalogo.src} alt="Fenta Logo" style={{ width: '95px', height: '55px' }} />
                <div style={{ color: 'gray' }}>&copy; {new Date().getFullYear()} Fenta Powered by Rits | All Rights Reserved</div>
            </div>
        </div>
    );
};

export default PickList;