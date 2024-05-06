import { useContext, useState } from 'react';
import styled from 'styled-components';
import { AccountContext } from '../../../../App';

const OutterSettingsContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: 20px;
    padding: 0px 0px;
    margin-top: 0px;
    z-index: 10;
    max-width: 550px;
    margin-inline: auto;
`;

const InnerSettingsContainer = styled.div`
    width: 100%;
`;

const FormContainer = styled.div`
    display: flex;
    justify-content: center;
    form {
        display: flex;
        flex-direction: column;
        align-items: start;
        max-width: 400px;
        gap: 5px;

        label {
            width: 100%;
            display: flex;
            justify-content: space-between;
            gap: 15px;
        }
    }
`;

function Settings() {
    // eslint-disable-next-line no-unused-vars
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [patientInfo, setPatientInfo] = useState({
        name: '',
        address: '',
        birthdate: '',
        city: '',
        state: '',
        zip: '',
        phoneNumber: '',
    });

    const handleChange = (event) => {
        setPatientInfo({
            ...patientInfo,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const patientInfoString = JSON.stringify(patientInfo);
        console.log(patientInfoString);

        try {
            const response = await fetch('http://localhost:3000/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patientInfoString),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            console.log('raw response: ', response);

            // Handle response here
            const result = await response.json();
            console.log('Server response: ', result);
        } catch (error) {
            console.error('Error during data submission:', error);
        }
    };

    console.log('account context in settings page: ', accountObject);

    return (
        <OutterSettingsContainer>
            <h4> Under Development..</h4>
            {/* <InnerSettingsContainer>
                <h1>Patient Information Form</h1>
                <p>This section will be used to capture patient details.</p>

                <FormContainer>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Name:
                            <input type="text" name="name" value={patientInfo.name} onChange={handleChange} />
                        </label>
                        <label>
                            Address:
                            <input type="text" name="address" value={patientInfo.address} onChange={handleChange} />
                        </label>
                        <label>
                            Birthdate:
                            <input type="date" name="birthdate" value={patientInfo.birthdate} onChange={handleChange} />
                        </label>
                        <label>
                            City:
                            <input type="text" name="city" value={patientInfo.city} onChange={handleChange} />
                        </label>
                        <label>
                            State:
                            <input type="text" name="state" value={patientInfo.state} onChange={handleChange} />
                        </label>
                        <label>
                            Zip:
                            <input type="text" name="zip" value={patientInfo.zip} onChange={handleChange} />
                        </label>
                        <label>
                            Phone Number:
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={patientInfo.phoneNumber}
                                onChange={handleChange}
                            />
                        </label>
                        <button type="submit">Submit</button>
                    </form>
                </FormContainer>
            </InnerSettingsContainer> */}
        </OutterSettingsContainer>
    );
}

export default Settings;
