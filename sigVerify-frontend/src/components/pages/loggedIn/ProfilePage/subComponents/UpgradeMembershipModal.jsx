import { useState, useContext } from 'react';
import styled from 'styled-components';
// Adjust the import path to where you have your UserContext
import { AccountContext } from '../../../../../App';
const membershipPlans = {
    free: { price: '0 XRP', features: ['Basic access', 'Limited documents'] },
    standard: { price: '20 XRP/month', features: ['Standard access', '25 documents per month'] },
    premium: { price: '50 XRP/month', features: ['Premium access', '50 documents per month'] },
    business: { price: '500 XRP/month', features: ['Business access', 'Unlimited documents', 'Priority support'] },
};

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const Content = styled.div`
    background-color: #fff;
    padding: 20px;
    border-radius: 5px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const MembershipOption = styled.div`
    margin-bottom: 10px;
`;

const Button = styled.button`
    margin-top: 10px;
`;

const MembershipUpgradeModal = ({ isOpen, onClose }) => {
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [selectedPlan, setSelectedPlan] = useState(accountObject.membership);

    const handleUpgrade = (e) => {
        e.preventDefault();
        console.log(`Upgrading to ${selectedPlan}`);
        // Here, you'd likely call a function to process the upgrade
        onClose(); // Close the modal
    };

    if (!isOpen) return null;

    return (
        <Overlay>
            <Content>
                <h2>Upgrade Your Membership</h2>
                <p>Removed for demo</p>
                {/* <p>Select a plan that fits your needs:</p>
                <Form onSubmit={handleUpgrade}>
                    {Object.entries(membershipPlans).map(([plan, details]) => (
                        <MembershipOption key={plan}>
                            <input
                                type="radio"
                                id={plan}
                                name="membershipPlan"
                                value={plan}
                                checked={selectedPlan === plan}
                                onChange={() => setSelectedPlan(plan)}
                                disabled={plan === accountObject.membership}
                            />
                            <label htmlFor={plan}>
                                <strong>{plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> - {details.price}
                                <ul>
                                    {details.features.map((feature) => (
                                        <li key={feature}>{feature}</li>
                                    ))}
                                </ul>
                            </label>
                        </MembershipOption>
                    ))}
                    <Button type="submit">Upgrade Plan</Button>
                </Form> */}
                <Button onClick={onClose}>Close</Button>
            </Content>
        </Overlay>
    );
};

export default MembershipUpgradeModal;
