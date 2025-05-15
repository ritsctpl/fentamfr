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
                <h1 style={style.title}>Cycle Time Maintenance Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to use the Cycle Time Maintenance Screen for logging, updating, and tracking cycle time activities.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>Production engineers, supervisors, and system admins.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Cycle Time Maintenance</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>2. System Access</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Item</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>URL/Application Path</td>
                            <td style={style.td}>https://yourdomain.com/maintenance</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Login Requirement</td>
                            <td style={style.td}>Username & Password</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Access Roles</td>
                            <td style={style.td}>Production engineers, supervisors, and system admins.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>3. Navigation Path</h2>
                <p>Main Menu → Cycle Time Maintenance → Entry/Tracking</p>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>4. Screen Overview</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Section</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Header</td>
                            <td style={style.td}>Filters by Resource, Work Center, Operation, Item.</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Cycle Time Table</td>
                            <td style={style.td}>Lists past cycle time records (columns like Resource, Work Center, Operation, Item, Time, Cycle Time, Production Time).</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Action Buttons</td>
                            <td style={style.td}>+ Add New, Edit, Close, Delete, Export</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Form Panel (when adding/editing)</td>
                            <td style={style.td}>Form fields to log or update cycle time.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.1. Add New Cycle Time Record</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Click "+ Add New"</li>
                        <li style={style.listItem}>Fill in the following fields:
                            <ul style={style.list}>
                                <li>Resource (Dropdown)</li>
                                <li>Resource Type (Dropdown)</li>
                                <li>Work Center (Dropdown)</li>
                                <li>Operation (Dropdown)</li>
                                <li>Operation Version (Input)</li>
                                <li>Item (Dropdown)</li>
                                <li>Item Version (Input)</li>
                                <li>Target Quantity (Number)</li>
                                <li>Time (Time Picker)</li>
                                <li>Cycle Time (Auto/Manual)</li>
                                <li>Production Time (Auto/Manual)</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Click "Save"</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.2. Edit Existing Record</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select a record from the table.</li>
                        {/* <li style={style.listItem}>Click <b>Edit</b>.</li> */}
                        <li style={style.listItem}>Modify the necessary fields.</li>
                        <li style={style.listItem}>Click <b>Update</b>.</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.3. Delete a Record</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select an unwanted record.</li>
                        <li style={style.listItem}>Click <b>Delete</b>.</li>
                        <li style={style.listItem}>Confirm the prompt.</li>
                    </ol>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>6. Field Definitions</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Field Name</th>
                            <th style={style.th}>Description</th>
                            <th style={style.th}>Required</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Resource</td>
                            <td style={style.td}>Machine or area where cycle time applies</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Resource Type</td>
                            <td style={style.td}>Type/category of resource</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Work Center</td>
                            <td style={style.td}>Work center for the operation</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Operation</td>
                            <td style={style.td}>Operation performed</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Operation Version</td>
                            <td style={style.td}>Version of the operation</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Item</td>
                            <td style={style.td}>Material or item processed</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Item Version</td>
                            <td style={style.td}>Version of the item</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Target Quantity</td>
                            <td style={style.td}>Quantity for which time is measured</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Time</td>
                            <td style={style.td}>Time taken (HH:mm:ss)</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Cycle Time</td>
                            <td style={style.td}>Cycle time per unit (auto-calculated/manual)</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Production Time</td>
                            <td style={style.td}>Total production time (auto-calculated/manual)</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>7. FAQs / Troubleshooting</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Issue</th>
                            <th style={style.th}>Solution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Cannot save record</td>
                            <td style={style.td}>Check mandatory fields</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Cycle Time not accepted</td>
                            <td style={style.td}>Must be a positive number</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Record not showing in table</td>
                            <td style={style.td}>Adjust filter or check status</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Cannot edit deleted record</td>
                            <td style={style.td}>Only Admin role can restore deleted entries</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
