import { React, useContext, useState, useEffect, useRef } from "react";
import VietnamMap from "../../components/VietnamMap";
import "./MainPage.css";
import { AppCtx } from "../../context/AppContext";
import axios from "axios"
import { mockPersons } from "./mock";

export default function MainPage() {

    const containerRef = useRef(null)
    const [size, setSize] = useState({ width: 0, height: 0 })
    const [selectedPersonId, setSelectedPersonId] = useState(null)
    const [openDetail, setOpenDetail] = useState(false)

    const { jwt, role, persons, setPersons } = useContext(AppCtx)
    const [rawPersons, setRawPersons] = useState([]);


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
        fetchPersons()
    }, [])

    function fetchPersons() {

        axios.get("")
            .then(res => {
                setRawPersons(mockPersons);
                setPersons(mockPersons.map(person => [person.id, person]))
            })
            .catch((err) => {

            })
    }

    return (
        <div id="main-page">
            <div id="container" ref={containerRef}>
                <div className="layers" id="map-layer">
                    <VietnamMap
                        width={size.width}
                        height={size.height}
                        personList={rawPersons}
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

                            {
                                selectedPersonId && (() => {
                                    const person = persons.find(p => p[0] === selectedPersonId)[1]

                                    console.log("person", person)
                                    console.log("persons", persons)
                                    console.log("selectedPersonId", selectedPersonId)

                                    const groupRelationshipbyType = person.relationships.reduce((acc, rel) => {
                                        const otherPerson = persons.find(p => p[0] === rel.id)[1]
                                        if (!acc[rel.type]) {
                                            acc[rel.type] = []
                                        }
                                        acc[rel.type].push(otherPerson);
                                        return acc
                                    }, {});
                                    return (
                                        <>
                                            <div className="info-stack" >
                                                {/* <image href="" /> */}
                                                <h3>Name: {person.name}</h3>
                                                <p>Gender: {person.gender}</p>
                                                <p>BirthDate: - DeathDate:</p>
                                                <p>Location: {person.lon} - {person.lat}</p>
                                            </div>

                                            {
                                                Object.entries(groupRelationshipbyType).map(([type, personList]) => (
                                                    <div className="info-stack">
                                                        <h4>{type}:</h4>
                                                        <div className="other-person-container">
                                                            {
                                                                personList.map(p => (
                                                                    <div className="other-person">
                                                                        <img src="" alt="" />
                                                                        <p>{p.name}</p>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>

                                                    </div>
                                                ))
                                            }
                                        </>
                                    );
                                })()
                            }
                        </div>

                    </div>
                </div>
            </div>
        </div >
    )
}



