import { React, useContext, useState, useEffect, useRef } from "react";
import VietnamMap from "../../components/VietnamMap";
import "./MainPage.css";
import { AppCtx } from "../../context/AppContext";
import axios from "axios"
import { mockPersons } from "./mock";
import { supabase } from "../../components/supabaseClient";

export default function MainPage() {

    const containerRef = useRef(null)
    const [size, setSize] = useState({ width: 0, height: 0 })
    const [selectedPersonId, setSelectedPersonId] = useState(null)
    const [openDetail, setOpenDetail] = useState(false)

    const { jwt, role, persons, setPersons } = useContext(AppCtx)
    const [rawPersons, setRawPersons] = useState([]);
    const [zoomMode, setZoomMode] = useState(null);

    // State mới cho việc lấy tọa độ
    const [isPickingMode, setIsPickingMode] = useState(false);
    const [pickedCoords, setPickedCoords] = useState(null);

    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Xử lý hủy chọn khi click map
    const handleMapClick = () => {
        setSelectedPersonId(null);
        setZoomMode(null); // Reset luôn cả zoomMode nếu cần
    };

    // Xử lý nhận tọa độ khi kéo map
    const handleCenterChange = (coords) => {
        setPickedCoords(coords);
    };

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

    async function fetchPersons() {

        axios.get("")
            .then(res => {
                setRawPersons(mockPersons);
                setPersons(mockPersons.map(person => [person.id, person]))
                setTimeout(() => {
                    setIsMapLoaded(true);
                }, 500);
            })
            .catch((err) => {

            })

        const { data, error } = await supabase
            .from("relationships")
            .select("*");

        console.log(data);
    }

    return (
        <div id="main-page">
            <div id="container" ref={containerRef}>
                <div className="layers" id="map-layer">
                    <VietnamMap
                        width={size.width}
                        height={size.height}
                        personList={rawPersons}
                        seePersonDetail={(id) => {
                            setZoomMode("marker");
                            setSelectedPersonId(id);
                        }}
                        selectedPersonId={selectedPersonId}
                        zoomMode={zoomMode}
                        onMapClick={handleMapClick}
                        isPickingMode={isPickingMode}
                        onCenterChange={handleCenterChange}
                    />

                </div>
                <div className="layers" id="tool-layer">
                    {
                        role === "admin" && (
                            <div className="section" id="dashboard-btn">

                            </div>
                        )
                    }
                    <div className={`section ${selectedPersonId ? "hidden" : ""}`} id="tool-btns">
                        <button><i className="material-icons">search</i></button>
                        <button><i className="material-icons">add</i></button>
                    </div>
                    <div className={`section ${selectedPersonId ? "" : "hidden"} ${openDetail && selectedPersonId ? "showDetail" : ""}`} id="person-detail-container">
                        <button onClick={() => setOpenDetail(!openDetail)}><i className="material-icons">{openDetail ? "keyboard_arrow_down" : "keyboard_arrow_up"}</i></button>
                        <div id="person-info">
                            {
                                selectedPersonId && (() => {
                                    const person = persons.find(p => p[0] === selectedPersonId)[1]
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
                                            <div id="detail">
                                                <img src={`${person.avatar ? person.avatar : "https://placehold.co/600x400"}`} alt={`${person.name}`} />
                                                <div>
                                                    <h3>{person.name}</h3>
                                                    <p>{person.gender === "male" ? "Nam" : "Nữ"}</p>
                                                    <p>BirthDate: - DeathDate:</p>
                                                    <p>Location: {person.lon} - {person.lat}</p>
                                                </div>
                                            </div>

                                            {
                                                Object.entries(groupRelationshipbyType).map(([type, personList]) => (
                                                    <div className="info-stack" key={type}>
                                                        <h4>{type}:</h4>
                                                        <div className="other-person-container">
                                                            {
                                                                personList.map(p => (
                                                                    <div className="other-person" key={p.id} onClick={() => {
                                                                        setZoomMode("panel");
                                                                        setSelectedPersonId(p.id);
                                                                    }}>
                                                                        <img src={`${p.avatar ? p.avatar : "https://placehold.co/600x400"}`} alt="" />
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
                <div className={`layers ${isMapLoaded ? "" : "loading"}`} id="loader-layer">
                    <div className="spinner"></div>
                    <h3>Loading data<span className="loading-text"> <span>. </span><span>. </span><span>. </span> </span></h3>
                </div>
            </div>
        </div >
    )
}



