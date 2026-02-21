import { React, useContext, useState, useEffect, useRef } from "react";
import VietnamMap from "../../components/VietnamMap";
import "./MainPage.css";
import { AppCtx } from "../../context/AppContext";
import axios from "axios"



const getPersonById = (id) => {
    return persons.find(p => p.id === id)
}

export default function MainPage() {

    const containerRef = useRef(null)
    const [size, setSize] = useState({ width: 0, height: 0 })
    const [selectedPersonId, setSelectedPersonId] = useState(null)
    const [openDetail, setOpenDetail] = useState(false)

    const { jwt, role, persons, setPersons } = useContext(AppCtx)


    useEffect(() => {
        function updateSize() {
            if (containerRef.current) {
                setSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                })
            }
        }

        updateSize()
        window.addEventListener("resize", updateSize)

        return () => window.removeEventListener("resize", updateSize)
    }, [])

    useEffect(() => {

    }, [])

    function fetchPersons() {

        axios.get("")
            .then(res => {

            })
            .catch((err) => {

            })
    }


    function searchPerson() {
        return (
            <div id="search-tool">

            </div>
        )
    }

    function addPerson() {
        return (
            <div id="add-tool"></div>

        )
    }

    return (
        <div id="main-page">
            <div id="container" ref={containerRef}>
                <div className="layers" id="map-layer">
                    <VietnamMap
                        width={size.width}
                        height={size.height}
                        personList={persons}
                        seePersonDetail={setSelectedPersonId}
                    />

                </div>
                <div className="layers" id="tool-layer">
                    {
                        role === "admin" ? (
                            <div className="section" id="dashboard-btn">

                            </div>
                        ) : (
                            <></>
                        )
                    }
                    <div className={`section ${selectedPersonId ? "hidden" : ""}`} id="tool-btns">
                        <button><i className="material-icons">search</i></button>
                        <button><i className="material-icons">add</i></button>
                    </div>
                    <div className={`section ${selectedPersonId ? "" : "hidden"} ${openDetail ? "showDetail" : ""}`} id="person-detail-container">
                        <button onClick={() => setOpenDetail(!openDetail)}><i className="material-icons">{openDetail ? "keyboard_arrow_down" : "keyboard_arrow_up"}</i></button>
                        <div id="person-info">
                            <div className="info-stack" >
                                {/* <image href="" /> */}
                                <h3>Name:</h3>
                                <p>Gender:</p>
                                <p>BirthDate: - DeathDate:</p>
                                <p>Location:</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}



