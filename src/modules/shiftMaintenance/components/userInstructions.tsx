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
                <h1 style={style.title}>Shift Maintenance Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to use the Shift Maintenance Screen for creating, managing, and configuring shift settings, intervals, and calendar rules.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>System administrators, production engineers, and supervisors.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Shift Maintenance</td>
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
                            <td style={style.td}>Shift Creation</td>
                            <td style={style.td}>Create new shift configurations with customizable settings</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Shift Intervals</td>
                            <td style={style.td}>Manage shift time intervals, breaks, and validity periods</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Calendar Rules</td>
                            <td style={style.td}>Configure production days and calendar rules</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Calendar Overrides</td>
                            <td style={style.td}>Set up calendar overrides for specific dates</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Custom Data</td>
                            <td style={style.td}>Add and manage custom data fields for shifts</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>3. System Access</h2>
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
                            <td style={style.td}>https://yourdomain.com/shift-maintenance</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Login Requirement</td>
                            <td style={style.td}>Username & Password</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Access Roles</td>
                            <td style={style.td}>System administrators, production engineers, and supervisors</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>4. Navigation Path</h2>
                <p>Main Menu → Shift Maintenance → Configuration</p>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. Screen Overview</h2>
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
                            <td style={style.td}>Contains search functionality, Top 50 button, and user instructions</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Shift List</td>
                            <td style={style.td}>Displays all shift configurations with their details (Name, Type, Status, etc.)</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Action Buttons</td>
                            <td style={style.td}>+ Add New, Edit, Copy, Delete, Export</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Configuration Panel</td>
                            <td style={style.td}>Form fields for creating/editing shift configurations</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Shift Interval Management</td>
                            <td style={style.td}>Manage shift intervals and breaks</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>6. Field Definitions</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Field</th>
                            <th style={style.th}>Description</th>
                            <th style={style.th}>Required</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Shift Name</td>
                            <td style={style.td}>Unique identifier for the shift (uppercase, no spaces)</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Shift Type</td>
                            <td style={style.td}>Type of shift (Resource, Work Center, or General)</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Work Center/Resource</td>
                            <td style={style.td}>Associated work center or resource based on shift type</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Description</td>
                            <td style={style.td}>Detailed description of the shift</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>ERP Shift</td>
                            <td style={style.td}>Toggle for ERP integration</td>
                            <td style={style.td}>No</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>7. Shift Interval Management</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Field</th>
                            <th style={style.th}>Description</th>
                            <th style={style.th}>Required</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Valid From</td>
                            <td style={style.td}>Start date and time of shift validity</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Valid End</td>
                            <td style={style.td}>End date and time of shift validity</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Start Time</td>
                            <td style={style.td}>Daily shift start time</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>End Time</td>
                            <td style={style.td}>Daily shift end time</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Clock In/Out Times</td>
                            <td style={style.td}>Employee clock in/out time windows</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Breaks</td>
                            <td style={style.td}>Configure shift breaks and durations</td>
                            <td style={style.td}>No</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>8. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.1. Creating a New Shift</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Click the "+" button in the top right corner</li>
                        <li style={style.listItem}>Fill in the required fields in the Main tab:
                            <ul style={style.list}>
                                <li>Shift Name (uppercase, no spaces)</li>
                                <li>Description</li>
                                <li>Shift Type</li>
                                <li>Work Center/Resource (based on shift type)</li>
                                <li>ERP Shift toggle (if needed)</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Configure Shift Intervals:
                            <ul style={style.list}>
                                <li>Click "Insert" to add new intervals</li>
                                <li>Set validity period (Valid From/To)</li>
                                <li>Configure daily start/end times</li>
                                <li>Add breaks if needed</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Set up Calendar Rules (optional):
                            <ul style={style.list}>
                                <li>Configure production days</li>
                                <li>Set day classes</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Add Calendar Overrides (optional):
                            <ul style={style.list}>
                                <li>Set specific date overrides</li>
                                <li>Configure override rules</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Add Custom Data (optional)</li>
                        <li style={style.listItem}>Click "Create" to save the shift configuration</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.2. Editing an Existing Shift</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select a shift from the table list</li>
                        <li style={style.listItem}>Modify the necessary fields</li>
                        <li style={style.listItem}>Click "Save" to update the shift</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.3. Copying a Shift</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select the shift to copy</li>
                        <li style={style.listItem}>Click the "Copy" button</li>
                        <li style={style.listItem}>Enter a new shift name</li>
                        <li style={style.listItem}>Modify any settings as needed</li>
                        <li style={style.listItem}>Click "Create" to save the new shift</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.4. Deleting a Shift</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select the shift to delete</li>
                        <li style={style.listItem}>Click the "Delete" button</li>
                        <li style={style.listItem}>Confirm the deletion in the prompt dialog</li>
                    </ol>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>9. Additional Features</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Feature</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Search</td>
                            <td style={style.td}>Search through existing shifts by name, description, or type</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Full Screen Mode</td>
                            <td style={style.td}>Toggle full screen view for better visibility</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Bulk Actions</td>
                            <td style={style.td}>Select multiple shift intervals for batch operations</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Responsive Design</td>
                            <td style={style.td}>Adapts to different screen sizes and devices</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>10. FAQs / Troubleshooting</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Issue</th>
                            <th style={style.th}>Solution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Cannot save shift</td>
                            <td style={style.td}>Check all required fields are filled and shift name is unique</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Invalid date/time</td>
                            <td style={style.td}>Ensure Valid End is after Valid From and times are in correct format</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Shift intervals not showing</td>
                            <td style={style.td}>Verify interval dates and times are properly configured</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Calendar rules not applying</td>
                            <td style={style.td}>Check calendar rule configuration and override settings</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
