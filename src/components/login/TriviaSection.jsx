import React, { useState } from 'react';

// Datos de trivia separados aquí porque son datos de configuración,
// no lógica de UI — podrían moverse en el futuro a src/config/triviaData.js
const quizPreguntas = [
    {
        pregunta: '¿Cuál es el color favorito de Paulina?',
        opciones: ['Rojo', 'Rosa', 'Azul marino', 'Verde'],
        correcta: 1
    },
    {
        pregunta: '¿Cuál es el día de la semana favorito de Paulina?',
        opciones: ['Lunes', 'Sábado', 'Miércoles', 'Viernes'],
        correcta: 1
    },
    {
        pregunta: '¿Cuál es la comida favorita de Paulina?',
        opciones: ['Pizza', 'Sushi', 'Hamburguesa', 'Pasta'],
        correcta: 1
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
        backgroundColor: 'rgba(100, 40, 70, 0.6)',
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
        backgroundColor: 'rgba(141, 90, 115, 0.5)',
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
        backgroundColor: 'rgba(201, 127, 163, 0.5)',
        border: '1px solid #c97fa3',
        fontWeight: '700',
    },
    triviaSiguienteBtn: {
        backgroundColor: '#c97fa3',
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
        marginBottom: '20px',
    },
};

export default TriviaSection;
