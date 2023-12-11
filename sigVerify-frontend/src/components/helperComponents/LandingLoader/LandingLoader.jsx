import React from 'react'
import './LandingLoader.css'
import logoImage from '../../assets/svLogo.png';

function LandingLoader() {
    return (
        <div id="landing-loader-wrapper">
            <div id="landing-loader-main">
                <div id="inside-div-1">
                    <div>
                        <div>
                            <span>
                                <img id="lander-logo-img" src={logoImage} />
                            </span>
                        </div>
                    </div>
                </div>

                <div id="inside-div-2">
                    <section>
                        <h5>Sig Verify</h5>
                        <p>Lorem ipsum dolor sit consectetur, velit!</p>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default LandingLoader