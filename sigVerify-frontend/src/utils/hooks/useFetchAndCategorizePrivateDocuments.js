import { useState, useEffect, useCallback } from 'react';
import { fetchUserPrivateDocuments } from '../httpRequests/routes/documents';
import { getSignaturesStatusForDoc } from '../httpRequests/routes/signatures';

function useFetchAndCategorizePrivateDocuments(accountObject) {
    const [documents, setDocuments] = useState({
        received: [],
        sent: [],
        uploaded: [],
        completed: [],
        error: null,
    });

    const fetchAndCategorize = useCallback(async () => {
        try {
            const privateDocumentsResponse = await fetchUserPrivateDocuments();
            if (!privateDocumentsResponse.data.success) {
                setDocuments((prev) => ({ ...prev, error: 'Failed to fetch documents' }));
                return;
            }
            const allUsersPrivateDocuments = privateDocumentsResponse.data.documents;

            // fetch and attach signature status of each document to document object
            const documentsWithStatus = await Promise.all(
                allUsersPrivateDocuments.map(async (document) => {
                    try {
                        const { data: signatureStatus } = await getSignaturesStatusForDoc(document.id);
                        return { ...document, signatureStatus };
                    } catch (error) {
                        console.error('Error fetching signature status for document:', document.id, error);
                        return { ...document, signatureStatus: { error: 'Failed to fetch status' } };
                    }
                })
            );

            console.log('documentsWithStatus: ', documentsWithStatus);

            setDocuments({
                uploaded: documentsWithStatus.filter((doc) => doc.user_profile_id === accountObject.profile_id && doc.can_add_access),
                sent: documentsWithStatus.filter((doc) => doc.user_profile_id === accountObject.profile_id && !doc.can_add_access),
                received: documentsWithStatus.filter(
                    (doc) =>
                        doc.user_profile_id !== accountObject.profile_id &&
                        !doc.can_add_access &&
                        doc.signatureStatus.signatureStatus !== 'complete'
                ),
                completed: documentsWithStatus.filter((doc) => !doc.can_add_access && doc.signatureStatus.signatureStatus === 'complete'),
                error: null,
            });
        } catch (error) {
            setDocuments((prev) => ({ ...prev, error: 'Error fetching documents' }));
        }
    }, []);

    useEffect(() => {
        fetchAndCategorize();
    }, [fetchAndCategorize]);

    return { ...documents, refresh: fetchAndCategorize };
}

export default useFetchAndCategorizePrivateDocuments;
