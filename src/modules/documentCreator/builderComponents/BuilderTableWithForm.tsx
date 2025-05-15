import React from 'react';
import BuilderForm from './BuilderForm';
import BuilderTable from './BuilderTable';

interface BuilderTableWithFormProps {
    isEditable?: boolean;
    props: {
        title: any;
        data: any[] | any;
        metaData?: any[] | any;
        type?: string;
        style?: any;
        onChange?: any;
    }
}

const BuilderTableWithForm: React.FC<BuilderTableWithFormProps> = ({ isEditable = true, props }) => {
    console.log(props, 'ffff')
    const { title, onChange } = props;
    const { table, form } = props?.data || {};
    const { table: tableMetaData, form: formMetaData } = props?.metaData || {};
    const { heading } = props?.style || {};

    return (
        <div style={{ width: '100%' }}>
            <h3 style={{ fontWeight: 600, textAlign: heading?.titleAlign }}>{title}</h3>

            <BuilderTable
                isEditable={isEditable}
                props={{
                    title: '',
                    data: table,
                    metaData: tableMetaData,
                    style: {
                        heading: {
                            titleAlign: 'left'
                        }
                    },
                    onChange
                }}
            />

            {/* Form Section */}
            <BuilderForm
                isEditable={isEditable}
                props={{
                    title: '',
                    data: form,
                    metaData: formMetaData,
                    style: {
                        heading: {
                            titleAlign: 'left'
                        },
                        form: {
                            column: 2,
                        },
                        input: {
                            border: 'none',
                            borderRadius: 0,
                            borderBottom: '1px solid #ccc',
                        }
                    },
                    onChange
                }}
            />
        </div>
    );
};

export default BuilderTableWithForm;
