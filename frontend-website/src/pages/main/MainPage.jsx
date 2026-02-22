import { React, useContext, useState, useEffect, useRef, useCallback } from "react";
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
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [isMapLoaded, setIsMapLoaded] = useState(false);

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

        // axios.get("")
        //     .then(res => {
        //         setRawPersons(mockPersons);
        //         setPersons(mockPersons.map(person => [person.id, person]))
        //         setTimeout(() => {
        //             setIsMapLoaded(true);
        //         }, 500);
        //     })
        //     .catch((err) => {

        //     })
        const { data, error } = await supabase
            .from("persons")
            .select("*");
        setPersons(data.map(person => [person.id, person]));
        setTimeout(() => {
            setIsMapLoaded(true);
        }, 500);
        console.log(data);
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
            // 1. Tạo payload để gửi lên backend
            const payload = {
                ...formData,
                lat: pickedCoords.lat,
                lon: pickedCoords.lon
            };

            // 2. GỌI API POST (Mở comment ra khi ráp API thật)
            // const res = await axios.post("/api/persons", payload);
            // const newlyCreatedPerson = res.data; 

            // Giả lập Response trả về từ Server (Có kèm ID được cấp từ Postgres)
            const newlyCreatedPerson = {
                ...payload,
                id: `new_user_${Date.now()}` // Backend sẽ trả về ID thật
            };

            // 3. TỐI ƯU CỰC MẠNH: Push thẳng vào state hiện tại
            setRawPersons(prevList => [...prevList, newlyCreatedPerson]);
            // Nếu bạn có lưu ở Context thì update luôn
            if (setPersons) setPersons(prevList => [...prevList, newlyCreatedPerson]);

            // 4. Reset trạng thái UI
            setIsFormOpen(false);
            setPickedCoords(null);

            // (Tùy chọn) Focus luôn vào người vừa tạo
            setSelectedPersonId(newlyCreatedPerson.id);
            setZoomMode("panel");

            alert("Thêm mới thành công!");

        } catch (error) {
            console.error("Lỗi khi thêm:", error);
            alert("Có lỗi xảy ra khi lưu dữ liệu.");
        }
    };

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
        avatar: "",
        relationships: [
            { type: "", personId: "" }
        ]
    };
    const [formData, setFormData] = useState(initialState);
    const [relationTypes, setRelationTypes] = useState([]);
    const fileInputRef = useRef(null);
    const { persons } = useContext(AppCtx);

    useEffect(() => {
        const fetchRelationTypes = async () => {
            const { data, error } = await supabase.from("relationships").select("type");
            if (error) {
                console.error(error);
                return;
            }
            setRelationTypes(data);
            console.log(data)
        }

        fetchRelationTypes();
    }, [])

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

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                avatar: reader.result
            }));
        };
        reader.readAsDataURL(file);
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
                    {formData.avatar ? (
                        <img
                            src={formData.avatar}
                            alt="preview"
                        />
                    ) : (
                        <span style={{ color: "#999" }}>
                            Click để chọn ảnh
                        </span>
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
                            {relationTypes.map((i,idx) => (
                                <option key={i.type} value={i.type}>{i.type}</option>
                            ))}
                        </select>

                        <select
                            value={rel.personId}
                            onChange={(e) =>
                                handleRelationshipChange(index, "personId", e.target.value)
                            }
                        >
                            <option value="">-- Chọn người --</option>
                            {persons
                                .map(p => (
                                    <option key={p[0]} value={p[0]}>
                                        {p[1].name}
                                    </option>
                                ))}
                        </select>

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

