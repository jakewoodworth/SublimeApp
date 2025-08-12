import React, { useState, useEffect } from 'react';
import QuestCard from './QuestCard';
import { StarIcon, XMarkIcon } from './IconComponents';
import type { Quest } from '../types';

interface BreathingExerciseProps {
    quest: Quest;
    onComplete: (questId: string) => void;
    onClose: () => void;
}

const PHASES = [
    { name: 'Breathe In', duration: 4 },
    { name: 'Hold', duration: 4 },
    { name: 'Breathe Out', duration: 6 },
];
const TOTAL_REPS = 5;

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ quest, onComplete, onClose }) => {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [countdown, setCountdown] = useState(PHASES[0].duration);
    const [reps, setReps] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (isFinished) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev > 1) {
                    return prev - 1;
                }

                // Move to next phase
                const nextPhaseIndex = (phaseIndex + 1) % PHASES.length;
                setPhaseIndex(nextPhaseIndex);

                if (nextPhaseIndex === 0) {
                    setReps(currentReps => {
                        if (currentReps + 1 >= TOTAL_REPS) {
                            setIsFinished(true);
                            clearInterval(timer);
                        }
                        return currentReps + 1;
                    });
                }

                return PHASES[nextPhaseIndex].duration;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isFinished, phaseIndex]);
    
    const currentPhase = PHASES[phaseIndex];
    const scale = currentPhase.name === 'Breathe In' ? 1.5 : (currentPhase.name === 'Hold' ? 1.5 : 1);

    return (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-lg flex flex-col justify-center items-center z-50 p-4 text-white">
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                <XMarkIcon className="w-8 h-8"/>
            </button>
            
            <div className="text-center">
                <h2 className="font-orbitron text-2xl sm:text-3xl md:text-4xl text-cyan-300 mb-4">{quest.title}</h2>
                <p className="text-base md:text-lg text-gray-400 max-w-xl mx-auto">{quest.description}</p>
            </div>
            
            <div className="flex-grow flex flex-col justify-center items-center w-full">
                {isFinished ? (
                    <QuestCard className="text-center">
                        <h3 className="text-3xl font-bold text-green-300 mb-4">Quest Complete!</h3>
                        <p className="text-gray-300 mb-6">You've successfully reset your focus.</p>
                        <button 
                            onClick={() => onComplete(quest.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-all text-lg flex items-center gap-2 mx-auto"
                        >
                            Claim Reward
                            <div className="flex items-center gap-1 font-semibold text-yellow-300">
                                <StarIcon className="w-5 h-5" />
                                <span>+{quest.reward} SP</span>
                            </div>
                        </button>
                    </QuestCard>
                ) : (
                    <>
                        <div className="relative w-56 h-56 md:w-64 md:h-64 flex justify-center items-center mb-8">
                            <div 
                                className="absolute w-full h-full bg-cyan-500/20 rounded-full transition-transform duration-[3000ms] ease-in-out"
                                style={{ transform: `scale(${scale})` }}
                            ></div>
                            <div 
                                className="absolute w-2/3 h-2/3 bg-cyan-500/30 rounded-full transition-transform duration-[3000ms] ease-in-out"
                                style={{ transform: `scale(${scale * 0.9})` }}
                            ></div>
                            <span className="font-orbitron text-6xl md:text-7xl font-bold z-10">{countdown}</span>
                        </div>
                        <p className="font-orbitron text-3xl md:text-4xl tracking-widest">{currentPhase.name}</p>
                        <p className="text-gray-400 text-base md:text-lg mt-4">Repetition: {reps + 1} / {TOTAL_REPS}</p>
                    </>
                )}
            </div>

            <div className="w-full max-w-2xl px-4 pb-4">
                 <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${((reps + 1) / TOTAL_REPS) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default BreathingExercise;
