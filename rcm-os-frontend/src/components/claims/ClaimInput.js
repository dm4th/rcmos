// Context Imports
import { useSupaUser } from '@/contexts/SupaAuthProvider';
import React, { useState, useEffect } from 'react';

export function ClaimInput({ handleSubmit }) {

    // Get Supabase User context
    const { user, availableClaims, supabaseClient } = useSupaUser();

    // Set up state for the form
    const [claim, setClaim] = useState('');
    const [titleError, setTitleError] = useState('');
    const [denialLetters, setDenialLetters] = useState([]);
    const [selectedDenialLetter, setSelectedDenialLetter] = useState(null);
    const [uploadedDenialLetter, setUploadedDenialLetter] = useState(null);

    // Handle input change
    const handleTitleChange = (e) => {
        setClaim(e.target.value);
    };

    // Handle form submission
    const handleCreateClaim = () => {
        if (claim.length < 1) {
            setTitleError('Please enter a title for your claim');
        } else if (titleError.length === 0 && uploadError.length === 0) {
            handleSubmit(claim, selectedDenialLetter, uploadedDenialLetter);
        }
    };

    useEffect(() => {
        const fetchDenialLetters = async () => {
            const { data, error } = await supabaseClient
                .from('denial_letters')
                .select('id, file_name')
                .eq('user_id', user.id);
            if (error) {
                console.error(error);
            } else {
                setDenialLetters(data);
            }
        };
        fetchDenialLetters();
    }, []);

    useEffect(() => {
        if (availableClaims.some((c) => c.title === claim)) {
            setTitleError('You already have a claim with this title');
        } else setTitleError('');
    }, [claim]);

    useEffect(() => {
        if (uploadedDenialLetter) {
            setSelectedDenialLetter(null);
        }
    }, [uploadedDenialLetter]);

    useEffect(() => {
        if (selectedDenialLetter) {
            setUploadedDenialLetter(null);
        }
    }, [selectedDenialLetter]);

    return (
        <div className="flex flex-col justify-between m-2 ">
            <h3 className="text-lg font-bold mb-2">Create a New Claim Appeal</h3>
            <div className="border-b border-gray-400 dark:border-gray-600 w-full self-center"></div>
            <div className='flex flex-col justify-between m-1 py-2'>
                <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="title">
                    Claim Appeal Title
                </label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 mb-1 text-gray-900 leading-tight focus:ring-2 focus:shadow-outline" id="claim" type="text" value={claim} onChange={handleTitleChange} />
                <p className="text-gray-600 dark:text-gray-400 text-xs italic">A unique title for your new claim appeal</p>
                {titleError.length > 0 && <p className="text-red-500 text-xs italic">{titleError}</p>}
            </div>
            <div className="border-b border-gray-400 dark:border-gray-600 w-full self-center"></div>
            {denialLetters.length > 0 && (
            <div className='flex flex-col justify-between m-1 py-2'>
                <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="file-list">
                    Select Pre-Processed Denial Letter
                </label>
                <select className="shadow appearance-none border rounded w-full py-2 px-3 mb-1 text-gray-900 leading-tight focus:ring-2 focus:shadow-outline" id="file-list" value={selectedDenialLetter} onChange={(e) => setSelectedDenialLetter(e.target.value)}>
                    {denialLetters.map((file) => (
                        <option key={file.id} value={file.id}>{file.name}</option>
                    ))}
                </select>
            </div>
            )}
            {denialLetters.length > 0 && (
                <>
                    <div className="border-b border-gray-400 dark:border-gray-600 w-1/3 self-center"></div>
                    <p className="text-gray-400 dark:text-gray-600 text-xs italic w-1/3 self-center">or</p>
                    <div className="border-b border-gray-400 dark:border-gray-600 w-1/3 self-center"></div>
                </>
            )}
            <div className='flex flex-col justify-between m-1 py-2'>
                <div className="flex items-center justify-center">
                    <label 
                        className="w-64 flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-700 dark:shadow-none"
                        onDrop={setUploadedDenialLetter}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M17 10h-4V0H7v10H3l7 7 7-7z" />
                        </svg>
                        <span className="mt-2 text-base leading-normal">Upload Denial Letter</span>
                        <input type='file' className="hidden" onChange={setUploadedDenialLetter} />
                    </label>
                </div>
            </div>
            <button className="mt-2 bg-blue-500 hover:bg-blue-200 dark:hover:bg-blue-800 text-gray-900 dark:text-gray-100 font-bold py-2 px-4 rounded" onClick={handleCreateClaim}>
                Create Claim Appeal
            </button>
        </div>
    );
};

