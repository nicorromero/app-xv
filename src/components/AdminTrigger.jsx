import React, { useState } from 'react';

const AdminTrigger = ({ children, onUnlock, password = "nicor04" }) => {
    const [clickCount, setClickCount] = useState(0);

    const handleClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount >= 3) {
            setClickCount(0); // Reset for next time
            const attempt = window.prompt("Ingresá la contraseña de administrador:");
            if (attempt === password) {
                onUnlock();
            } else if (attempt !== null) {
                alert("Contraseña incorrecta.");
            }
        }
    };

    return (
        <div 
            onClick={handleClick} 
            style={{ display: 'inline-block', cursor: 'default' }} // cursor normal para no delatar
            title=""
        >
            {children}
        </div>
    );
};

export default AdminTrigger;
