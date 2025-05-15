import React, { useRef } from 'react';
import { Button, Table, Row, Col, Typography, Image } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import styles from '../../styles/payslippdf.module.css';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const { Title, Text } = Typography;

interface PayslipProps {
    employeeData: {
        employeeId: string;
        employeeName: string;
        designation: string;
        department: string;
        dateOfJoining: string;
        uan: string;
        pfNo: string;
        esiNo: string;
        bank: string;
        accountNo: string;
    };
    salaryData: {
        grossWages: number;
        workingDays: number;
        lopDays: number;
        leaves: number;
        paidDays: number;
        earnings: {
            [key: string]: number;
        };
        deductions: {
            [key: string]: number;
        };
    };
}

// const convertToIndianCurrency = (num: number) => {
//     if (!num) return '';
//     const a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
//     const b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
//     let d = num;
//     let ans = '';
//     let i = 0;
//     while (d) {
//         let y = 0;
//         let x = 0;
//         if (d > 100) {
//             y = d % 100;
//             x = Math.floor(d / 100);
//             ans = helper(x, a, b) + 'hundred ' + helper(y, a, b) + 'rupees ';
//             d = 0;
//         } else if (d > 20) {
//             y = d % 10;
//             x = Math.floor(d / 10);
//             ans = b[x] + ' ' + a[y] + 'rupees ';
//             d = 0;
//         } else if (d > 0) {
//             ans = a[d] + 'rupees ';
//             d = 0;
//         }
//         i++;
//     }
//     return ans;
// };

// const helper = (num: number, a: string[], b: string[]) => {
//     if (num < 20) return a[num];
//     if (num < 100) return b[Math.floor(num / 10)] + ' ' + a[num % 10];
//     return '';
// };

