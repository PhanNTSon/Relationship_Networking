import React, { useState } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
    Marker
} from "react-simple-maps";
import vietnamMap from "../assets/vn-all2.geo.json";

const markers = [
    { name: "PhanSon", coordinates: [105.85, 21.02], imgurl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEzUL2rgGflKrPIZ1JYl5Ly3XCuJ5UlQi4vw&s" }
]

const VietnamMap = () => {
    const [position, setPosition] = useState({
        coordinates: [0, 0],
        zoom: 1,
    });

    const [activeMarker, setActiveMarker] = useState(null);

    return (
        <ComposableMap projection="geoIdentity" width={800} height={600}>
            <defs>
                <pattern id="user-avatar" x="0" y="0" height="100%" width="100%" viewBox="0 0 50 50">
                    <image x="0" y="0" width="50" height="50" href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEzUL2rgGflKrPIZ1JYl5Ly3XCuJ5UlQi4vw&s" />
                </pattern>
            </defs>

            <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates}
                minZoom={1}
                maxZoom={8}
                onMoveEnd={setPosition}

            >
                <Geographies geography={vietnamMap}>
                    {({ geographies, projection }) => {
                        projection.reflectY(true);
                        projection.fitSize(
                            [800, 600],
                            {
                                type: "FeatureCollection",
                                features: geographies,
                            }
                        );

                        return geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#E0F7FA"
                                stroke="#006064"
                                strokeWidth={0.5}
                                onClick={() => setActiveMarker(null)}
                                style={{
                                    default: { outline: "none" },
                                    hover: { fill: "#B2EBF2", outline: "none" },
                                    pressed: { outline: "none" },
                                }}
                            />
                        ));
                    }}
                </Geographies>
                {markers.map(({ name, coordinates }) => (
                    <Marker
                        key={name}
                        coordinates={coordinates}
                        onClick={() => setActiveMarker(name)} // Sự kiện click để hiện box
                        style={{
                            default: { cursor: "pointer" },
                            hover: { cursor: "pointer" }
                        }}
                    >
                        {/* Vòng tròn viền ngoài */}
                        <circle r={12} fill="#FFF" stroke="#006064" strokeWidth={2} />

                        {/* Vòng tròn chứa ảnh (dùng pattern id đã khai báo ở trên) */}
                        <circle r={10} fill="url(#user-avatar)" />

                        {/* Box Xin Chào - Chỉ hiện khi activeMarker trùng khớp */}
                        {activeMarker === name && (
                            <g transform="translate(0, -35)"> {/* Dịch chuyển box lên trên marker */}
                                {/* Hình chữ nhật nền của box */}
                                <rect
                                    x={-40} y={-20}
                                    width={80} height={25}
                                    fill="white"
                                    stroke="#006064"
                                    rx={5} // Bo góc
                                />
                                {/* Mũi tên trỏ xuống (tam giác) */}
                                <path d="M -5 5 L 5 5 L 0 10 z" fill="#006064" />

                                {/* Text Xin chào */}
                                <text
                                    textAnchor="middle"
                                    y={-4}
                                    style={{ fontFamily: "Arial", fontSize: "12px", fill: "#333" }}
                                >
                                    Xin chào!
                                </text>
                            </g>
                        )}
                    </Marker>
                ))}

            </ZoomableGroup>
        </ComposableMap>
    );
};

export default VietnamMap;
