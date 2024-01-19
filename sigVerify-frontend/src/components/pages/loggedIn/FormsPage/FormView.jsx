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
    padding: 0px 10px;
    z-index: 10;
`;

const FormsHeader = styled.div`
    width: 100%;
    padding: 20px 5vw;

    h1 {
        font-size: 1.5em;
        margin-bottom: 0px;
        margin-top: 4vh;
    }
`;

const FormSelect = styled.div`
    width: 100%;
    padding: 20px 5vw;
`;

function FormsPage() {
    const [selectedForm, setSelectedForm] = useState('');

    const handleSelectChange = (event) => {
        setSelectedForm(event.target.value);
    };

    const formData = {
        patientName: 'david rutledge',
        practiceName: 'Place of Practice',
        signature: 'david rutledge',
        date: '01-02-2024',
        parentSignature: '',
    };

    const renderForm = () => {
        switch (selectedForm) {
            case 'consentToTreat':
                return <ConsentToTreatFormViewer formData={formData} />;
            case 'releaseOfMedicalHistory':
                return <ReleaseOfMedicalHistory />;
            // case 'patientHistory':
            //     return <PatientHistoryForm />;
            default:
                return <div>Select a form to display</div>;
        }
    };

    return (
        <OutterFormsContainer>
            <FormsHeader>
                <h2>Form Templates</h2>
            </FormsHeader>
            <FormSelect>
                <select onChange={handleSelectChange} value={selectedForm}>
                    <option value="">Select a Form</option>
                    <option value="consentToTreat">Consent to Treat</option>
                    <option value="releaseOfMedicalHistory">Release of Medical Records</option>
                    {/* <option value="patientHistory">Patient History</option> */}
                </select>
            </FormSelect>

            {renderForm()}
        </OutterFormsContainer>
    );
}

export default FormsPage;