const PayslipPDF: React.FC<PayslipProps> = ({ employeeData, salaryData }) => {
    const payslipRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        if (!payslipRef.current) return;

        try {
            const canvas = await html2canvas(payslipRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: payslipRef.current.scrollWidth,
                windowHeight: payslipRef.current.scrollHeight,
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${employeeData.employeeName}_payslip.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const calculateTotalEarnings = () => {
        return Object.values(salaryData.earnings).reduce((sum, value) => sum + value, 0);
    };

    const calculateTotalDeductions = () => {
        return Object.values(salaryData.deductions).reduce((sum, value) => sum + value, 0);
    };

    const calculateNetSalary = () => {
        return calculateTotalEarnings() - calculateTotalDeductions();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('INR', '₹');
    };

    return (
        <>
            <div className={styles.downloadSection}>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadPDF}
                >
                    Download PDF
                </Button>
            </div>
            <div ref={payslipRef} className={styles.a4Container}>
                <div className={styles.payslipContent}>
                    <div className={styles.header}>
                        <div className={styles.companyLogo}>
                            <Image
                                src="/manufacturing/_next/static/media/rits-logo.b20c047f.png"
                                alt="RITS Logo"
                                className={styles.logoImage}
                                width={100}
                                height={50}
                            // priority
                            />
                        </div>
                        <div className={styles.companyInfo}>
                            <Title level={2} className={styles.companyName}>
                                RITS CONSULTING AND TECHNOLOGIES PVT LTD
                            </Title>
                            <Text className={styles.companyAddress}>
                                46/4, Novel Tech Park, Hosur Rd, Kudlu Gate, Krishna Reddy Industrial Area,
                                H.S,R Extension, Bengaluru, Karnataka 560068
                            </Text>
                            <Text className={styles.payPeriod}>Pay Slip for December 2024</Text>
                        </div>
                    </div>

                    <div className={styles.employeeDetails}>
                        <div className={styles.employeeDetailsContainer}>
                            <div className={styles.employeeRow}>
                                <span className={styles.employeeLabel}>Employee ID:</span>
                                <span className={styles.employeeValue}>{employeeData.employeeId}</span>
                            </div>
                            <div className={styles.employeeRow}>
                                <span className={styles.employeeLabel}>Employee Name:</span>
                                <span className={styles.employeeValue}>{employeeData.employeeName}</span>
                            </div>
                            <div className={styles.employeeRow}>
                                <span className={styles.employeeLabel}>Designation:</span>
                                <span className={styles.employeeValue}>{employeeData.designation}</span>
                            </div>
                            <div className={styles.employeeRow}>
                                <span className={styles.employeeLabel}>Department:</span>
                                <span className={styles.employeeValue}>{employeeData.department}</span>
                            </div>
                            <div className={styles.employeeRow}>
                                <span className={styles.employeeLabel}>Date of Joining:</span>
                                <span className={styles.employeeValue}>{employeeData.dateOfJoining}</span>
                            </div>
                        </div>
                        <div className={styles.employeeDetailsContainer}>
                            <div className={styles.employeeRow}>
                                <span className={styles.employeeLabel}>UAN:</span>
                                <span className={styles.employeeValue}>{employeeData.uan}</span>
                            </div>
                            <div className={styles.employeeRow}>
                                <span className={styles.employeeLabel}>PF No.:</span>
                                <span className={styles.employeeValue}>{employeeData.pfNo}</span>
                            </div>
                            <div className={styles.employeeRow}>
                                <span className={styles.employeeLabel}>ESI No.:</span>
                                <span className={styles.employeeValue}>{employeeData.esiNo}</span>
                            </div>
                            <div className={styles.employeeRow}>
                                <span className={styles.employeeLabel}>Bank:</span>
                                <span className={styles.employeeValue}>{employeeData.bank}</span>
                            </div>
                            <div className={styles.employeeRow}>
                                <span className={styles.employeeLabel}>Account No.:</span>
                                <span className={styles.employeeValue}>{employeeData.accountNo}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.attendanceSection}>
                        <table className={styles.dataTable}>
                            <tbody>
                                <tr>
                                    <td>Gross Wages</td>
                                    <td>{formatCurrency(salaryData.grossWages)}</td>
                                    <td>Leaves</td>
                                    <td>{salaryData.leaves}</td>
                                </tr>
                                <tr>
                                    <td>Total Working Days</td>
                                    <td>{salaryData.workingDays}</td>
                                    <td>LOP Days</td>
                                    <td>{salaryData.lopDays}</td>
                                </tr>
                                <tr>
                                <td>Paid Days</td>
                                <td>{salaryData.paidDays}</td>
                                    <td>Total Worked Days</td>
                                    <td>0</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.salaryDetails}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Table
                                    title={() => <strong>Earnings</strong>}
                                    dataSource={Object.entries(salaryData.earnings)
                                        .filter(([key]) => key !== 'totalEarnings')
                                        .map(([key, value]) => ({
                                            key,
                                            component: key.split(/(?=[A-Z])/).map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' '),
                                            amount: value
                                        }))}
                                    pagination={false}
                                    bordered
                                    className={styles.salaryTable}
                                    columns={[
                                        {
                                            title: 'Component',
                                            dataIndex: 'component',
                                            key: 'component',
                                            width: '60%'
                                        },
                                        {
                                            title: 'Amount (₹)',
                                            dataIndex: 'amount',
                                            key: 'amount',
                                            align: 'right',
                                            width: '40%',
                                            render: (amount) => amount.toFixed(2)
                                        },
                                    ]}
                                    summary={() => (
                                        <Table.Summary.Row className={styles.totalRow}>
                                            <Table.Summary.Cell index={0}>
                                                <strong>Total Earnings</strong>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={1} align="right">
                                                <strong>{salaryData.earnings.totalEarnings.toFixed(2)}</strong>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    )}
                                />
                            </Col>
                            <Col span={12}>
                                <Table
                                    title={() => <strong>Deductions</strong>}
                                    dataSource={Object.entries(salaryData.deductions).map(([key, value]) => ({
                                        key,
                                        component: key.toUpperCase(),
                                        amount: value
                                    }))}
                                    pagination={false}
                                    bordered
                                    className={styles.salaryTable}
                                    columns={[
                                        {
                                            title: 'Component',
                                            dataIndex: 'component',
                                            key: 'component',
                                            width: '60%'
                                        },
                                        {
                                            title: 'Amount (₹)',
                                            dataIndex: 'amount',
                                            key: 'amount',
                                            align: 'right',
                                            width: '40%',
                                            render: (amount) => amount.toFixed(2)
                                        },
                                    ]}
                                    summary={(data) => {
                                        const totalDeductions = data.reduce((sum, row) => sum + row.amount, 0);
                                        return (
                                            <Table.Summary.Row className={styles.totalRow}>
                                                <Table.Summary.Cell index={0}>
                                                    <strong>Total Deductions</strong>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={1} align="right">
                                                    <strong>{totalDeductions.toFixed(2)}</strong>
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row>
                                        );
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.totalNetPayableSection}>
                        <div className={styles.totalNetPayableHeader}>
                            <div>
                                <h3>Total Net Payable</h3>
                                <p className={styles.subtext}>Gross Earnings - Total Deductions</p>
                            </div>
                            <div className={styles.totalAmount}>
                                <span className={styles.currencySymbol}>₹</span>
                                <span className={styles.amount}>
                                    {(salaryData.earnings.totalEarnings - calculateTotalDeductions()).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className={styles.amountInWords}>
                            {/* Amount in words : {convertToIndianCurrency(salaryData.earnings.totalEarnings - calculateTotalDeductions())} */}
                            Amount in words : hundred fifty rupees
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PayslipPDF;