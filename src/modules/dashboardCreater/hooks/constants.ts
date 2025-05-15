export const DEFAULT_STYLES = {
    div: {
        width: '100%',
        height: '50px',
        backgroundColor: '#ffffff',
        borderRadius: '0px',
        padding: '16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    button: {
        width: '80px',
        height: '20px',
        borderRadius: '4px',
        
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        fontSize: '19px',
        color: '#000000',
        padding: '4px',
        margin: '0',
        fontWeight: 'normal',
        lineHeight: '1.5',
        textAlign: 'left'
    },
    table: {
        width: '300px',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        padding: '0px',
        boxSizing: 'border-box'
    },
    gauge: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        padding: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    card: {
        width: '300px',
        height:'100%',
        minHeight: '100px',
        backgroundColor: '#ffffff',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #f0f0f0',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
    },
    bar: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        padding: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    line: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        padding: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    form: {
        width: '400px',
        height: 'auto',
        backgroundColor: '#fff',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #f0f0f0',
        boxSizing: 'border-box',
        formLayout: 'vertical',
        labelWidth: '120px',
        fieldSpacing: '16px',
        labelAlign: 'left'
    },
    textInput: {
        width: '100%',
        padding: '0px',
        display: 'flex',
        labelStyle: { marginBottom: '0px' }
    },
    browse: {
        width: '100%',
        padding: '0px',
        display: 'flex',
        labelStyle: { marginBottom: '0px' }
    }
} as const;

export const DEFAULT_PROPS = {
    div: {
        style: DEFAULT_STYLES.div
    },
    button: {
        style: DEFAULT_STYLES.button,
        buttonType: 'primary',
        size: 'middle',
        text: 'Button'
    },
    text: {
        style: DEFAULT_STYLES.text,
        text: 'Text',
        level: 'normal'
    },
    table: {
        style: DEFAULT_STYLES.table,
        size: 'middle',
        bordered: true,
        showHeader: true,
        pagination: { pageSize: 10 }
    },
    gauge: {
        style: DEFAULT_STYLES.gauge,
        text: 'Gauge Title'
    },
    card: {
        style: DEFAULT_STYLES.card,
        title: 'Card Title'
    },
    bar: {
        style: DEFAULT_STYLES.bar,
        text: 'Bar Chart'
    },
    line: {
        style: DEFAULT_STYLES.line,
        text: 'Line Chart'
    },
    form: {
        style: DEFAULT_STYLES.form,
        formFields: [
            {
                type: 'text',
                label: 'Name',
                name: 'name',
                required: true,
                placeholder: 'Enter your name'
            }
        ]
    },
    textInput: {
        style: DEFAULT_STYLES.textInput,
        placeholder: 'Enter text'
    },
    browse: {
        style: DEFAULT_STYLES.browse,
        placeholder: 'Enter text'
    }
} as const; 