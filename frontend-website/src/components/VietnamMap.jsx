import React, { useState, useEffect } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
    Marker
} from "react-simple-maps";

/**
 * @typedef {Object} Person
 * @property {string|number} id - Mã định danh duy nhất của người dùng.
 * @property {string} avatar - Đường dẫn (URL) tới ảnh đại diện.
 * @property {number} lon - Kinh độ (Longitude) hiển thị trên bản đồ.
 * @property {number} lat - Vĩ độ (Latitude) hiển thị trên bản đồ.
 */

/**
 * Component hiển thị Bản đồ Việt Nam cùng với các điểm đánh dấu (Marker) người dùng.
 * * @param {Object} props - Thuộc tính (Props) truyền vào component.
 * @param {number} [props.width=800] - Chiều rộng của bản đồ tính bằng pixel. (Tùy chọn, mặc định: 800)
 * @param {number} [props.height=600] - Chiều cao của bản đồ tính bằng pixel. (Tùy chọn, mặc định: 600)
 * @param {Person[]} props.personList - Mảng chứa danh sách dữ liệu người dùng để vẽ lên bản đồ.
 * @param {(personId: string|number) => void} props.seePersonDetail - Hàm callback được gọi khi người dùng muốn xem chi tiết (ví dụ: click vào marker).
 * @returns {JSX.Element}
 */
const VietnamMap = ({ width = 800, height = 600, personList = [], seePersonDetail, selectedPersonId, zoomMode }) => {
    const [position, setPosition] = useState({
        coordinates: [106, 16],
        zoom: 1,
    });

    const [activeMarker, setActiveMarker] = useState(null);

    const makerTotalRadius = 5;
    const makerImgRadius = 4;
    const makerFill = "#FFB570";
    const makers = personList.map((person) => {
        return {
            key: person.id,
            imgUrl: person.avatar,
            coordinates: [person.lon, person.lat]
        }
    })

    useEffect(() => {
        if (!selectedPersonId) return;

        const person = personList.find(p => p.id === selectedPersonId);
        if (!person) return;

        const coords = [person.lon, person.lat];

        if (zoomMode === "marker") {
            // chỉ zoom đến 4 nếu chưa đủ
            if (position.zoom < 4) {
                setPosition({
                    coordinates: coords,
                    zoom: 4
                });
            } else {
                setPosition(prev => ({
                    ...prev,
                    coordinates: coords
                }));
            }
        }

        if (zoomMode === "panel") {
            zoomOutThenIn(coords);
        }

    }, [selectedPersonId]);

    function handleMarkerClick(marker) {
        setActiveMarker(marker.key);
        seePersonDetail(marker.key);
    }

    function zoomOutThenIn(targetCoordinates) {
        const startZoom = position.zoom;
        const targetZoom = 4;
        const zoomStep = 0.15;

        let zoomLevel = startZoom;

        // ===== PHASE 1: giảm về 1 =====
        const zoomOutInterval = setInterval(() => {
            zoomLevel -= zoomStep;

            if (zoomLevel <= 1) {
                // zoomLevel = 1;
                clearInterval(zoomOutInterval);

                // Sau khi về 1 mới bắt đầu phase 2
                startZoomIn();
            }

            setPosition(prev => ({
                ...prev,
                zoom: zoomLevel
            }));

        }, 30);

        function startZoomIn() {
            let zoomInLevel = 1;

            const zoomInInterval = setInterval(() => {
                zoomInLevel += zoomStep;

                if (zoomInLevel >= targetZoom) {
                    zoomInLevel = targetZoom;
                    clearInterval(zoomInInterval);
                }

                setPosition({
                    coordinates: targetCoordinates,
                    zoom: zoomInLevel
                });

            }, 30);
        }
    }

    return (
        <ComposableMap
            projection="geoMercator"
            width={width}
            height={height}
            projectionConfig={
                {
                    scale: 2600,
                    center: [106, 16]
                }
            }
        >
            <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates}
                minZoom={1}
                maxZoom={8}
                onMoveEnd={setPosition}
                translateExtent={[
                    [-200, -200],
                    [width + 200, height + 200]
                ]}

            >
                <Geographies geography={"/vietnam.geojson"}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#E0F7FA"
                                stroke="#006064"
                                strokeWidth={0.5}
                                style={{
                                    default: { outline: "none" },
                                    hover: { fill: "#B2EBF2", outline: "none" },
                                    pressed: { outline: "none" },
                                }}
                                onClick={() => seePersonDetail(null)}
                            />
                        ))
                    }
                </Geographies>
                {
                    makers.map(
                        (maker) => (
                            <Marker key={maker.key} coordinates={maker.coordinates}
                                onClick={() => handleMarkerClick(maker)}>

                                {/* Định nghĩa phần ảnh được chèn vào*/}
                                <defs>
                                    <clipPath id={`clip-${maker.key}`}>
                                        <circle r={makerImgRadius} />
                                    </clipPath>
                                </defs>

                                <circle r={makerTotalRadius} fill={makerFill} />
                                <image
                                    href={maker.imgUrl}
                                    x={-makerImgRadius} y={-makerImgRadius}
                                    width={makerImgRadius * 2} height={makerImgRadius * 2}
                                    clipPath={`url(#clip-${maker.key})`}
                                    preserveAspectRatio="xMidYMid slice"
                                />

                            </Marker>
                        )
                    )
                }
            </ZoomableGroup>
        </ComposableMap>
    );
};

export default VietnamMap;
