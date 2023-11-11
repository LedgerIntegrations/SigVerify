import './UserInfoDropdown.css'
import profileImg from '../Navigation/assets/profileImg.svg';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

//needs updating - currently taken out of application temporarily

function UserInfoDropdown({ userInfo }) {
    const navigate = useNavigate();

    const [accountObject, setAccountObject] = userInfo;
    const [isOpen, setIsOpen] = useState(false);
    console.log(userInfo)
    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
    };

    function logout() {
        setAccountObject({ loggedIn: false });
        window.sessionStorage.clear();
        navigate("/");
    };

    return (
        <div className="user-info-dropdown">
            <span onClick={toggleDropdown} id="profile-logo" >
                <img src={profileImg} />    
            </span> 
            {isOpen && (
                <div className="user-info-content">
                    {/* Display user information here */}
                    <div>
                        <h6>Logged in:</h6>
                        <p>{accountObject.loggedIn.toString()}</p>
                    </div>
                    <div>
                        <h6>Wallet:</h6>
                        <p>{accountObject.wallet}</p>
                    </div>
                    <div>
                        <h6>User-Token:</h6>
                        <p>{accountObject.userToken}</p>
                    </div>
                    <button onClick={logout}>Logout</button>
                </div>
            )}
        </div>
    );
}

export default UserInfoDropdown;
