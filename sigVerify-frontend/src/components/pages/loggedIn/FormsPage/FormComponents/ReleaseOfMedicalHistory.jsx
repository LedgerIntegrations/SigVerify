import { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.form`
    background-color: white;
    padding: 40px 40px;
    margin: 10px;
    color: #606060;
    header {
        h1 {
            font-size: 22px;
            color: black;
        }

        em {
            font-size: 0.8em;
        }
    }

    h4 {
        color: black;
    }

    fieldset {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        font-size: 0.8em;
        margin-bottom: 20px;
    }

    @media (min-width: 540px) {
        // Styles for screens larger than 540px go here
        font-size: 0.8em;
    }
`;

const InformationApprovedForDisclosure = styled.div`
    fieldset {
        div {
            display: flex;
            justify-content: start;
            align-items: center;
            min-width: 160px;

            label {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 2px;
            }
        }
    }
`;

const RequiredInitalsSection = styled.div`
    fieldset {
        div {
            display: flex;
            justify-content: start;
            align-items: center;
            min-width: 100%;

            label {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 2px;
            }
        }
    }
`;

const RequiredSignatures = styled.div`
    fieldset {
        div {
            display: flex;
            justify-content: start;
            align-items: center;
            min-width: 100%;

            label {
              width: 100%;
                display: flex;
                justify-content: start;
                align-items: center;
                gap: 2px;
            }
        }
    }
`;

const SectionOne = styled.section`
    display: flex;
    flex-wrap: wrap;

    p {
        font-size: 0.8em;
    }

    @media (min-width: 902px) {
        // Styles for screens larger than 902px go here
    }
`;

const SectionTwo = styled.section`
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
`;

const SectionThree = styled.section`
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
`;

function ReleaseOfMedicalHistory() {
    const [formData, setFormData] = useState({
        reasonForDisclosure: '',
        effectiveTimeExpirationDate: '',
        patient: {
            lastName: '',
            firstName: '',
            middleName: '',
            dateOfBirth: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            phone: '',
            email: '',
        },
        authorizedToDisclose: {
            nameOfPersonOrOrganization: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            phone: '',
            fax: '',
        },
        authorizedToRecieve: {
            nameOfPersonOrOrganization: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            phone: '',
            fax: '',
        },
        informationApprovedForDisclosure: {
            allHealthInformation: false,
            historyPhysicalExam: false,
            pastPresentMedications: false,
            labResults: false,
            physiciansOrders: false,
            patientAllergies: false,
            operationReports: false,
            consultationReports: false,
            progressNotes: false,
            dischargeSummary: false,
            diagnosticTestReports: false,
            ekgCardiologyReports: false,
            pathologyReports: false,
            billingInformation: false,
            radiologyReportsAndImages: false,
            other: '',
        },
        requiredInitials: {
            mentalHealthRecordsExcludingPsychotherapyNotes: false,
            geneticInformationIncludingGeneticTestResults: false,
            drugAlcoholOrSubstanceAbuseRecords: false,
            hivAidsTestResultsTreatment: false,
        },
        requiredSignatures: {
            signatureOfIndividualOrIndividualsLegallyAuthorizedRepresentative: {
                signature: '',
                date: '',
            },
            signatureOfMinorIndividual: {
                signature: '',
                date: '',
            },
        },
    });

    const handleChange = (event) => {
        const { name, value, checked, type } = event.target;
        const keys = name.split('.');
        if (keys.length > 1) {
            setFormData((prevState) => ({
                ...prevState,
                [keys[0]]: {
                    ...prevState[keys[0]],
                    [keys[1]]: type === 'checkbox' ? checked : value,
                },
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(formData);
    };

    const renderTextInput = (label, name, value) => (
        <div>
            <label>{label}:</label>
            <br />
            <input type="text" name={name} value={value} onChange={handleChange} />
        </div>
    );

    const renderDateInput = (label, name, value) => (
        <div>
            <label>{label}:</label>
            <br />
            <input style={{ minWidth: '131px' }} type="date" name={name} value={value} onChange={handleChange} />
        </div>
    );

    const renderCheckboxInput = (label, name, checked) => (
        <div>
            <label>
                <input type="checkbox" name={name} checked={checked} onChange={handleChange} />
                {label}
            </label>
        </div>
    );

    const renderSection = (title, fields) => (
        <fieldset>
            <legend>{title}</legend>
            {fields.map((field) =>
                field.type === 'text'
                    ? renderTextInput(field.label, field.name, field.value)
                    : renderCheckboxInput(field.label, field.name, field.value)
            )}
        </fieldset>
    );

    const renderPatientSection = () => (
        <fieldset>
            <legend>Patient Information</legend>
            {renderTextInput('Last Name', 'patient.lastName', formData.patient.lastName)}
            {renderTextInput('First Name', 'patient.firstName', formData.patient.firstName)}
            {renderTextInput('Middle Name', 'patient.middleName', formData.patient.middleName)}
            {renderDateInput('Date of Birth', 'patient.dateOfBirth', formData.patient.dateOfBirth)}
            {renderTextInput('Address', 'patient.address', formData.patient.address)}
            {renderTextInput('City', 'patient.city', formData.patient.city)}
            {renderTextInput('State', 'patient.state', formData.patient.state)}
            {renderTextInput('Zip Code', 'patient.zipCode', formData.patient.zipCode)}
            {renderTextInput('Phone', 'patient.phone', formData.patient.phone)}
            {renderTextInput('Email (Optional)', 'patient.email', formData.patient.email)}
        </fieldset>
    );

    const renderAuthorizedToDiscloseSection = () => {
        const fields = [
            {
                label: 'Person/Organization',
                name: 'authorizedToDisclose.nameOfPersonOrOrganization',
                value: formData.authorizedToDisclose.nameOfPersonOrOrganization,
                type: 'text',
            },
            {
                label: 'Address',
                name: 'authorizedToDisclose.address',
                value: formData.authorizedToDisclose.address,
                type: 'text',
            },
            {
                label: 'City',
                name: 'authorizedToDisclose.city',
                value: formData.authorizedToDisclose.city,
                type: 'text',
            },
            {
                label: 'State',
                name: 'authorizedToDisclose.state',
                value: formData.authorizedToDisclose.state,
                type: 'text',
            },
            {
                label: 'Zip Code',
                name: 'authorizedToDisclose.zipCode',
                value: formData.authorizedToDisclose.zipCode,
                type: 'text',
            },
            {
                label: 'Phone',
                name: 'authorizedToDisclose.phone',
                value: formData.authorizedToDisclose.phone,
                type: 'text',
            },
            { label: 'Fax', name: 'authorizedToDisclose.fax', value: formData.authorizedToDisclose.fax, type: 'text' },
        ];
        return renderSection('Authorized To Disclose', fields);
    };

    const renderAuthorizedToReceiveSection = () => {
        const fields = [
            {
                label: 'Person/Organization',
                name: 'authorizedToRecieve.nameOfPersonOrOrganization',
                value: formData.authorizedToRecieve.nameOfPersonOrOrganization,
                type: 'text',
            },
            {
                label: 'Address',
                name: 'authorizedToRecieve.address',
                value: formData.authorizedToRecieve.address,
                type: 'text',
            },
            { label: 'City', name: 'authorizedToRecieve.city', value: formData.authorizedToRecieve.city, type: 'text' },
            {
                label: 'State',
                name: 'authorizedToRecieve.state',
                value: formData.authorizedToRecieve.state,
                type: 'text',
            },
            {
                label: 'Zip Code',
                name: 'authorizedToRecieve.zipCode',
                value: formData.authorizedToRecieve.zipCode,
                type: 'text',
            },
            {
                label: 'Phone',
                name: 'authorizedToRecieve.phone',
                value: formData.authorizedToRecieve.phone,
                type: 'text',
            },
            { label: 'Fax', name: 'authorizedToRecieve.fax', value: formData.authorizedToRecieve.fax, type: 'text' },
        ];
        return renderSection('Authorized To Receive', fields);
    };

    const renderReasonForDisclosureSection = () => (
        <div>
            <label>Reason For Disclosure:</label>
            <select name="reasonForDisclosure" value={formData.reasonForDisclosure} onChange={handleChange}>
                <option value="">Select Reason</option>
                <option value="Treatment">Treatment/Continuing Medical Care</option>
                <option value="PersonalUse">Personal Use</option>
                <option value="Billing">Billing or Claims</option>
                <option value="Insurance">Insurance</option>
                <option value="LegalPurposes">Legal Purposes</option>
                <option value="DisabilityDetermination">Disability Determination</option>
                <option value="School">School</option>
                <option value="Employment">Employment</option>
                <option value="Other">Other</option>
            </select>
        </div>
    );

    const renderInformationApprovedForDisclosureSection = () => {
        const fields = [
            {
                label: 'All Health Information',
                name: 'informationApprovedForDisclosure.allHealthInformation',
                value: formData.informationApprovedForDisclosure.allHealthInformation,
                type: 'checkbox',
            },
            {
                label: 'History & Physical Exam',
                name: 'informationApprovedForDisclosure.historyPhysicalExam',
                value: formData.informationApprovedForDisclosure.historyPhysicalExam,
                type: 'checkbox',
            },
            {
                label: 'Past & Present Medications',
                name: 'informationApprovedForDisclosure.pastPresentMedications',
                value: formData.informationApprovedForDisclosure.pastPresentMedications,
                type: 'checkbox',
            },
            {
                label: 'Lab Results',
                name: 'informationApprovedForDisclosure.labResults',
                value: formData.informationApprovedForDisclosure.labResults,
                type: 'checkbox',
            },
            {
                label: 'Physician’s Orders',
                name: 'informationApprovedForDisclosure.physiciansOrders',
                value: formData.informationApprovedForDisclosure.physiciansOrders,
                type: 'checkbox',
            },
            {
                label: 'Patient Allergies',
                name: 'informationApprovedForDisclosure.patientAllergies',
                value: formData.informationApprovedForDisclosure.patientAllergies,
                type: 'checkbox',
            },
            {
                label: 'Operation Reports',
                name: 'informationApprovedForDisclosure.operationReports',
                value: formData.informationApprovedForDisclosure.operationReports,
                type: 'checkbox',
            },
            {
                label: 'Consultation Reports',
                name: 'informationApprovedForDisclosure.consultationReports',
                value: formData.informationApprovedForDisclosure.consultationReports,
                type: 'checkbox',
            },
            {
                label: 'Progress Notes',
                name: 'informationApprovedForDisclosure.progressNotes',
                value: formData.informationApprovedForDisclosure.progressNotes,
                type: 'checkbox',
            },
            {
                label: 'Discharge Summary',
                name: 'informationApprovedForDisclosure.dischargeSummary',
                value: formData.informationApprovedForDisclosure.dischargeSummary,
                type: 'checkbox',
            },
            {
                label: 'Diagnostic Test Reports',
                name: 'informationApprovedForDisclosure.diagnosticTestReports',
                value: formData.informationApprovedForDisclosure.diagnosticTestReports,
                type: 'checkbox',
            },
            {
                label: 'EKG/Cardiology Reports',
                name: 'informationApprovedForDisclosure.ekgCardiologyReports',
                value: formData.informationApprovedForDisclosure.ekgCardiologyReports,
                type: 'checkbox',
            },
            {
                label: 'Pathology Reports',
                name: 'informationApprovedForDisclosure.pathologyReports',
                value: formData.informationApprovedForDisclosure.pathologyReports,
                type: 'checkbox',
            },
            {
                label: 'Billing Information',
                name: 'informationApprovedForDisclosure.billingInformation',
                value: formData.informationApprovedForDisclosure.billingInformation,
                type: 'checkbox',
            },
            {
                label: 'Radiology Reports and Images',
                name: 'informationApprovedForDisclosure.radiologyReportsAndImages',
                value: formData.informationApprovedForDisclosure.radiologyReportsAndImages,
                type: 'checkbox',
            },
            {
                label: 'Other (specify)',
                name: 'informationApprovedForDisclosure.other',
                value: formData.informationApprovedForDisclosure.other,
                type: 'text',
            },
        ];
        return renderSection('Information Approved For Disclosure', fields);
    };

    const renderRequiredInitialsSection = () => {
        const fields = [
            {
                label: 'Mental Health Records Excluding Psychotherapy Notes',
                name: 'requiredInitials.mentalHealthRecordsExcludingPsychotherapyNotes',
                value: formData.requiredInitials.mentalHealthRecordsExcludingPsychotherapyNotes,
                type: 'checkbox',
            },
            {
                label: 'Genetic Information Including Genetic Test Results',
                name: 'requiredInitials.geneticInformationIncludingGeneticTestResults',
                value: formData.requiredInitials.geneticInformationIncludingGeneticTestResults,
                type: 'checkbox',
            },
            {
                label: 'Drug, Alcohol, or Substance Abuse Records',
                name: 'requiredInitials.drugAlcoholOrSubstanceAbuseRecords',
                value: formData.requiredInitials.drugAlcoholOrSubstanceAbuseRecords,
                type: 'checkbox',
            },
            {
                label: 'HIV/AIDS Test Results & Treatment',
                name: 'requiredInitials.hivAidsTestResultsTreatment',
                value: formData.requiredInitials.hivAidsTestResultsTreatment,
                type: 'checkbox',
            },
        ];
        return renderSection('Required Initials', fields);
    };

    const renderRequiredSignaturesSection = () => (
        <fieldset>
            <legend>Required Signatures</legend>
            {renderTextInput(
                'Signature of Individual or Legally Authorized Representative',
                'requiredSignatures.signatureOfIndividualOrIndividualsLegallyAuthorizedRepresentative.signature',
                formData.requiredSignatures.signatureOfIndividualOrIndividualsLegallyAuthorizedRepresentative.signature
            )}
            {renderDateInput(
                'Date',
                'requiredSignatures.signatureOfIndividualOrIndividualsLegallyAuthorizedRepresentative.date',
                formData.requiredSignatures.signatureOfIndividualOrIndividualsLegallyAuthorizedRepresentative.date
            )}
            {renderTextInput(
                'Signature of Minor Individual',
                'requiredSignatures.signatureOfMinorIndividual.signature',
                formData.requiredSignatures.signatureOfMinorIndividual.signature
            )}
            {renderDateInput(
                'Date',
                'requiredSignatures.signatureOfMinorIndividual.date',
                formData.requiredSignatures.signatureOfMinorIndividual.date
            )}
        </fieldset>
    );

    return (
        <FormContainer onSubmit={handleSubmit} className="medical-history-form">
            <header>
                <h1>AUTHORIZATION TO DISCLOSE PROTECTED HEALTH INFORMATION</h1>
                <em>Developed for Texas Health & Safety Code § 181.154(d) </em>
                <br />
                <em>effective June 2013</em>
            </header>
            <hr />
            <SectionOne>
                <p>
                    Please read this entire form before signing and complete all the sections that apply to your
                    decisions relating to the disclosure of protected health information. Covered entities as that term
                    is defined by HIPAA and Texas Health & Safety Code § 181.001 must obtain a signed authorization from
                    the individual or the individual’s legally authorized representative to electronically disclose that
                    individual’s protected health information. Authorization is not required for disclosures related to
                    treatment, payment, health care operations, performing certain insurance functions, or as may be
                    otherwise authorized by law. Covered entities may use this form or any other form that complies with
                    HIPAA, the Texas Medical Privacy Act, and other applicable laws. Individuals cannot be denied
                    treatment based on a failure to sign this authorization form, and a refusal to sign this form will
                    not affect the payment, enrollment, or eligibility for benefits.
                </p>
                {renderPatientSection()}
            </SectionOne>
            <hr />
            <SectionTwo>
                <h4>I AUTHORIZE THE FOLLOWING TO DISCLOSE THE INDIVIDUAL’S PROTECTED HEALTH INFORMATION:</h4>
                {renderAuthorizedToDiscloseSection()}
                <h4>WHO CAN RECEIVE AND USE THE HEALTH INFORMATION?</h4>
                {renderAuthorizedToReceiveSection()}
                {renderReasonForDisclosureSection()}
            </SectionTwo>
            <hr />
            <SectionThree>
                <h4>
                    WHAT INFORMATION CAN BE DISCLOSED? Complete the following by indicating those items that you want
                    disclosed. The signature of a minor patient is required for the release of some of these items. If
                    all health information is to be released, then check only the first box.
                </h4>
                <InformationApprovedForDisclosure>
                    {renderInformationApprovedForDisclosureSection()}
                </InformationApprovedForDisclosure>

                <RequiredInitalsSection>
                    <h4>Your initials are required to release the following information:</h4>
                    {renderRequiredInitialsSection()}
                </RequiredInitalsSection>
            </SectionThree>
            <hr />
            <h4>
                EFFECTIVE TIME PERIOD. This authorization is valid until the earlier of the occurrence of the death of
                the individual; the individual reaching the age of majority; or permission is withdrawn; or the
                following specific date (optional):
                <span>
                    {' '}
                    <input
                        style={{ minWidth: 'fitContent' }}
                        type="date"
                        name="effectiveTimeExpirationDate"
                        value={formData.effectiveTimeExpirationDate}
                        onChange={handleChange}
                    />
                </span>
                <br />
                <br />
                RIGHT TO REVOKE: I understand that I can withdraw my permission at any time by giving written notice
                stating my intent to revoke this authorization to the person or organization named under “WHO CAN
                RECEIVE AND USE THE HEALTH INFORMATION.” I understand that prior actions taken in reliance on this
                authorization by entities that had permission to access my health information will not be affected.
                <br />
                <br />
                SIGNATURE AUTHORIZATION: I have read this form and agree to the uses and disclosures of the information
                as described. I understand that refusing to sign this form does not stop disclosure of health
                information that has occurred prior to revocation or that is otherwise permitted by law without my
                specific authorization or permission, including disclosures to covered entities as provided by Texas
                Health & Safety Code § 181.154(c) and/or 45 C.F.R. § 164.502(a)(1). I understand that information
                disclosed pursuant to this authorization may be subject to re-disclosure by the recipient and may no
                longer be protected by federal or state privacy laws.
            </h4>
            <RequiredSignatures>{renderRequiredSignaturesSection()}</RequiredSignatures>
            <button type="submit">Sign & Submit</button>
        </FormContainer>
    );
}

export default ReleaseOfMedicalHistory;
