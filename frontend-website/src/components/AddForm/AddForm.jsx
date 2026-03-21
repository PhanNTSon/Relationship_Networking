import React, { useState, useEffect, useRef, useContext } from "react";
import PersonSelect from "../PersonSelect/PersonSelect";
import { AppCtx } from "../../context/AppContext";
import { supabase } from "../../components/supabaseClient";
import "./AddForm.css";

export default function AddForm({ coords, onSubmit, onCancel, editingPerson, mode }) {
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

    useEffect(() => {
        if (mode === "update" && editingPerson) {
            const relationships = editingPerson.relationships && editingPerson.relationships.length > 0
                ? editingPerson.relationships.map(r => ({
                    type: r.typeId || "",
                    personId: r.id || ""
                }))
                : [{ type: "", personId: "" }];

            setFormData({
                name: editingPerson.name || "",
                gender: editingPerson.gender || "M",
                birth_date: editingPerson.birth_date || "",
                death_date: editingPerson.death_date || "",
                lat: editingPerson.lat || "",
                lon: editingPerson.lon || "",
                avatar: editingPerson.avatar || null, 
                relationships
            });

            if (editingPerson.avatar) {
                setPreview(editingPerson.avatar);
            }
        }
    }, [editingPerson, mode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const submitHandler = (e) => {
        e.preventDefault(); 
        onSubmit(formData); 
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
        setPreview(null);
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
        <form onSubmit={submitHandler} className="add-form-container">
            <h2 className="form-title">{mode === 'update' ? 'Chỉnh sửa' : 'Thêm mới'}</h2>
            
            {coords && (
                <div className="coords-display">
                    <i className="material-icons">location_on</i>
                    Tọa độ: {coords.lat ? coords.lat.toFixed(4) : ""}, {coords.lon ? coords.lon.toFixed(4) : ""}
                </div>
            )}

            <div className="form-grid">
                <div className="form-group avatar-group">
                    <label>Ảnh đại diện</label>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                    <div
                        onClick={handleClickUpload}
                        className="image-box"
                        title="Click để chọn ảnh"
                    >
                        {preview ? (
                            <img src={preview} alt="preview" />
                        ) : (
                            <div className="image-placeholder">
                                <i className="material-icons">add_a_photo</i>
                                <span>Tải ảnh lên</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group-col">
                    <div className="form-group">
                        <label>Họ và Tên <span className="required">*</span></label>
                        <input required type="text" name="name" placeholder="VD: Nguyễn Văn A" value={formData.name} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Giới tính</label>
                        <select name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="M">Nam (Male)</option>
                            <option value="F">Nữ (Female)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-group-row">
                <div className="form-group">
                    <label>Ngày sinh <span className="required">*</span></label>
                    <input
                        required
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Ngày mất</label>
                    <input
                        type="date"
                        name="death_date"
                        value={formData.death_date}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-group relationships-section">
                <h4>Mối quan hệ</h4>
                <div className="relationship-list">
                    {relationTypes && formData.relationships.map((rel, index) => (
                        <div key={index} className="relationship-row">
                            <select
                                value={rel.type}
                                onChange={(e) =>
                                    handleRelationshipChange(index, "type", e.target.value)
                                }
                                className="rel-select"
                            >
                                <option value="">-- Chọn loại --</option>
                                {relationTypes.map((i) => (
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

                            <button type="button" className="btn-icon btn-remove" onClick={() => removeRelationshipRow(index)} title="Xóa">
                                <i className="material-icons">delete</i>
                            </button>
                        </div>
                    ))}
                </div>

                <button type="button" className="btn-add-rel" onClick={addRelationshipRow}>
                    <i className="material-icons">add_circle_outline</i> Thêm mối quan hệ
                </button>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancel}>HỦY</button>
                <button type="submit" className="btn-submit">
                    <i className="material-icons">save</i>
                    {mode === 'update' ? 'CẬP NHẬT' : 'TẠO MỚI'}
                </button>
            </div>
        </form>
    );
}
