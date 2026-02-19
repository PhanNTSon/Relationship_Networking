import {React, useContext, useState, useEffect} from "react";
import VietnamMap from "../../components/VietnamMap";
import "./MainPage.css";
import { AppCtx } from "../../context/AppContext";

export default function MainPage() {

    const jwt = useContext(AppCtx).jwt;
    const [persons, setPersons] = useState([]);
    const role = useContext(AppCtx).role;

    return (
        <div id="main-page">
            <div id="container">
                <div className="layers" id="map-layer">
                    <VietnamMap />
                </div>
                <div className="layers" id="tool-layer">

                </div>
            </div>
        </div>
    )
}

