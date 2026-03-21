import React from 'react';
import './PersonDetail.css';

export default function PersonDetail({ personEntry, persons, onEdit, onSelectRelatedPerson }) {
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
        <div className="person-detail-content">
            <div className="detail-header">
                <div className="setting-btn" onClick={() => onEdit(person)}>
                    <i className="material-icons">build</i>
                </div>

                <img
                    src={person.avatar || "https://placehold.co/600x400"}
                    alt={person.name}
                    className="person-avatar"
                />
                <div className="person-info-text">
                    <h2>{person.name}</h2>
                    <p>{person.gender.toUpperCase() === "M" ? "Nam" : "Nữ"}</p>
                    <p>{person.birth_date} - {person.death_date === null ? "Hiện tại" : person.death_date}</p>
                    <p className="location-info">
                        Vị trí: {person.lat ? person.lat.toFixed(4) : "N/A"}, {person.lon ? person.lon.toFixed(4) : "N/A"}
                        {person.lat && person.lon && (
                            <a
                                href={`https://www.google.com/maps?q=${person.lat},${person.lon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="map-link"
                                title="Xem trên Google Maps"
                            >
                                <i className="material-icons">open_in_new</i>
                            </a>
                        )}
                    </p>
                </div>
            </div>

            {relationships.length === 0 ? (
                <p className="no-relationships">Người này chưa có mối quan hệ nào.</p>
            ) : (
                Object.entries(groupRelationshipbyType).map(([type, personList]) => (
                    <div className="info-stack" key={type}>
                        <h3>Là {type} của:</h3>
                        <div className="other-person-container">
                            {personList.map(p => (
                                <div
                                    className="other-person"
                                    key={p.id}
                                    onClick={() => onSelectRelatedPerson(p.id)}
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
        </div>
    );
}
