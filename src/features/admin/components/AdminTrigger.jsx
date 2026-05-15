import React from 'react';

// Se conserva como wrapper estructural para vistas que lo importan.
const AdminTrigger = ({ children }) => {
    return (
        <div style={{ display: 'block', width: '100%' }}>
            {children}
        </div>
    );
};

export default AdminTrigger;
