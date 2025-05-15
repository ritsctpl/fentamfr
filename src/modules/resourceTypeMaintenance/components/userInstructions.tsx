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
                <h1 style={style.title}>Resource Type Maintenance Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to use the Resource Type Maintenance Screen for creating, managing, and configuring resource types with their associated resources and settings.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>System administrators, production engineers, and supervisors.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Resource Type Maintenance</td>
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
                            <td style={style.td}>Resource Type Management</td>
                            <td style={style.td}>Create, edit, delete, and copy resource types with comprehensive configuration options</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Resource Assignment</td>
                            <td style={style.td}>Assign and manage resources using drag-and-drop transfer table interface</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Search & Filter</td>
                            <td style={style.td}>Advanced search and filtering capabilities for both resource types and resources</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Full-Screen Mode</td>
                            <td style={style.td}>Toggle between normal and full-screen views for better visibility</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Table Operations</td>
                            <td style={style.td}>Sort, filter, and search within tables with pagination support</td>
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
                            <td style={style.td}>Displays all resource types with their details</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Action Buttons</td>
                            <td style={style.td}>Add New, Edit, Copy, Delete, Full-Screen Toggle</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Configuration Tabs</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li><strong>Main Tab:</strong>
                                        <ul style={style.list}>
                                            <li>Resource Type: Unique identifier (uppercase, alphanumeric)</li>
                                            <li>Resource Type Description: Optional detailed description</li>
                                            <li>Created/Modified Date: Timestamp information</li>
                                        </ul>
                                    </li>
                                    <li><strong>Resource Member List Tab:</strong>
                                        <ul style={style.list}>
                                            <li>Transfer Table: Drag-and-drop interface</li>
                                            <li>Available Resources: List of unassigned resources</li>
                                            <li>Assigned Resources: List of resources assigned to this type</li>
                                            <li>Search Functionality: Filter resources in both lists</li>
                                            <li>Multiple Selection: Select multiple resources at once</li>
                                        </ul>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>3.1. Field Definitions</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Field Name</th>
                            <th style={style.th}>Type</th>
                            <th style={style.th}>Required</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Resource Type</td>
                            <td style={style.td}>Text</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Resource Type Description</td>
                            <td style={style.td}>Text</td>
                            <td style={style.td}>No</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>4. Configuration Tabs Details</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Tab</th>
                            <th style={style.th}>Features</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Main</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Resource Type Field</li>
                                    <li>Description Field</li>
                                    <li>Date Information</li>
                                </ul>
                            </td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Primary configuration for resource type</li>
                                    <li>Auto-formatting for resource type field</li>
                                    <li>Real-time validation</li>
                                    <li>Display of creation and modification dates</li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Resource Member List</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Transfer Table</li>
                                    <li>Search Functionality</li>
                                    <li>Multiple Selection</li>
                                </ul>
                            </td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Drag-and-drop interface for resource assignment</li>
                                    <li>Search within available and assigned resources</li>
                                    <li>Select multiple resources using Shift/Ctrl keys</li>
                                    <li>Real-time updates when transferring resources</li>
                                    <li>Custom rendering of resource information</li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.1. Creating a New Resource Type</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Click the "+" button in the top right corner</li>
                        <li style={style.listItem}>Fill in the required Resource Type field (uppercase, alphanumeric only)</li>
                        <li style={style.listItem}>Add an optional description</li>
                        <li style={style.listItem}>Click "Create" to save the resource type</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.2. Managing Resources</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select a resource type from the list</li>
                        <li style={style.listItem}>Navigate to the Resource Member List tab</li>
                        <li style={style.listItem}>Use the transfer table to manage resources:
                            <ul style={style.list}>
                                <li>Drag and drop resources between Available and Assigned lists</li>
                                <li>Use the search box to find specific resources</li>
                                <li>Select multiple resources using Shift or Ctrl/Cmd key</li>
                                <li>Click transfer buttons to move selected items</li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.3. Table Operations</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Searching:
                            <ul style={style.list}>
                                <li>Use the search box in the table header</li>
                                <li>Click the search icon to filter results</li>
                                <li>Use the reset button to clear filters</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Sorting:
                            <ul style={style.list}>
                                <li>Click column headers to sort</li>
                                <li>Toggle between ascending and descending order</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Pagination:
                            <ul style={style.list}>
                                <li>Navigate through pages using pagination controls</li>
                                <li>View 10 items per page by default</li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.4. Additional Operations</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Copying a Resource Type:
                            <ul style={style.list}>
                                <li>Select the resource type to copy</li>
                                <li>Click the Copy button</li>
                                <li>Modify the name and description</li>
                                <li>Click "Copy" to create the duplicate</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Deleting a Resource Type:
                            <ul style={style.list}>
                                <li>Select the resource type to delete</li>
                                <li>Click the Delete button</li>
                                <li>Confirm deletion in the prompt dialog</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Full-Screen Mode:
                            <ul style={style.list}>
                                <li>Click the full-screen button to toggle view</li>
                                <li>Use escape key or button to exit full-screen</li>
                            </ul>
                        </li>
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
                            <td style={style.td}>Form Validation</td>
                            <td style={style.td}>Real-time validation of required fields and data formats</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Auto-Formatting</td>
                            <td style={style.td}>Automatic uppercase conversion and special character removal</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Error Handling</td>
                            <td style={style.td}>Comprehensive error messages and validation feedback</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Loading States</td>
                            <td style={style.td}>Visual feedback during data operations</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Confirmation Dialogs</td>
                            <td style={style.td}>Safety prompts for critical operations</td>
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
                            <td style={style.td}>Cannot save resource type</td>
                            <td style={style.td}>Check all required fields are filled and valid</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Resources not showing in transfer table</td>
                            <td style={style.td}>Verify resource assignment and refresh the list</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Search not working</td>
                            <td style={style.td}>Verify search term and refresh the list</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Drag and drop not functioning</td>
                            <td style={style.td}>Ensure browser supports HTML5 drag and drop</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
