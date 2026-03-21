import React, { useState } from "react";
import "./PersonSelect.css";

export default function PersonSelect({ value, onChange, persons }) {
    const [open, setOpen] = useState(false);

    const selected = persons.find(p => p[0] === value);

    return (
        <div className="person-select-container">
            <div
                className="person-select-header"
                onClick={() => setOpen(!open)}
            >
                <div className="person-select-info">
                    {selected ? (
                        <>
                            <img
                                src={selected[1].avatar || "https://placehold.co/40"}
                                alt="avatar"
                            />
                            <span>{selected[1].name}</span>
                        </>
                    ) : (
                        <span>-- Chọn người --</span>
                    )}
                </div>
                <i className="material-icons" style={{ color: '#7f8c8d' }}>
                    {open ? 'expand_less' : 'expand_more'}
                </i>
            </div>

            {open && (
                <div className="person-select-dropdown">
                    {persons.map(p => (
                        <div
                            key={p[0]}
                            className="person-select-option"
                            onClick={() => {
                                onChange(p[0]);
                                setOpen(false);
                            }}
                        >
                            <img
                                src={p[1].avatar || "https://placehold.co/40"}
                                alt="avatar"
                            />
                            <span>{p[1].name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
