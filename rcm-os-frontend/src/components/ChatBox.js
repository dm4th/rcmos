import React, { useState, useRef, useEffect } from 'react';

export function ChatBox ({ onUserInput }) {
    const [userInput, setUserInput] = useState('');
    const textareaRef = useRef(null);

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleUserInput(event);
        } else {
            resizeTextarea();
        }
    };

    const handleChange = (event) => {
        setUserInput(event.target.value);
        resizeTextarea();
    };

    const resizeTextarea = () => {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    };

    const handleUserInput = async (event) => {
        event.preventDefault();
        onUserInput(userInput);
        setUserInput('');
        textareaRef.current.style.height = 'auto';
    };

    useEffect(() => {
        resizeTextarea();
    }, []);

    return (
        <div className="w-full p-4 border border-gray-800 dark:border-gray-300 bg-gray-100 dark:bg-gray-800">
            <div className="relative">
                <form onSubmit={handleUserInput} className="flex items-center">
                    <textarea
                        ref={textareaRef}
                        className="w-full p-2 border-2 border-gray-700 dark:border-gray-400 bg-white dark:bg-gray-900 rounded-l-md pl-3 pr-1 resize-none overflow-hidden focus:border-gray-600"
                        value={userInput}
                        onKeyDown={handleKeyDown}
                        onChange={handleChange}
                        placeholder="..."
                        rows="1"
                        style={{ whiteSpace: 'pre-wrap' }}
                    />
                    <button type="submit" className="absolute bottom-1 right-[-0.5rem] bg-transparent border-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-gray-800 dark:text-gray-200">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};
