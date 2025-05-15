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
                <h1 style={style.title}>Line Clearance Report User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to use the Line Clearance Report for tracking and managing line clearance activities in manufacturing processes.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>Production supervisors, quality control personnel, and manufacturing operators.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Line Clearance Report</td>
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
                            <td style={style.td}>https://yourdomain.com/line-clearance</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Login Requirement</td>
                            <td style={style.td}>Username & Password</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Access Roles</td>
                            <td style={style.td}>Production supervisors, quality control personnel, and manufacturing operators.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>3. Navigation Path</h2>
                <p>Main Menu → Line Clearance → Report</p>
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
                            <td style={style.td}>Search Filters</td>
                            <td style={style.td}>Filters for Batch No/PCU, Template Name, Resource, Phase, Operation, Date Range, and Status.</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Report Table</td>
                            <td style={style.td}>Displays line clearance records with details like Batch No, Template Name, Phase, Operation, Resource, Task details, Status, and Timestamps.</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Action Buttons</td>
                            <td style={style.td}>Search, Clear, Export (PDF/Excel), and Instructions</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.1. Search Records</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select appropriate filters:
                            <ul style={style.list}>
                                <li>Batch No/PCU (for process/discrete manufacturing)</li>
                                <li>Template Name</li>
                                <li>Resource</li>
                                <li>Phase (for process manufacturing)</li>
                                <li>Operation (for process manufacturing)</li>
                                <li>Date Range (24hours, Today, Yesterday, This Week, etc.)</li>
                                <li>Status (Complete, Start, New)</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Click "Search" button</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.2. View Evidence</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Locate the record in the table</li>
                        <li style={style.listItem}>Click the "Preview" button in the Evidence column</li>
                        <li style={style.listItem}>View the evidence in the preview modal</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.3. Export Report</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Click the "Export" button</li>
                        <li style={style.listItem}>Choose export format (PDF or Excel)</li>
                        <li style={style.listItem}>The report will be downloaded with all current filters and data</li>
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
                            <td style={style.td}>Site</td>
                            <td style={style.td}>Manufacturing site or plant location</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>User</td>
                            <td style={style.td}>User ID of the person performing the search</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Resource</td>
                            <td style={style.td}>Production resource or equipment ID</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Batch No/PCU</td>
                            <td style={style.td}>Batch number for process manufacturing or PCU for discrete manufacturing</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Template Name</td>
                            <td style={style.td}>Name of the line clearance template used</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Status</td>
                            <td style={style.td}>Current status of the clearance task (Complete, Start, New)</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Date Range</td>
                            <td style={style.td}>Time period for the search (24hours, Today, Yesterday, This Week, etc.)</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Date Time</td>
                            <td style={style.td}>Custom date range with start and end dates (appears when Date Range is set to Custom)</td>
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
                            <td style={style.td}>No records found</td>
                            <td style={style.td}>Check if filters are too restrictive or try a different date range</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Cannot view evidence</td>
                            <td style={style.td}>Ensure you have proper permissions and the evidence file exists</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Export fails</td>
                            <td style={style.td}>Check if you have too many records selected or try a different format</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Phase/Operation not showing</td>
                            <td style={style.td}>Verify that you are in process manufacturing mode</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
