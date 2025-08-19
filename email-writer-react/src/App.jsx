import React, { useState } from 'react';

/**
 * Custom React hook to handle copying text to the clipboard.
 * It uses a fallback method because navigator.clipboard can be restricted in iframes.
 * @returns {object} An object containing a `copy` function and a `isCopied` boolean state.
 */
const useCopyToClipboard = () => {
    const [isCopied, setIsCopied] = useState(false);

    const copy = (textToCopy) => {
        try {
            // Fallback for environments where navigator.clipboard is not available or fails
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            // Make the textarea non-editable and invisible
            textArea.style.position = 'fixed';
            textArea.style.top = 0;
            textArea.style.left = 0;
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = 0;
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            document.execCommand('copy');

            document.body.removeChild(textArea);
            setIsCopied(true);

            setTimeout(() => setIsCopied(false), 2500); // Reset copied state after 2.5 seconds
        } catch (err) {
            console.error('Failed to copy text:', err);
            setIsCopied(false);
        }
    };

    return { copy, isCopied };
};

// Main App component
const App = () => {
    // State for the email content input
    const [emailContent, setEmailContent] = useState('');
    // State for the selected tone
    const [tone, setTone] = useState('formal');
    // State for the generated email response from the API
    const [generatedEmail, setGeneratedEmail] = useState('');
    // State for loading indicator during API call
    const [isLoading, setIsLoading] = useState(false);
    // State for displaying an error message
    const [error, setError] = useState('');

    // Use the custom hook for clipboard functionality
    const { copy, isCopied } = useCopyToClipboard();

    /**
     * Handles the API call to generate the email content using the local API.
     * This function is asynchronous and uses a try/catch block for error handling.
     */
    const handleGenerateEmail = async () => {
        setGeneratedEmail('');
        setError('');
        setIsLoading(true);

        try {
            // Make the API call to the local endpoint
            const response = await fetch('http://localhost:9090/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent,
                    tone,
                }),
            });

            // Check if the response is successful
            if (!response.ok) {
                let errorMessage = `HTTP error! Status: ${response.status}`;
                try {
                    // Try to get a more specific error message from the response body
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // Response body might not be JSON, so we fall back to the status
                }
                throw new Error(errorMessage);
            }

            // Parse the response as text, as specified in the example
            const data = await response.text();
            // Update the state with the generated email
            setGeneratedEmail(data);

        } catch (err) {
            // Set the error message if the API call fails
            console.error('Failed to generate email:', err);
            setError('Failed to generate email. Please check your network and ensure the local API is running.');
        } finally {
            // Hide the loading indicator
            setIsLoading(false);
        }
    };

    /**
     * Handles the click event for the "Copy Output" button.
     */
    const handleCopyClick = () => {
        if (generatedEmail) {
            copy(generatedEmail);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Email Generator</h1>

                {/* Input and tone selection form */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label htmlFor="emailContent" className="block text-gray-700 font-medium mb-1">Email Content</label>
                        <textarea
                            id="emailContent"
                            value={emailContent}
                            onChange={(e) => setEmailContent(e.target.value)}
                            rows="6"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
                            placeholder="Enter the main points of your email here..."
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="tone" className="block text-gray-700 font-medium mb-1">Select Tone</label>
                        <select
                            id="tone"
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            <option value="formal">Formal</option>
                            <option value="casual">Casual</option>
                            <option value="friendly">Friendly</option>
                            <option value="professional">Professional</option>
                            <option value="persuasive">Persuasive</option>
                        </select>
                    </div>
                </div>

                {/* Generate button */}
                <button
                    onClick={handleGenerateEmail}
                    className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                    disabled={isLoading || !emailContent}
                >
                    {isLoading ? 'Generating...' : 'Generate Email'}
                </button>

                {/* Display error message */}
                {error && (
                    <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                        <p>{error}</p>
                    </div>
                )}

                {/* Display area for API response */}
                {generatedEmail && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Generated Output</h2>
                        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
                            <p className="text-gray-700 whitespace-pre-wrap">{generatedEmail}</p>
                        </div>

                        {/* Copy button */}
                        <button
                            onClick={handleCopyClick}
                            className="mt-4 w-full p-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                        >
                            {isCopied ? 'Copied!' : 'Copy Output'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default App;
