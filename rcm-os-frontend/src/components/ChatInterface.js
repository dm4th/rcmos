// React imports
import React, { useState, useEffect } from 'react';

// Networking Imports
import { fetchEventSource } from '@microsoft/fetch-event-source';

// Context Imports
import { useSupaUser } from '@/contexts/SupaAuthProvider';

// Component Imports
import { CitationViewer } from '@/components/CitationViewer';
import { ChatBox } from '@/components/ChatBox';
import { ChatHistory } from '@/components/ChatHistory';

export function ChatInterface({ }) {

    // Get Supabase User context
    const { user, doc, chat, supabaseClient } = useSupaUser();

    const [messages, setMessages] = useState([]);
    const [latestUserMessage, setLatestUserMessage] = useState('');
    const [latestResponse, setLatestResponse] = useState('');
    const [latestMessageId, setLatestMessageId] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const onUserInput = async (userPrompt) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                prompt: latestUserMessage,
                response: latestResponse,
                messageId: latestMessageId,
            }
        ]);
        setLatestUserMessage(userPrompt);
        setLatestResponse('');
        setLatestMessageId(null);

        // Send user input to backend
        const chatUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL + 'document-chat';
        const postData = JSON.stringify({
            prompt: userPrompt,
            chat_id: chat.id,
            record_id: doc.id,
            user_id: user.id,
        });
        await fetchEventSource(chatUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            },
            body: postData,
            onmessage: (event) => {
                const data = JSON.parse(event.data);
                if (data.history_id) {
                    setLatestMessageId(data.history_id);
                    setSelectedMessage(data.history_id);
                }
                if (data.token) {
                    setLatestResponse((t) => t + data.token);
                }
            }
        });
    }

    useEffect(() => {
        if (!chat) {
            setMessages([]);
            setLatestUserMessage('');
            setLatestResponse('');
            setLatestMessageId(null);
            setSelectedMessage(null);
            return;
        }

        const fetchMessages = async () => {
            const { data: messages, error } = await supabaseClient
                .from('document_chat_history')
                .select('*')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: false });
            if (error) {
                console.error(error);
                alert(error.message);
            } else {
                if (messages.length === 0) {
                    setMessages([]);
                    setLatestUserMessage('');
                    setLatestResponse('');
                    setLatestMessageId(null);
                    setSelectedMessage(null);
                }
                else {
                    const messageArray = messages.map((m) => {
                        return {
                            prompt: m.prompt,
                            response: m.response,
                            messageId: m.id
                        }
                    });
                    setMessages(messageArray.slice(1).reverse());
                    setLatestUserMessage(messages[0].prompt);
                    setLatestResponse(messages[0].response);
                    setLatestMessageId(messages[0].id);
                    setSelectedMessage(messages[0].id);
                }
            }
        }
        fetchMessages();
    }, [chat]);

    return (
        <div className="flex h-full w-full">
            <div className="flex flex-col w-2/5 h-full p-4 mt-4">
                <ChatBox onUserInput={onUserInput} />
                <div className="mt-4 overflow-auto">
                    <ChatHistory messages={messages} latestUserMessage={latestUserMessage} latestResponse={latestResponse} latestMessageId={latestMessageId} selectedMessage={selectedMessage} changeMessage={setSelectedMessage} />
                </div>
            </div>
            <div className="flex flex-col justify-center w-3/5 h-full">
                <CitationViewer selectedMessage={selectedMessage} />
            </div>
        </div>
    );
}