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
                <h1 style={style.title}>Item Group Maintenance Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to manage item groups, including creating, updating, and managing group members.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>Production engineers, supervisors, and system admins.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Item Group Maintenance</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>2. Screen Overview</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Section</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Search Bar</td>
                            <td style={style.td}>Search for item groups by name or description</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Item Group Table</td>
                            <td style={style.td}>Lists all item groups with their details</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Add Button (+)</td>
                            <td style={style.td}>Create new item group</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Maintenance Form</td>
                            <td style={style.td}>Two tabs: Main details and Group Members</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>3. Main Features</h2>
                
                <div style={style.section}>
                    <h3 style={style.subTitle}>3.1. Creating New Item Group</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Click the "+" button</li>
                        <li style={style.listItem}>Fill in the main details:
                            <ul style={style.list}>
                                <li>Item Group (Required)</li>
                                <li>Group Description</li>
                                <li>Unit Price</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Switch to "Group Member" tab to add items</li>
                        <li style={style.listItem}>Click "Create" to save</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>3.2. Managing Group Members</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select an item group from the table</li>
                        <li style={style.listItem}>Click "Group Member" tab</li>
                        <li style={style.listItem}>Use the transfer component to:
                            <ul style={style.list}>
                                <li>Move items from Available to Assigned</li>
                                <li>Remove items from the group</li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>3.3. Editing Item Group</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select an item group from the table</li>
                        <li style={style.listItem}>Modify the required fields</li>
                        <li style={style.listItem}>Click "Save" to update</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>3.4. Copying Item Group</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select an item group from the table</li>
                        <li style={style.listItem}>Click the "Copy" button</li>
                        <li style={style.listItem}>Modify the Item Group name (required)</li>
                        <li style={style.listItem}>Update other fields as needed</li>
                        <li style={style.listItem}>Click "Copy" to save the new copy</li>
                    </ol>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>3.5. Deleting Item Group</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Select an item group from the table</li>
                        <li style={style.listItem}>Click the "Delete" button</li>
                        <li style={style.listItem}>Confirm deletion in the popup dialog</li>
                        <li style={style.listItem}>The item group will be permanently removed</li>
                    </ol>
                    <p><strong>Note:</strong> Deletion cannot be undone. Make sure to verify the item group before deleting.</p>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>4. Field Definitions</h2>
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
                            <td style={style.td}>Item Group</td>
                            <td style={style.td}>Unique identifier for the group</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Group Description</td>
                            <td style={style.td}>Description of the item group</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Unit Price</td>
                            <td style={style.td}>Price per unit for the group</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Group Members</td>
                            <td style={style.td}>List of items in the group</td>
                            <td style={style.td}>No</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. Transfer Table Guide</h2>
                <div style={style.section}>
                    <h3 style={style.subTitle}>5.1. Overview</h3>
                    <p>The Transfer Table is a key component for managing group members, featuring two columns:</p>
                    <ul style={style.list}>
                        <li style={style.listItem}><strong>Available Items (Left Column):</strong> Shows all items that can be added to the group</li>
                        <li style={style.listItem}><strong>Assigned Items (Right Column):</strong> Shows items currently in the group</li>
                    </ul>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.2. Key Features</h3>
                    <table style={style.table}>
                        <thead>
                            <tr>
                                <th style={style.th}>Feature</th>
                                <th style={style.th}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={style.td}>Search Function</td>
                                <td style={style.td}>Search box in each column to filter items</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Transfer Buttons</td>
                                <td style={style.td}>Arrow buttons to move items between columns</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Bulk Selection</td>
                                <td style={style.td}>Select multiple items for batch transfer</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Drag and Drop</td>
                                <td style={style.td}>Drag items between columns (if supported)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>5.3. How to Use</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Adding Items to Group:
                            <ul style={style.list}>
                                <li>Select items from Available Items column</li>
                                <li>Click right arrow (→) to move to Assigned Items</li>
                                <li>Items will appear in the group members list</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Removing Items from Group:
                            <ul style={style.list}>
                                <li>Select items from Assigned Items column</li>
                                <li>Click left arrow (←) to move back to Available Items</li>
                                <li>Items will be removed from the group</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Searching Items:
                            <ul style={style.list}>
                                <li>Use search box in either column</li>
                                <li>Type item name or identifier</li>
                                <li>List will filter in real-time</li>
                            </ul>
                        </li>
                    </ol>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>6. Tips & Best Practices</h2>
                <ul style={style.list}>
                    <li style={style.listItem}>Use the search function to quickly find item groups</li>
                    <li style={style.listItem}>Click "Go" to view the top 50 item groups</li>
                    <li style={style.listItem}>Use the transfer component's search to quickly find items</li>
                    <li style={style.listItem}>Save changes before switching tabs</li>
                    <li style={style.listItem}>When using the transfer table:
                        <ul style={style.list}>
                            <li>Use search to filter large lists</li>
                            <li>Select multiple items for bulk operations</li>
                            <li>Verify changes before saving</li>
                            <li>Use keyboard shortcuts for efficiency</li>
                        </ul>
                    </li>
                </ul>
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
                            <td style={style.td}>Cannot save new item group</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Check if Item Group field is filled</li>
                                    <li>Verify Item Group name is unique</li>
                                    <li>Ensure no special characters in Item Group name</li>
                                    <li>Check if you have proper permissions</li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Items not showing in transfer table</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Click "Go" to refresh the item list</li>
                                    <li>Check if items exist in the system</li>
                                    <li>Verify your search criteria</li>
                                    <li>Clear search filters if any</li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Cannot add items to group</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Check if group has reached maximum items (1000)</li>
                                    <li>Verify item is not already in the group</li>
                                    <li>Ensure you have proper permissions</li>
                                    <li>Try refreshing the page</li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Changes not saving</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Click "Save" before switching tabs</li>
                                    <li>Check for validation errors</li>
                                    <li>Verify your session is active</li>
                                    <li>Try refreshing the page</li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Search not working</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Clear search box and try again</li>
                                    <li>Check for special characters in search</li>
                                    <li>Verify item exists in the system</li>
                                    <li>Try using partial item names</li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <td style={style.td}>Transfer table not responding</td>
                            <td style={style.td}>
                                <ul style={style.list}>
                                    <li>Refresh the page</li>
                                    <li>Clear browser cache</li>
                                    <li>Check internet connection</li>
                                    <li>Try using different browser</li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
