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
                <h1 style={style.title}>Equipment Status Change Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to change and manage equipment status in the system.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>Production operators, supervisors, and system administrators.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Equipment Status Change</td>
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
                            <td style={style.td}>https://yourdomain.com/equipment-status</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Login Requirement</td>
                            <td style={style.td}>Username & Password</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Access Roles</td>
                            <td style={style.td}>Production operators, supervisors, and system administrators.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>3. Navigation Path</h2>
                <p>Main Menu → Equipment Status → Change Status</p>
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
                            <td style={style.td}>Resource Selection</td>
                            <td style={style.td}>Select the equipment/resource to change status</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Work Center</td>
                            <td style={style.td}>Associated work center for the resource</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Status Selection</td>
                            <td style={style.td}>Choose new status (Unknown, Productive, etc.)</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Reason Code</td>
                            <td style={style.td}>Select reason for status change</td>
                        </tr>
                        <tr>
                            <td style={style.td}>DateTime Selection</td>
                            <td style={style.td}>Choose when the status change occurred</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Comments</td>
                            <td style={style.td}>Add any additional notes about the status change</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.1. Change Equipment Status</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select the Resource from the dropdown</li>
                        <li style={style.listItem}>Verify the Work Center (auto-populated)</li>
                        <li style={style.listItem}>Choose the new Status from the dropdown</li>
                        <li style={style.listItem}>Select a Reason Code for the change</li>
                        <li style={style.listItem}>Set the DateTime of the status change</li>
                        <li style={style.listItem}>Add any relevant Comments</li>
                        <li style={style.listItem}>Click "Update" to save the changes</li>
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
                            <td style={style.td}>Equipment or resource to change status</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Work Center</td>
                            <td style={style.td}>Associated work center</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Status</td>
                            <td style={style.td}>New status for the equipment</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Reason Code</td>
                            <td style={style.td}>Reason for status change</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>DateTime</td>
                            <td style={style.td}>When the status change occurred</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Comments</td>
                            <td style={style.td}>Additional notes about the change</td>
                            <td style={style.td}>No</td>
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
                            <td style={style.td}>Cannot change status</td>
                            <td style={style.td}>Check if you have proper permissions</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Work Center not showing</td>
                            <td style={style.td}>Verify resource selection</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Reason Code not available</td>
                            <td style={style.td}>Contact system administrator</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Update fails</td>
                            <td style={style.td}>Check all required fields are filled</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
