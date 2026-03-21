import { React, useContext, useState, useEffect, useRef, useCallback } from "react";
import VietnamMap from "../../components/VietnamMap";
import "./MainPage.css";
import { AppCtx } from "../../context/AppContext";
import { supabase } from "../../components/supabaseClient";
import { useNavigate } from "react-router-dom";
import { usePersons } from "../../hooks/usePersons";
import AddForm from "../../components/AddForm/AddForm";
import PersonDetail from "../../components/PersonDetail/PersonDetail";

export default function MainPage() {
    const containerRef = useRef(null)
    const [size, setSize] = useState({ width: 0, height: 0 })
    const [selectedPersonId, setSelectedPersonId] = useState(null)
    const [openDetail, setOpenDetail] = useState(false)
    const [openLogout, setOpenLogout] = useState(false)

    const { role, persons, setPersons } = useContext(AppCtx)
    const { rawPersons, isMapLoaded, fetchPersons, addPerson, updatePerson } = usePersons();

    const [zoomMode, setZoomMode] = useState(null);

    const [isPickingMode, setIsPickingMode] = useState(false);
    const [pickedCoords, setPickedCoords] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [mode, setMode] = useState(null); // "add" | "update"
    const [editingPerson, setEditingPerson] = useState(null);

    const navigate = useNavigate();

    const handleMapClick = useCallback(() => {
        setSelectedPersonId(null);
        setZoomMode(null);
    }, []);

    const handleCenterChange = useCallback((coords) => {
        setPickedCoords(coords);
    }, []);

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
        fetchPersons(setPersons)
    }, [fetchPersons, setPersons])

    const startPicking = () => {
        setMode("add");
        setIsPickingMode(true);
        setIsFormOpen(false);
        setPickedCoords(null);
        setSelectedPersonId(null);
    };

    const confirmLocation = () => {
        if (!pickedCoords) return;
        setIsPickingMode(false);
        setIsFormOpen(true);
    };

    const cancelAdd = () => {
        setIsPickingMode(false);
        setIsFormOpen(false);
        setPickedCoords(null);
        setMode(null);
        setEditingPerson(null);
    };

    const handleAddPersonSubmit = async (formData) => {
        try {
            const newPersonId = await addPerson(formData);
            fetchPersons(setPersons);
            setIsFormOpen(false);
            setPickedCoords(null);
            setSelectedPersonId(newPersonId);
            setZoomMode("panel");
            setMode(null);
            alert("Thêm mới thành công!");
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi lưu dữ liệu.");
        }
    };

    const handleUpdatePersonSubmit = async (formData) => {
        try {
            await updatePerson(editingPerson.id, formData);
            fetchPersons(setPersons);
            setIsFormOpen(false);
            setMode(null);
            setEditingPerson(null);
            alert("Cập nhật thành công!");
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra khi cập nhật!");
        }
    };

    const handleEditPerson = (person) => {
        setMode("update");
        setEditingPerson(person);
        setIsPickingMode(true);
        setIsFormOpen(false);
        setPickedCoords(null); 
    };

    const logout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    }

    const selectedPersonEntry = selectedPersonId ? persons.find(p => p[0] === selectedPersonId) : null;

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
                        <button onClick={startPicking}><i className="material-icons">add</i></button>
                    </div>
                    <div className={`section ${selectedPersonId ? "" : "hidden"} ${openDetail && selectedPersonId ? "showDetail" : ""}`} id="person-detail-container">
                        <button onClick={() => setOpenDetail(!openDetail)}><i className="material-icons">{openDetail ? "keyboard_arrow_down" : "keyboard_arrow_up"}</i></button>
                        <div id="person-info">
                            <PersonDetail 
                                personEntry={selectedPersonEntry} 
                                persons={persons}
                                onEdit={handleEditPerson}
                                onSelectRelatedPerson={(id) => {
                                    setZoomMode("panel");
                                    setSelectedPersonId(id);
                                }}
                            />
                        </div>

                    </div>
                    <div className={`section`} id="add-form">
                        <div className={`${isPickingMode ? "picking" : ""}`} id="picking-header">
                            <p>Chọn tọa độ</p>
                            <div>
                                <button className="green" onClick={confirmLocation}><i className="material-icons">check</i></button>
                                {mode === "update" && (
                                    <button onClick={() => {
                                        setIsPickingMode(false);
                                        setIsFormOpen(true);
                                        setPickedCoords(null);
                                    }}>
                                        SKIP
                                    </button>
                                )}
                                <button className="red" onClick={cancelAdd}><i className="material-icons">close</i></button>
                            </div>
                        </div>
                        <div className={`${isFormOpen ? "form-open" : ""}`} id="add-form-body">
                            <AddForm
                                coords={pickedCoords}
                                onSubmit={mode === "add" ? handleAddPersonSubmit : handleUpdatePersonSubmit}
                                onCancel={cancelAdd}
                                editingPerson={editingPerson}
                                mode={mode}
                            />
                        </div>
                    </div>
                    <div className={`section ${selectedPersonId ? "hidden" : ""}`} id="logout-btn-section">
                        <button onClick={() => setOpenLogout(true)}><i className="material-icons">logout</i></button>
                    </div>
                </div>
                <div className={`layers ${isMapLoaded ? "" : "loading"}`} id="loader-layer">
                    <div className="spinner"></div>
                    <h3>Loading data<span className="loading-text"> <span>. </span><span>. </span><span>. </span> </span></h3>
                </div>
                <div className={`layers ${openLogout ? "" : "hidden"}`} id="logout-layer">
                    <div className={`${openLogout ? "" : "hidden"}`} id="logout-box">
                        <h2>Đăng xuất?</h2>
                        <div id="options">
                            <button onClick={logout} className="green">YES</button>
                            <button onClick={() => setOpenLogout(false)} className="red">NO</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}