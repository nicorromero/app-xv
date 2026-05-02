import React, { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

/**
 * Decorative particle rain for the IDLE state of the projector.
 * Particle positions are memoized to avoid re-generation on parent re-renders.
 * Math.random() is intentional here: values are frozen by useMemo on mount.
 */
const LluviaEstrellas = () => {
    /* eslint-disable react-hooks/purity */
    const particles = useMemo(() =>
        Array.from({ length: 40 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
        })),
    []);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'none' }}>
            {particles.map(({ id, size, left, duration, delay }) => (
                <motion.div
                    key={id}
                    initial={{ y: '-10vh', x: `${left}vw`, opacity: 0 }}
                    animate={{ y: '110vh', opacity: [0, 1, 1, 0] }}
                    transition={{ duration, repeat: Infinity, delay, ease: 'linear' }}
                    style={{
                        position: 'absolute',
                        width: size,
                        height: size,
                        backgroundColor: '#FFD700',
                        borderRadius: '50%',
                        boxShadow: '0 0 8px #FFD700, 0 0 15px #FFD700',
                    }}
                />
            ))}
        </div>
    );
};

export default LluviaEstrellas;
