// src/context/AuthModalProvider.jsx
import React, { useState } from 'react';
import { AuthModalContext } from './AuthModalContext';
import { AuthModal } from '../components/AuthModal';

export function AuthModalProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('login');

    const openAuthModal = (initialMode = 'login') => {
        setMode(initialMode);
        setIsOpen(true);
    };

    const closeAuthModal = () => setIsOpen(false);

    return (
        <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isOpen }}>
            {children}
            <AuthModal
                key={`${isOpen}-${mode}`}
                isOpen={isOpen}
                mode={mode}
                setMode={setMode}
                onClose={closeAuthModal}
            />
        </AuthModalContext.Provider>
    );
}