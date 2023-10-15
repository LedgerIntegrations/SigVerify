import React from 'react';
import './Tile.css';
import { Link } from 'react-router-dom';


function Tile({ title, icon, link }) {
    return (
        <Link to={link} className="tile buttonPop">
            <div className="tile-content">
                <span className="tile-icon">{icon}</span>
                <h2 className="tile-title">{title}</h2>
            </div>
        </Link>
    )
};

export default Tile;