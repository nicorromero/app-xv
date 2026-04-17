import React, { useState } from 'react';

// Datos de trivia separados aquí porque son datos de configuración,
// no lógica de UI — podrían moverse en el futuro a src/config/triviaData.js
const quizPreguntas = [
    {
        pregunta: '¿Cuál es el color favorito de Marti?',
        opciones: ['Turquesa', 'Rosa', 'Azul', 'Verde'],
        correcta: 'Azul'
    },
    {
        pregunta: '¿Cuando empezó a bailar Marti?',
        opciones: ['a los 5 años', 'a los 2 años', 'a los 3 años', 'a los 8 años'],
        correcta: 'a los 3 años'
    },
    {
        pregunta: '¿Cuál es la comida favorita de Marti?',
        opciones: ['Milanesas con papas', 'Canelones', 'Hamburguesas', 'Pastas'],
        correcta: 'Pastas'
    }
];

/**
 * TriviaSection — Quiz interactivo de ¿Cuánto me conocés?
 * Maneja su propio estado interno (paso, respuestas seleccionadas).
 */
const TriviaSection = () => {
    const [quizStep, setQuizStep] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [quizSelected, setQuizSelected] = useState(null);

    const handleNext = () => {
        setQuizAnswers(prev => [...prev, quizSelected]);
        setQuizSelected(null);
        setQuizStep(prev => prev + 1);
    };

    const handleReset = () => {
        setQuizStep(0);
        setQuizAnswers([]);
        setQuizSelected(null);
    };

    const isLastQuestion = quizStep === quizPreguntas.length - 1;
    const isFinished = quizStep >= quizPreguntas.length;

    return (
        <div style={styles.sectionTrivia}>
            <p style={styles.triviaTitle}>¿Cuánto me conocés?</p>

            {!isFinished ? (
                <div style={styles.triviaCard}>
                    <p style={styles.triviaPasoLabel}>
                        {quizStep + 1} de {quizPreguntas.length}
                    </p>
                    <p style={styles.triviaPregunta}>
                        {quizPreguntas[quizStep].pregunta}
                    </p>
                    <div style={styles.triviaOpciones}>
                        {quizPreguntas[quizStep].opciones.map((op, i) => (
                            <button
                                key={i}
                                style={{
                                    ...styles.triviaOpcionBtn,
                                    ...(quizSelected === i ? styles.triviaOpcionSeleccionada : {})
                                }}
                                onClick={() => setQuizSelected(i)}
                            >
                                {op}
                            </button>
                        ))}
                    </div>
                    <button
                        style={{ ...styles.triviaSiguienteBtn, opacity: quizSelected === null ? 0.4 : 1 }}
                        disabled={quizSelected === null}
                        onClick={handleNext}
                    >
                        {isLastQuestion ? 'Ver resultados' : 'Siguiente →'}
                    </button>
                </div>
            ) : (
                <div style={styles.triviaCard}>
                    <p style={styles.triviaResultadoTitulo}>¡Trivia completada!</p>
                    <p style={styles.triviaScore}>
                        {quizAnswers.filter((resp, idx) => resp === quizPreguntas[idx].opciones.indexOf(quizPreguntas[idx].correcta)).length} / {quizPreguntas.length} correctas
                    </p>
                    <button style={styles.triviaSiguienteBtn} onClick={handleReset}>
                        Volver a jugar
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    sectionTrivia: {
        backgroundColor: 'rgba(25, 55, 85, 0.6)',
        padding: '40px 25px',
        textAlign: 'center',
    },
    triviaTitle: {
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '1px',
        marginBottom: '20px',
    },
    triviaCard: {
        backgroundColor: 'rgba(70, 130, 180, 0.5)',
        borderRadius: '16px',
        padding: '25px 20px',
        backdropFilter: 'blur(8px)',
    },
    triviaPasoLabel: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: '1px',
        marginBottom: '10px',
    },
    triviaPregunta: {
        fontSize: '17px',
        fontWeight: '600',
        marginBottom: '20px',
        lineHeight: '1.4',
    },
    triviaOpciones: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px',
    },
    triviaOpcionBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '10px',
        color: '#FFFFFF',
        padding: '12px 16px',
        fontSize: '15px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        fontFamily: "'Montserrat', sans-serif",
    },
    triviaOpcionSeleccionada: {
        backgroundColor: 'rgba(74, 144, 217, 0.5)',
        border: '1px solid #4A90D9',
        fontWeight: '700',
    },
    triviaSiguienteBtn: {
        backgroundColor: '#4A90D9',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '20px',
        padding: '12px 30px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '5px',
        fontFamily: "'Montserrat', sans-serif",
    },
    triviaResultadoTitulo: {
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '10px',
    },
    triviaScore: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#4A90D9',
        marginBottom: '20px',
    },
};

export default TriviaSection;
