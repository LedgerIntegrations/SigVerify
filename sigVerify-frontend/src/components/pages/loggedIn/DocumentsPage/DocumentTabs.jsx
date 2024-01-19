import { useState } from 'react';

const DocumentTabs = ({ documents }) => {
    const [activeTab, setActiveTab] = useState('received');

    const getFilteredDocuments = () => {
        return documents.filter((doc) => (activeTab === 'received' ? doc.isReceived : !doc.isReceived));
    };

    return (
        <div>
            <div>
                <button onClick={() => setActiveTab('received')} className={activeTab === 'received' ? 'active' : ''}>
                    Received
                </button>
                <button onClick={() => setActiveTab('sent')} className={activeTab === 'sent' ? 'active' : ''}>
                    Sent
                </button>
            </div>
            <div>
                <ul>
                    {getFilteredDocuments().length === 0 ? (
                        <li>No documents found.</li>
                    ) : (
                        getFilteredDocuments().map((doc, index) => (
                            <li key={index}>
                                <em>{doc.title}</em>
                                <em>{doc.signed}</em>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default DocumentTabs;
