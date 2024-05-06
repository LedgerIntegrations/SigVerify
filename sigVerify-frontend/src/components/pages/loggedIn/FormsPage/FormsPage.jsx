import { useState } from 'react';
import styled from 'styled-components';
import ConsentToTreatForm from './FormComponents/ConsentToTreatForm';
import ReleaseOfMedicalHistory from './FormComponents/ReleaseOfMedicalHistory';
import ConsentToTreatFormViewer from './FormViewer/ConsentToTreatForm';
const OutterFormsContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: start;
    width: 100%;
    padding: 0px 00px;
    z-index: 10;
`;

const FormsHeader = styled.div`
    width: 100%;
    max-width: 600px;
    padding: 20px 0vw;

    h1 {
        font-size: 1.5em;
        margin-bottom: 0px;
        margin-top: 4vh;
    }
`;

const FormTypesNav = styled.div`
    width: 100%;
    max-width: 600px;
    margin: 20px 5vw;
    margin-bottom: 0px;
`;

const Button = styled.button`
    height: 40px;
    width: 140px;
    border: none;
    border-radius: 10px 10px 0px 0px;
    border: none;
    margin-right: 2px;
    background-color: white;

    /* Conditional styling based on the clicked prop */
    box-shadow: ${(props) =>
        props.clicked
            ? 'inset 2px 2px 3px 0px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1), 0px 0px 0px 0px rgba(0, 0, 0, 0.1)'
            : 'none'};
`;

const FormsList = styled.ul`
    width: 100%;
    max-width: 600px;
    background-color: white;
    padding: 20px 3vw;
    margin-top: 0px;
    list-style: none;
    border: none;
    border-radius: 0px 10px 10px 10px;
    min-height: 200px;
    overflow-y: auto;
    box-shadow: inset 2px 1px 4px 0px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1),
        0px 0px 0px 0px rgba(0, 0, 0, 0.1);

    h3 {
        margin-left: 10px;
    }
`;

const FormListItem = styled.li`
    cursor: pointer;
    border: none;
    background-color: #ffffff;
    border: 0.5px solid #c1c1c1;
    padding: 6px 2px;
    margin-block: 3px;
    border-radius: 3px;
    font-size: 80%;
    box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1),
        2px 2px 2px 0px rgba(0, 0, 0, 0.1);

    &:hover {
        box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1),
            0px 0px 0px 0px rgba(0, 0, 0, 0.1);
    }
`;

const FormListItemContents = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0px 10px;
`;

const RenderedFormContainer = styled.div`
    width: 100%;
    max-width: 700px;
`;

function FormsPage() {
    const [selectedForm, setSelectedForm] = useState('');
    const [selectedFormType, setSelectedFormType] = useState(null);
    const [viewMode, setViewMode] = useState('create'); // 'create' or 'view'

    const handleFormTypeClick = (formType) => {
        setSelectedFormType(formType);
        setViewMode(formType);
    };
    // Example form templates
    // manages the different document form component to render
    const formTemplates = [
        { id: '1', type: 'consentToTreat' },
        { id: '2', type: 'releaseOfMedicalHistory' },
        // Add more form templates as needed
    ];

    // Example completed forms (this will be loaded from backend/API on page load in a useEffect)
    const completedForms = [
        {
            id: '1',
            type: 'consentToTreat',
            status: 'completed',
            xrplSigner: 'rUBCFsgC2cMueUh8sNFA9KsSbzYoUnbUk8',
            xrplSignatureHash: '2AE3645A4DFB3DA7EED00E5F7814162FD4E864BA0A91D2F9833C9C21CB8D2321',
            formData: {
                patientName: 'David Rutledge',
                practiceName: 'Walden Dental',
                parentSignature: false,
                parentName: '',
                date: '01-02-2024',
                recipient: 'office1@gmail.com',
            },
        },
        {
            id: '2',
            type: 'consentToTreat',
            status: 'completed',
            xrplSigner: 'rUBCFsgC2cMueUh8sNFA9KsSbzYoUnbUk8',
            xrplSignatureHash: '2AE3645A4DFB3DA7EED00E5F7814162FD4E864BA0A91D2F9833C9C21CB8D2321',
            formData: {
                patientName: 'David Ruthledge',
                parentName: 'Roger Ruthledge',
                practiceName: 'Doc In The Box',
                date: '01-02-2024',
                parentSignature: true,
                recipient: 'office2@gmail.com',
            },
        },
        // Add more completed forms as needed
    ];

    const renderFormList = () => {
        const forms = viewMode === 'create' ? formTemplates : completedForms;
        return forms.map((form) => (
            <FormListItem key={form.id} onClick={() => setSelectedForm(form.id)}>
                {/* {form.type === 'consentToTreat' ? 'Consent to Treat' : null}
                {form.type === 'releaseOfMedicalHistory' ? 'Release of Medical History' : null} */}
                {viewMode === 'create' ? (
                    <FormListItemContents>
                        {form.type === 'consentToTreat' ? 'Consent to Treat' : null}
                        {form.type === 'releaseOfMedicalHistory' ? 'Release of Medical History' : null}
                    </FormListItemContents>
                ) : (
                    <FormListItemContents>
                        <strong>
                            {form.type === 'consentToTreat' ? 'Consent to Treat' : null}
                            {form.type === 'releaseOfMedicalHistory' ? 'Release of Medical History' : null}
                        </strong>
                        <strong>{form.formData.practiceName}</strong>
                        <strong>{form.status}</strong>
                    </FormListItemContents>
                )}
            </FormListItem>
        ));
    };

    // const formData = {
    //     patientName: 'david rutledge',
    //     practiceName: 'Place of Practice',
    //     signature: 'david rutledge',
    //     date: '01-02-2024',
    //     parentSignature: '',
    // };

    const renderForm = () => {
        if (viewMode === 'create') {
            switch (selectedForm) {
                case '1':
                    return <ConsentToTreatForm />;
                case '2':
                    return <ReleaseOfMedicalHistory />;
                // Add more cases for other form types
                default:
                    return <div style={{ textAlign: 'center' }}>Select a form to create</div>;
            }
        } else {
            // Here, render the form viewer for the selected completed form
            const form = completedForms.find((f) => f.id === selectedForm);
            if (form) {
                return <ConsentToTreatFormViewer form={form} />;
            }
            return <div style={{ textAlign: 'center' }}>Select a completed form to view</div>;
        }
    };

    return (
        <OutterFormsContainer>
            <FormsHeader>
                <h2>Form Templates (Under Development...)</h2>
            </FormsHeader>
            <FormTypesNav>
                <Button clicked={selectedFormType === 'create'} onClick={() => handleFormTypeClick('create')}>
                    Create Forms
                </Button>
                <Button clicked={selectedFormType === 'view'} onClick={() => handleFormTypeClick('view')}>
                    View Forms
                </Button>
            </FormTypesNav>
            <FormsList>
                <h3>{viewMode} forms</h3>
                {renderFormList()}
            </FormsList>
            <RenderedFormContainer>{renderForm()}</RenderedFormContainer>
        </OutterFormsContainer>
    );
}

export default FormsPage;
