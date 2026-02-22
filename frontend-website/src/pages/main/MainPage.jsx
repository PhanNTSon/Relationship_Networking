import { React, useContext, useState, useEffect, useRef, useCallback } from "react";
import VietnamMap from "../../components/VietnamMap";
import "./MainPage.css";
import { AppCtx } from "../../context/AppContext";
import axios from "axios"
import { mockPersons } from "./mock";
import { supabase } from "../../components/supabaseClient";
import { useNavigate } from "react-router-dom";

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
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const navigate = useNavigate();

    // Xử lý hủy chọn khi click map
    const handleMapClick = useCallback(() => {
        setSelectedPersonId(null);
        setZoomMode(null);
    }, []);

    // Xử lý nhận tọa độ khi kéo map
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
        fetchPersons()
    }, [])

    async function fetchPersons() {
        const { data, error } = await supabase
            .from("persons")
            .select(`
            *,
            person_relationships!fk_person (
                related_person_id,
                relationships (
                    type
                )
            )
        `);

        if (error) {
            console.error(error);
            return;
        }

        const formatted = data.map(person => ({
            ...person, // giữ toàn bộ field gốc
            relationships: (person.person_relationships || []).map(rel => ({
                id: rel.related_person_id,
                type: rel.relationships?.type
            }))
        }));

        setRawPersons(formatted);
        setPersons(formatted.map(p => [p.id, p]));
        setTimeout(() => setIsMapLoaded(true), 500);
    }

    const startPicking = () => {
        setIsPickingMode(true);
        setIsFormOpen(false);
        setPickedCoords(null);
        setSelectedPersonId(null); // Bỏ focus user hiện tại (nếu có)
    };

    const confirmLocation = () => {
        if (!pickedCoords) return;
        setIsPickingMode(false); // Tắt chế độ chọn map
        setIsFormOpen(true);     // Mở form nhập liệu
    };

    const cancelAdd = () => {
        setIsPickingMode(false);
        setIsFormOpen(false);
        setPickedCoords(null);
    };

    // --- XỬ LÝ SUBMIT FORM VÀ ADD VÀO LIST LUÔN ---
    const handleAddPersonSubmit = async (formData) => {
        try {

            // --- 1️⃣ Upload avatar nếu có ---
            let avatarUrl = null;

            if (formData.avatar) {
                const file = formData.avatar;
                const fileName = `${Date.now()}_${file.name}`;

                const { error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: publicData } = supabase.storage
                    .from("avatars")
                    .getPublicUrl(fileName);

                avatarUrl = publicData.publicUrl;
            }

            // --- 2️⃣ Insert person ---
            const { data: personData, error: personError } = await supabase
                .from("persons")
                .insert([
                    {
                        name: formData.name,
                        birth_date: formData.birth_date,
                        death_date: formData.death_date || null,
                        gender: formData.gender,
                        lat: formData.lat ? Number(formData.lat) : null,
                        lon: formData.lon ? Number(formData.lon) : null,
                        avatar: avatarUrl
                    }
                ])
                .select()
                .single();

            if (personError) throw personError;

            const newPersonId = personData.id;

            // --- 3️⃣ Insert relationships ---
            const relationshipInserts = formData.relationships
                .filter(r => r.type && r.personId)
                .map(r => ({
                    person_id: newPersonId,
                    related_person_id: Number(r.personId),
                    relationship_id: Number(r.type)
                }));

            if (relationshipInserts.length > 0) {
                const { error: relError } = await supabase
                    .from("person_relationships")
                    .insert(relationshipInserts);

                if (relError) throw relError;
            }

            // --- 4️⃣ Update UI ---
            setRawPersons(prev => [...prev, personData]);
            if (setPersons) setPersons(prev => [...prev, personData]);

            setIsFormOpen(false);
            setPickedCoords(null);
            setSelectedPersonId(newPersonId);
            setZoomMode("panel");

            alert("Thêm mới thành công!");

        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi lưu dữ liệu.");
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        navigate("/");
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
                        <button onClick={startPicking}><i className="material-icons">add</i></button>
                    </div>
                    <div className={`section ${selectedPersonId ? "" : "hidden"} ${openDetail && selectedPersonId ? "showDetail" : ""}`} id="person-detail-container">
                        <button onClick={() => setOpenDetail(!openDetail)}><i className="material-icons">{openDetail ? "keyboard_arrow_down" : "keyboard_arrow_up"}</i></button>
                        <div id="person-info">
                            {
                                selectedPersonId && (() => {

                                    const personEntry = persons.find(p => p[0] === selectedPersonId);
                                    if (!personEntry) return null;

                                    const person = personEntry[1];
                                    const relationships = person.relationships ?? [];

                                    const groupRelationshipbyType = relationships.length > 0
                                        ? relationships.reduce((acc, rel) => {

                                            const otherEntry = persons.find(p => p[0] === rel.id);
                                            if (!otherEntry) return acc;

                                            const otherPerson = otherEntry[1];

                                            if (!acc[rel.type]) {
                                                acc[rel.type] = [];
                                            }

                                            acc[rel.type].push(otherPerson);
                                            return acc;

                                        }, {})
                                        : {};

                                    return (
                                        <>
                                            <div id="detail">
                                                <div id="setting-btn"><i className="material-icons"  >build</i></div>

                                                <img
                                                    src={person.avatar || "https://placehold.co/600x400"}
                                                    alt={person.name}
                                                />
                                                <div>
                                                    <h3>{person.name}</h3>
                                                    <p>{person.gender.toUpperCase() === "M" ? "Nam" : "Nữ"}</p>
                                                    <p>{person.birth_date} - {person.death_date === null ? "Hiện tại" : person.death_date}</p>
                                                    <p>Location: {person.lon} - {person.lat}</p>
                                                </div>
                                            </div>

                                            {relationships.length === 0 ? (
                                                <p>Người này chưa có mối quan hệ nào.</p>
                                            ) : (
                                                Object.entries(groupRelationshipbyType).map(([type, personList]) => (
                                                    <div className="info-stack" key={type}>
                                                        <h4>{type}:</h4>
                                                        <div className="other-person-container">
                                                            {personList.map(p => (
                                                                <div
                                                                    className="other-person"
                                                                    key={p.id}
                                                                    onClick={() => {
                                                                        setZoomMode("panel");
                                                                        setSelectedPersonId(p.id);
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={p.avatar || "https://placehold.co/600x400"}
                                                                        alt={p.name}
                                                                    />
                                                                    <p>{p.name}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </>
                                    );

                                })()
                            }
                        </div>

                    </div>
                    <div className={`section`} id="add-form">
                        <div className={`${isPickingMode ? "picking" : ""}`} id="picking-header">
                            <p>Chọn tọa độ</p>
                            <div>
                                <button className="green" onClick={confirmLocation}><i className="material-icons">check</i></button>
                                <button className="red" onClick={cancelAdd}><i className="material-icons">close</i></button>
                            </div>
                        </div>
                        <div className={`${isFormOpen ? "form-open" : ""}`} id="add-form-body">
                            <AddFormBody
                                coords={pickedCoords}
                                onSubmit={handleAddPersonSubmit}
                                onCancel={cancelAdd}
                            />
                        </div>
                    </div>
                    <div className={`section ${selectedPersonId ? "hidden" : ""}`} id="logout-btn-section">
                        <button onClick={logout}><i className="material-icons">logout</i></button>
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

function AddFormBody({ coords, onSubmit, onCancel }) {

    const initialState = {
        name: "",
        gender: "M",
        avatar: null,
        birth_date: "",
        death_date: "",
        lat: "",
        lon: "",
        relationships: [
            { type: "", personId: "" }
        ]
    };

    const [formData, setFormData] = useState(initialState);
    const [relationTypes, setRelationTypes] = useState([]);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const { persons } = useContext(AppCtx);

    useEffect(() => {
        const fetchRelationTypes = async () => {
            const { data, error } = await supabase.from("relationships").select("*");
            if (error) {
                console.error(error);
                return;
            }
            setRelationTypes(data);
        }

        fetchRelationTypes();
    }, [])

    useEffect(() => {
        if (coords) {
            setFormData(prev => ({
                ...prev,
                lat: coords.lat,
                lon: coords.lon
            }));
        }
    }, [coords]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const submitHandler = (e) => {
        e.preventDefault(); // Ngăn trình duyệt reload trang
        onSubmit(formData); // Đẩy data ngược lên MainPage
    };


    const handleClickUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFormData(prev => ({
            ...prev,
            avatar: file
        }));

        setPreview(URL.createObjectURL(file));
    };

    const handleCancel = () => {
        setFormData(initialState);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        onCancel();
    };

    const addRelationshipRow = () => {
        setFormData(prev => ({
            ...prev,
            relationships: [
                ...prev.relationships,
                { type: "", personId: "" }
            ]
        }));
    };

    const handleRelationshipChange = (index, field, value) => {
        const updated = [...formData.relationships];
        updated[index][field] = value;

        setFormData(prev => ({
            ...prev,
            relationships: updated
        }));
    };

    const removeRelationshipRow = (index) => {
        const updated = formData.relationships.filter((_, i) => i !== index);

        setFormData(prev => ({
            ...prev,
            relationships: updated
        }));
    };
    return (
        <form onSubmit={submitHandler} >
            <div >
                Tọa độ đã chọn: {coords?.lat.toFixed(4)}, {coords?.lon.toFixed(4)}
            </div>

            <div>
                <label>Ảnh đại diện</label>

                {/* Input ẩn */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />

                {/* Placeholder / Preview */}
                <div
                    onClick={handleClickUpload}
                    id="image-box"
                >
                    {preview ? (
                        <img src={preview} alt="preview" />
                    ) : (
                        <span>Click để chọn ảnh</span>
                    )}
                </div>
            </div>

            <div>
                <label>Họ và Tên (*)</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
            </div>

            <div>
                <label>Giới tính</label>
                <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                    <option value="M">Nam (Male)</option>
                    <option value="F">Nữ (Female)</option>
                </select>
            </div>

            <div>
                <label>Ngày sinh (*)</label>
                <input
                    required
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px' }}
                />
            </div>

            <div>
                <label>Ngày mất</label>
                <input
                    type="date"
                    name="death_date"
                    value={formData.death_date}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px' }}
                />
            </div>

            <div>
                <h4>Mối quan hệ</h4>

                {relationTypes && formData.relationships.map((rel, index) => (
                    <div key={index} style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "10px" }}>

                        <select
                            value={rel.type}
                            onChange={(e) =>
                                handleRelationshipChange(index, "type", e.target.value)
                            }
                        >
                            <option value="">-- Chọn loại --</option>
                            {relationTypes.map((i, idx) => (
                                <option key={i.id} value={i.id}>{i.type}</option>
                            ))}
                        </select>

                        <PersonSelect
                            value={rel.personId}
                            persons={persons}
                            onChange={(value) =>
                                handleRelationshipChange(index, "personId", value)
                            }
                        />

                        <button type="button" onClick={() => removeRelationshipRow(index)}>
                            Xóa
                        </button>
                    </div>
                ))}

                <button type="button" onClick={addRelationshipRow}>
                    + Thêm mối quan hệ
                </button>
            </div>

            <div >
                <button type="submit" >TẠO MỚI</button>
                <button type="button" onClick={handleCancel}>HỦY</button>
            </div>
        </form>
    );
}

function PersonSelect({ value, onChange, persons }) {
    const [open, setOpen] = useState(false);

    const selected = persons.find(p => p[0] === value);

    return (
        <div style={{ position: "relative", width: "250px" }}>
            <div
                onClick={() => setOpen(!open)}
                style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}
            >
                {selected ? (
                    <>
                        <img
                            src={selected[1].avatar || "https://placehold.co/40"}
                            width={30}
                            height={30}
                            style={{ borderRadius: "50%" }}
                        />
                        <span>{selected[1].name}</span>
                    </>
                ) : (
                    <span>-- Chọn người --</span>
                )}
            </div>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        border: "1px solid #ccc",
                        background: "white",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 10
                    }}
                >
                    {persons.map(p => (
                        <div
                            key={p[0]}
                            onClick={() => {
                                onChange(p[0]);
                                setOpen(false);
                            }}
                            style={{
                                padding: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer"
                            }}
                        >
                            <img
                                src={p[1].avatar || "https://placehold.co/40"}
                                width={30}
                                height={30}
                                style={{ borderRadius: "50%" }}
                            />
                            <span>{p[1].name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}