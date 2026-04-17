import React from 'react';

// AdminTrigger ya no necesita lógica de login oculta.
// Se conserva funcionalmente en caso de que alguna vista dependa estructuralmente de la etiqueta.
const AdminTrigger = ({ children }) => {
    return (
        <div style={{ display: 'inline-block' }}>
            {children}
        </div>
    );
};

export default AdminTrigger;
