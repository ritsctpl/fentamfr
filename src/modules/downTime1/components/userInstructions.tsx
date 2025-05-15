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
                <h1 style={style.title}>Downtime Management Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to manage and track both planned and unplanned downtime events in the production system.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>Production engineers, supervisors, and system admins.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Downtime Management</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>2. Screen Overview</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Tab</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Unplanned DT</td>
                            <td style={style.td}>View and manage unplanned downtime events</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Planned DT</td>
                            <td style={style.td}>View and manage planned downtime events</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>3. Features and Functionality</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>3.1. Search and Filter</h3>
                    <ul style={style.list}>
                        <li style={style.listItem}>Date Range Picker: Filter downtime events by date and time range</li>
                        <li style={style.listItem}>Resource Selection: Filter by specific resources or work centers</li>
                        <li style={style.listItem}>Search Button: Apply filters and refresh the data table</li>
                    </ul>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>3.2. Data Table Columns</h3>
                    <ul style={style.list}>
                        <li style={style.listItem}>Resource ID: Identifier of the affected resource</li>
                        <li style={style.listItem}>Downtime Type: Classification of the downtime event</li>
                        <li style={style.listItem}>Start Time: When the downtime began</li>
                        <li style={style.listItem}>End Time: When the downtime ended</li>
                        <li style={style.listItem}>Duration: Total duration of the downtime</li>
                        <li style={style.listItem}>Reason: Cause of the downtime</li>
                        <li style={style.listItem}>Actions: Edit or update downtime records</li>
                    </ul>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>3.3. Planned Downtime Management</h3>
                    <ul style={style.list}>
                        <li style={style.listItem}>Add new planned downtime events</li>
                        <li style={style.listItem}>Select object type (Cell Group, Cell, Line)</li>
                        <li style={style.listItem}>Set planned start and end times</li>
                        <li style={style.listItem}>Specify reason codes and descriptions</li>
                    </ul>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>3.4. Unplanned Downtime Management</h3>
                    <ul style={style.list}>
                        <li style={style.listItem}>Record unexpected downtime events</li>
                        <li style={style.listItem}>Update existing downtime records</li>
                        <li style={style.listItem}>Add reason codes and root causes</li>
                        <li style={style.listItem}>Track duration and impact</li>
                    </ul>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>4. Common Operations</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Operation</th>
                            <th style={style.th}>Steps</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Add New Downtime</td>
                            <td style={style.td}>
                                1. Click "+ Add New" button<br />
                                2. Fill in required fields<br />
                                3. Select date/time range<br />
                                4. Choose reason code<br />
                                5. Click Save
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Edit Downtime</td>
                            <td style={style.td}>
                                1. Click Edit icon on the record<br />
                                2. Modify necessary fields<br />
                                3. Click Save to update
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Search Records</td>
                            <td style={style.td}>
                                1. Set date range<br />
                                2. Select resources (optional)<br />
                                3. Click Search button
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. Troubleshooting</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Issue</th>
                            <th style={style.th}>Solution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Cannot save downtime record</td>
                            <td style={style.td}>Ensure all required fields are filled and time ranges are valid</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Records not showing</td>
                            <td style={style.td}>Check date range and resource filters</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Edit not working</td>
                            <td style={style.td}>Verify user permissions and record status</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
