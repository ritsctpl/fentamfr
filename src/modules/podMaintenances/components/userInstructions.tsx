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
                <h1 style={style.title}>POD Maintenance Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to use the POD Maintenance Screen for creating, managing, and configuring POD (Point of Display) settings and components.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>System administrators, production engineers, and supervisors.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>POD Maintenance</td>
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
                            <td style={style.td}>POD Creation</td>
                            <td style={style.td}>Create new POD configurations with customizable settings</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Component Management</td>
                            <td style={style.td}>Add, edit, and manage button components and their sequences</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Layout Configuration</td>
                            <td style={style.td}>Configure panel layouts and UI components</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Settings Management</td>
                            <td style={style.td}>Configure POD settings including Kafka integration, session timeouts, and display options</td>
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
                            <td style={style.td}>https://yourdomain.com/pod-maintenance</td>
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
                <p>Main Menu → POD Maintenance → Configuration</p>
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
                            <td style={style.td}>POD List</td>
                            <td style={style.td}>Displays all POD configurations with their details (Type, Name, Status, etc.)</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Action Buttons</td>
                            <td style={style.td}>+ Add New, Edit, Copy, Delete, Export</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Configuration Panel</td>
                            <td style={style.td}>Form fields for creating/editing POD configurations</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Component Tabs</td>
                            <td style={style.td}>Tabs for managing different aspects (Home, Activities, Layout, Settings)</td>
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
                            <td style={style.td}>Type</td>
                            <td style={style.td}>Type of POD configuration</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Pod Name</td>
                            <td style={style.td}>Name of the POD configuration</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Status</td>
                            <td style={style.td}>Current status of the POD</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Panel Layout</td>
                            <td style={style.td}>Layout configuration for the POD</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Default Operation</td>
                            <td style={style.td}>Default operation setting</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Default Resource</td>
                            <td style={style.td}>Default resource setting</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Description</td>
                            <td style={style.td}>Detailed description of the POD</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Resource Type</td>
                            <td style={style.td}>Type of resource used</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Kafka Integration</td>
                            <td style={style.td}>Enable/disable Kafka integration</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Kafka ID</td>
                            <td style={style.td}>Kafka integration identifier</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Session Timeout</td>
                            <td style={style.td}>Session timeout duration</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Refresh Rate</td>
                            <td style={style.td}>Data refresh rate setting</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Default Phase ID</td>
                            <td style={style.td}>Default phase identifier</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Show Resource</td>
                            <td style={style.td}>Toggle resource display</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Show Operation</td>
                            <td style={style.td}>Toggle operation display</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Show Phase</td>
                            <td style={style.td}>Toggle phase display</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Phase Can Be Changed</td>
                            <td style={style.td}>Allow phase modification</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Operation Can Be Changed</td>
                            <td style={style.td}>Allow operation modification</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Resource Can Be Changed</td>
                            <td style={style.td}>Allow resource modification</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Show Quantity</td>
                            <td style={style.td}>Toggle quantity display</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Document Name</td>
                            <td style={style.td}>Associated document name</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>WebSocket Integration</td>
                            <td style={style.td}>Enable/disable WebSocket integration</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>WebSocket URLs</td>
                            <td style={style.td}>WebSocket connection URLs</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Pod Category</td>
                            <td style={style.td}>Category classification of the POD</td>
                            <td style={style.td}>No</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>7. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>7.1. Creating a New POD</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Click the "+" button in the top right corner</li>
                        <li style={style.listItem}>Fill in the required fields:
                            <ul style={style.list}>
                                <li>Type</li>
                                <li>Pod Name</li>
                                <li>Status</li>
                                <li>Panel Layout</li>
                                <li>Default Operation</li>
                                <li>Default Resource</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Configure optional settings:
                            <ul style={style.list}>
                                <li>Kafka Integration</li>
                                <li>Session Timeout</li>
                                <li>Refresh Rate</li>
                                <li>Display Options</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Click "Create" to save the POD configuration</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>7.2. Managing Components</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select a POD from the list</li>
                        <li style={style.listItem}>Navigate to the Components tab</li>
                        <li style={style.listItem}>Add new components using the "+" button</li>
                        <li style={style.listItem}>Configure component properties:
                            <ul style={style.list}>
                                <li>Button ID</li>
                                <li>Button Label</li>
                                <li>Button Type</li>
                                <li>Sequence</li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>7.3. Layout Configuration</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select a POD from the list</li>
                        <li style={style.listItem}>Navigate to the Layout tab</li>
                        <li style={style.listItem}>Configure panel settings:
                            <ul style={style.list}>
                                <li>Panel Type</li>
                                <li>Default Plugin</li>
                                <li>Default URL</li>
                                <li>Other Plugins</li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>7.4. Edit Existing Record</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select a POD from the list</li>
                        <li style={style.listItem}>Click the <b>Edit</b> button</li>
                        <li style={style.listItem}>Modify the necessary fields in the configuration panel</li>
                        <li style={style.listItem}>Click <b>Update</b> to save changes</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>7.5. Delete a Record</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select the POD to be deleted from the list</li>
                        <li style={style.listItem}>Click the <b>Delete</b> button</li>
                        <li style={style.listItem}>Confirm the deletion in the prompt dialog</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>7.6. Copy a POD Configuration</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select the POD configuration you want to copy from the list</li>
                        <li style={style.listItem}>Click the <b>Copy</b> button</li>
                        <li style={style.listItem}>A new POD configuration will be created with all settings copied from the original</li>
                        <li style={style.listItem}>Modify the necessary fields (like Pod Name) to differentiate it from the original</li>
                        <li style={style.listItem}>Click <b>Save</b> to create the new POD configuration</li>
                    </ol>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>8. Additional Features</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Feature</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Copy POD</td>
                            <td style={style.td}>Create a copy of an existing POD configuration</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Search</td>
                            <td style={style.td}>Search through existing POD configurations</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Top 50</td>
                            <td style={style.td}>View the most recent 50 POD configurations</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Settings</td>
                            <td style={style.td}>Configure advanced settings and integrations</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>9. FAQs / Troubleshooting</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Issue</th>
                            <th style={style.th}>Solution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Cannot save POD</td>
                            <td style={style.td}>Check all required fields are filled</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Component not showing</td>
                            <td style={style.td}>Verify sequence number and component configuration</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Layout issues</td>
                            <td style={style.td}>Check panel configuration and plugin settings</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Integration errors</td>
                            <td style={style.td}>Verify Kafka/WebSocket settings and connections</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
