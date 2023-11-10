import React from 'react';
import './Tile.css';
import { Link } from 'react-router-dom';


function Tile({ title, icon, link, finePrint }) {
    return (
        <Link to={link} className="tile buttonPop">
            <div className="tile-content">
                <span className="tile-icon">{icon}</span>
                <h2 className="tile-title">{title}</h2>
                <p className='tileFinePrint'>{finePrint.length > 1 ? `${finePrint}` : ''}</p>
            </div>
        </Link>
    )
};

export default Tile;