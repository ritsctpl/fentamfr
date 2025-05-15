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
                <h1 style={style.title}>Resource Maintenance Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to use the Resource Maintenance Screen for creating, managing, and configuring resources with their associated types, custom data, and settings.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>System administrators, production engineers, and supervisors.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Resource Maintenance</td>
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
                            <td style={style.td}>Resource Management</td>
                            <td style={style.td}>Create, edit, delete, and copy resources with comprehensive configuration options</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Resource Type Management</td>
                            <td style={style.td}>Assign and manage resource types using drag-and-drop interface</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Custom Data Fields</td>
                            <td style={style.td}>Configure and manage custom data fields for resources</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Search & Filter</td>
                            <td style={style.td}>Search resources and view top 50 entries</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Full-Screen Mode</td>
                            <td style={style.td}>Toggle between normal and full-screen views</td>
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
                            <td style={style.td}>Resource Bar</td>
                            <td style={style.td}>Contains search functionality, Top 50 button, and user instructions</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Resource List</td>
                            <td style={style.td}>Displays all resources with their details (Type, Name, Status, etc.)</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Action Buttons</td>
                            <td style={style.td}>Add New, Edit, Copy, Delete, Full-Screen Toggle</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Configuration Tabs</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Main: Basic resource information</li>
                                    <li>Resource Type: Type assignment and management</li>
                                    <li>Certification: Resource certification details</li>
                                    <li>OPC Tag: OPC tag configuration</li>
                                    <li>Activity Hook: Activity hook settings</li>
                                    <li>Custom Data: Custom field management</li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Table Operations</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Insert: Add new row to the table</li>
                                    <li>Insert Before: Add new row before selected row</li>
                                    <li>Insert After: Add new row after selected row</li>
                                    <li>Remove Selected: Delete selected rows</li>
                                    <li>Remove All: Clear all rows from the table</li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>4. Field Definitions</h2>
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
                            <td style={style.td}>Resource</td>
                            <td style={style.td}>Unique identifier for the resource</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Status</td>
                            <td style={style.td}>Current status of the resource</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Default Operation</td>
                            <td style={style.td}>Default operation setting</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Description</td>
                            <td style={style.td}>Detailed description of the resource</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Process Resource</td>
                            <td style={style.td}>Toggle for process resource functionality</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Valid From/To</td>
                            <td style={style.td}>Validity period dates</td>
                            <td style={style.td}>No</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.1. Creating a New Resource</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Click the "+" button in the top right corner</li>
                        <li style={style.listItem}>Fill in the required fields in the Main tab</li>
                        <li style={style.listItem}>Configure optional settings as needed</li>
                        <li style={style.listItem}>Click "Create" to save the resource</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.2. Managing Resource Types</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select a resource from the list</li>
                        <li style={style.listItem}>Navigate to the Resource Type tab</li>
                        <li style={style.listItem}>Use drag-and-drop to assign/unassign types</li>
                        <li style={style.listItem}>Use search to find specific types</li>
                        <li style={style.listItem}>Transfer operations:
                            <ul style={style.list}>
                                <li>Drag and drop items between Available and Assigned lists</li>
                                <li>Use the transfer buttons to move items</li>
                                <li>Search within each list using the search box</li>
                                <li>Select multiple items using Shift or Ctrl/Cmd key</li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.3. Table Operations</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Adding Rows:
                            <ul style={style.list}>
                                <li>Click "Insert" to add a new row at the end</li>
                                <li>Select a row and click "Insert Before" to add above</li>
                                <li>Select a row and click "Insert After" to add below</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Removing Rows:
                            <ul style={style.list}>
                                <li>Select one or more rows and click "Remove Selected"</li>
                                <li>Click "Remove All" to clear the entire table</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Selection Tips:
                            <ul style={style.list}>
                                <li>Use Shift + Click for range selection</li>
                                <li>Use Ctrl/Cmd + Click for multiple selections</li>
                                <li>Click column headers to sort</li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.4. Configuring Custom Data</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select a resource from the list</li>
                        <li style={style.listItem}>Navigate to the Custom Data tab</li>
                        <li style={style.listItem}>Add or modify custom field values</li>
                        <li style={style.listItem}>Save changes</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.5. Copying a Resource</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select the resource to copy</li>
                        <li style={style.listItem}>Click the Copy button</li>
                        <li style={style.listItem}>Modify the resource name and description</li>
                        <li style={style.listItem}>Click "Copy" to create the duplicate</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.6. Deleting a Resource</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select the resource to delete</li>
                        <li style={style.listItem}>Click the Delete button</li>
                        <li style={style.listItem}>Confirm deletion in the prompt dialog</li>
                    </ol>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>6. Additional Features</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Feature</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Full-Screen Mode</td>
                            <td style={style.td}>Toggle between normal and full-screen views for better visibility</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Search</td>
                            <td style={style.td}>Search through existing resources</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Top 50</td>
                            <td style={style.td}>View the most recent 50 resources</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Form Validation</td>
                            <td style={style.td}>Real-time validation of required fields and data formats</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Date Management</td>
                            <td style={style.td}>Set validity periods with date picker</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Transfer Component</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Drag and drop functionality</li>
                                    <li>Search within lists</li>
                                    <li>Multiple selection support</li>
                                    <li>Real-time updates</li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Table Management</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Insert rows at different positions</li>
                                    <li>Remove selected or all rows</li>
                                    <li>Sort by columns</li>
                                    <li>Multiple row selection</li>
                                </ul>
                            </td>
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
                            <td style={style.td}>Cannot save resource</td>
                            <td style={style.td}>Check all required fields are filled and valid</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Resource type not showing</td>
                            <td style={style.td}>Verify type assignment and refresh the list</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Custom data not saving</td>
                            <td style={style.td}>Check field values and save changes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Search not working</td>
                            <td style={style.td}>Verify search term and refresh the list</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
