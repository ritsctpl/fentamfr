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
                <h1 style={style.title}>Work Center Maintenance Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to use the Work Center Maintenance Screen for creating, managing, and configuring work centers, their relationships, and associated data.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>System administrators, production engineers, and supervisors.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Work Center Maintenance</td>
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
                            <td style={style.td}>Work Center Management</td>
                            <td style={style.td}>Create, edit, copy, and delete work centers</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Search and Filter</td>
                            <td style={style.td}>Search work centers and view top 50 entries</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Data Configuration</td>
                            <td style={style.td}>Configure work center properties, relationships, and custom data</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Activity Hooks</td>
                            <td style={style.td}>Manage activity hooks and their configurations</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Associations</td>
                            <td style={style.td}>Manage work center associations and relationships</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Custom Data</td>
                            <td style={style.td}>Add and manage custom data fields for work centers</td>
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
                            <td style={style.td}>https://yourdomain.com/work-center-maintenance</td>
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
                <p>Main Menu → Work Center Maintenance → Configuration</p>
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
                            <td style={style.td}>Work Center List</td>
                            <td style={style.td}>Displays all work centers with their details (ID, Status, Category, etc.)</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Action Buttons</td>
                            <td style={style.td}>+ Add New, Edit, Copy, Delete, Export</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Configuration Panel</td>
                            <td style={style.td}>Form fields for creating/editing work centers</td>
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
                            <td style={style.td}>Work Center</td>
                            <td style={style.td}>Unique identifier (uppercase, no spaces)</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Status</td>
                            <td style={style.td}>Work center status (Available/Not Available)</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Work Center Category</td>
                            <td style={style.td}>Type of work center (Cell/Line/Cell Group)</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Description</td>
                            <td style={style.td}>Detailed description of the work center</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Track OEE</td>
                            <td style={style.td}>Toggle for OEE tracking</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Routing</td>
                            <td style={style.td}>Associated routing configuration</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>ERP Work Center</td>
                            <td style={style.td}>ERP system work center reference</td>
                            <td style={style.td}>No</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>7. Table Operations</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Operation</th>
                            <th style={style.th}>Description</th>
                            <th style={style.th}>How to Use</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Insert Row</td>
                            <td style={style.td}>Add a new row to the table</td>
                            <td style={style.td}>
                                <ol style={style.list}>
                                    <li style={style.listItem}>Click the "+" button in the table toolbar</li>
                                    <li style={style.listItem}>Fill in the required fields</li>
                                    <li style={style.listItem}>Click "Save" to add the row</li>
                                </ol>
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Select Row</td>
                            <td style={style.td}>Select a row for editing or deletion</td>
                            <td style={style.td}>
                                <ol style={style.list}>
                                    <li style={style.listItem}>Click on the row you want to select</li>
                                    <li style={style.listItem}>The row will be highlighted</li>
                                    <li style={style.listItem}>Use the action buttons to edit or delete</li>
                                </ol>
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Remove Row</td>
                            <td style={style.td}>Delete a single row from the table</td>
                            <td style={style.td}>
                                <ol style={style.list}>
                                    <li style={style.listItem}>Select the row you want to remove</li>
                                    <li style={style.listItem}>Click the "Delete" button</li>
                                    <li style={style.listItem}>Confirm the deletion in the prompt dialog</li>
                                </ol>
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Remove All</td>
                            <td style={style.td}>Delete all rows from the table</td>
                            <td style={style.td}>
                                <ol style={style.list}>
                                    <li style={style.listItem}>Click the "Remove All" button in the table toolbar</li>
                                    <li style={style.listItem}>Confirm the deletion in the prompt dialog</li>
                                    <li style={style.listItem}>All rows will be removed from the table</li>
                                </ol>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style={style.section}>
                    <h3 style={style.subTitle}>7.1. Table Operations Tips</h3>
                    <ul style={style.list}>
                        <li style={style.listItem}>You can select multiple rows by holding Ctrl/Cmd while clicking</li>
                        <li style={style.listItem}>Use the search function to find specific rows before performing operations</li>
                        <li style={style.listItem}>The "Remove All" operation cannot be undone - use with caution</li>
                        <li style={style.listItem}>Some tables may have restrictions on which rows can be deleted</li>
                        <li style={style.listItem}>Changes are saved automatically after each operation</li>
                    </ul>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>8. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.1. Creating a New Work Center</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Click the "+" button in the top right corner</li>
                        <li style={style.listItem}>Fill in the required fields in the Main tab:
                            <ul style={style.list}>
                                <li>Work Center ID (uppercase, no spaces)</li>
                                <li>Description</li>
                                <li>Status</li>
                                <li>Work Center Category</li>
                                <li>Track OEE toggle (if needed)</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Configure optional fields:
                            <ul style={style.list}>
                                <li>Routing and Routing Version</li>
                                <li>ERP Work Center</li>
                                <li>Default Parent Work Center</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Set up Activity Hooks (optional):
                            <ul style={style.list}>
                                <li>Add activity hooks</li>
                                <li>Configure hook parameters</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Manage Associations (optional):
                            <ul style={style.list}>
                                <li>Add work center associations</li>
                                <li>Configure association properties</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Add Custom Data (optional)</li>
                        <li style={style.listItem}>Click "Create" to save the work center</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.2. Editing a Work Center</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select a work center from the list</li>
                        <li style={style.listItem}>Modify the necessary fields</li>
                        <li style={style.listItem}>Update Activity Hooks if needed</li>
                        <li style={style.listItem}>Update Associations if needed</li>
                        <li style={style.listItem}>Update Custom Data if needed</li>
                        <li style={style.listItem}>Click "Save" to update the work center</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.3. Copying a Work Center</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select the work center from table list</li>
                        <li style={style.listItem}>Click the "Copy" button</li>
                        <li style={style.listItem}>Enter a new work center description</li>
                        <li style={style.listItem}>Click "Copy" to save the new work center</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.4. Deleting a Work Center</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select the work center to delete</li>
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
                            <td style={style.td}>Search through work centers by ID, description, or any field</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Top 50 View</td>
                            <td style={style.td}>Quick access to the 50 most recent work centers</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Full Screen Mode</td>
                            <td style={style.td}>Toggle full screen view for better visibility</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Multi-language Support</td>
                            <td style={style.td}>Interface available in multiple languages</td>
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
                            <td style={style.td}>Cannot save work center</td>
                            <td style={style.td}>Check all required fields are filled and work center ID is unique</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Invalid work center ID</td>
                            <td style={style.td}>Ensure ID is uppercase with no spaces or special characters</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Activity hooks not working</td>
                            <td style={style.td}>Verify hook configuration and parameters</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Associations not showing</td>
                            <td style={style.td}>Check association configuration and parent-child relationships</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Custom data not saving</td>
                            <td style={style.td}>Verify custom data field configuration and values</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
