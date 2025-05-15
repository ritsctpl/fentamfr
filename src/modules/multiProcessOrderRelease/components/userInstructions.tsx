import React from 'react';
import logo from '@/images/FENTA-LOGO-F.png';

const UserInstructions: React.FC = () => {
    const style = {
        manual: {
            fontFamily: 'Arial, sans-serif',
            maxWidth: '900px',
            // margin: '40px auto',
            padding: '20px',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#000',
            backgroundColor: '#fff'
        },
        header: {
            borderBottom: '2px solid #000',
            marginBottom: '30px',
            paddingBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold' as const,
            margin: '0 0 5px 0'
        },
        section: {
            marginBottom: '25px'
        },
        sectionTitle: {
            fontSize: '16px',
            fontWeight: 'bold' as const,
            marginBottom: '15px',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
        },
        subTitle: {
            fontSize: '14px',
            fontWeight: 'bold' as const,
            marginBottom: '10px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            marginBottom: '20px',
            border: '1px solid #000'
        },
        th: {
            border: '1px solid #000',
            padding: '8px',
            textAlign: 'left' as const,
            fontWeight: 'bold' as const,
            backgroundColor: '#fff'
        },
        td: {
            border: '1px solid #000',
            padding: '8px',
            verticalAlign: 'top' as const
        },
        list: {
            marginLeft: '20px',
            marginBottom: '15px'
        },
        listItem: {
            marginBottom: '5px'
        },
        required: {
            marginLeft: '5px'
        },
        logo: {
            width: '100px',
            height: '50px'
        }
    };

    return (
        <div style={style.manual} className="manual-content">
            <div style={style.header}>
                <h1 style={style.title}>Multi-Process Order Release User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to use the Multi-Process Order Release screen for managing and releasing process orders in bulk.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>Production managers, process engineers, and authorized personnel.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Multi-Process Order Release</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>2. Main Features</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Feature</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Process Order Search</td>
                            <td style={style.td}>Search and filter process orders by various criteria</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Bulk Release</td>
                            <td style={style.td}>Release multiple process orders simultaneously</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Quantity Management</td>
                            <td style={style.td}>Set and adjust release quantities for each order</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Top 50 Orders</td>
                            <td style={style.td}>Quick access to the most recent 50 process orders</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Order Details</td>
                            <td style={style.td}>View comprehensive order information including material, batch, and status</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>3. Screen Components</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Component</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Search Bar</td>
                            <td style={style.td}>Search for specific process orders by order number</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Top 50 Button</td>
                            <td style={style.td}>Load the most recent 50 process orders</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Process Order Table</td>
                            <td style={style.td}>Displays process orders with details and release options</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Release Button</td>
                            <td style={style.td}>Release selected process orders</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>4. Process Order Information</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Field</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Process Order</td>
                            <td style={style.td}>Unique identifier for the process order</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Batch Number</td>
                            <td style={style.td}>Associated batch number for the order</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Order Type</td>
                            <td style={style.td}>Type of process order (Production, Engineering, etc.)</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Product Code</td>
                            <td style={style.td}>Material code for the product</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Product Name</td>
                            <td style={style.td}>Description of the product</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Batch Size</td>
                            <td style={style.td}>Available quantity for release</td>
                        </tr>
                        <tr>
                            <td style={style.td}>UOM</td>
                            <td style={style.td}>Unit of measurement</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Release Quantity</td>
                            <td style={style.td}>Quantity to be released (if quantity setting is enabled)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.1. Searching for Process Orders</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Enter the process order number in the search field</li>
                        <li style={style.listItem}>Click the search icon or press Enter</li>
                        <li style={style.listItem}>View the filtered results in the table</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.2. Loading Top 50 Orders</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Click the "Top 50" button</li>
                        <li style={style.listItem}>View the most recent 50 process orders in the table</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.3. Releasing Process Orders</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select one or more process orders using the checkboxes</li>
                        <li style={style.listItem}>If quantity setting is enabled, adjust the release quantity for each order</li>
                        <li style={style.listItem}>Click the "Release" button</li>
                        <li style={style.listItem}>Confirm the release action</li>
                        <li style={style.listItem}>View the release status in the success/error messages</li>
                    </ol>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>6. Troubleshooting</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Issue</th>
                            <th style={style.th}>Solution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Cannot find process order</td>
                            <td style={style.td}>Verify the order number and try searching again</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Release fails</td>
                            <td style={style.td}>Check if the order is already released or if there are quantity issues</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Quantity setting not available</td>
                            <td style={style.td}>Verify if quantity setting is enabled in the activity rules</td>
                        </tr>
                        <tr>
                            <td style={style.td}>No orders displayed</td>
                            <td style={style.td}>Click the Top 50 button to load recent orders</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
