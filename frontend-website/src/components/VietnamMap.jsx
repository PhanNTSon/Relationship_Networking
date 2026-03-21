import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const createClusterCustomIcon = function (cluster) {
    return L.divIcon({
        html: `<div style="
            width: 40px; height: 40px; border-radius: 50%;
            background-color: #FFB570; color: white;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 16px;
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            border: 2px solid white;
        "><span>${cluster.getChildCount()}</span></div>`,
        className: 'custom-cluster-marker',
        iconSize: L.point(40, 40, true),
    });
};

const vietnamBounds = [
    [8.0, 102.0],  // Góc dưới cùng bên trái (Tây Nam - Kiên Giang/Cà Mau)
    [24.0, 110.0]  // Góc trên cùng bên phải (Đông Bắc - Hà Giang/Biển Đông)
];

const createCustomIcon = (imageUrl) => {
    return L.divIcon({
        className: "custom-avatar-marker",
        html: `<div style="
            width: 32px; height: 32px; border-radius: 50%; 
            border: 2px solid #FFB570; background-color: white;
            background-image: url('${imageUrl || "https://placehold.co/100x100"}');
            background-size: cover; background-position: center;
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

// COMPONENT ĐIỀU KHIỂN FLY-TO (Bay đến Marker)
const MapController = ({ selectedPersonId, personList, zoomMode }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedPersonId && personList && personList.length > 0) {
            const targetPerson = personList.find(p => p.id === selectedPersonId);
            if (targetPerson) {
                const targetCoordinates = [targetPerson.lat, targetPerson.lon];
                const zoomLevel = zoomMode === "panel" ? 15 : 13;
                map.flyTo(targetCoordinates, zoomLevel, { animate: true, duration: 1.5 });
            }
        }
    }, [selectedPersonId, personList, zoomMode, map]);

    return null;
};

// 3. COMPONENT LẮNG NGHE SỰ KIỆN BẢN ĐỒ (Click & Kéo thả)
const MapEventsHandler = ({ onMapClick, isPickingMode, onCenterChange }) => {
    const map = useMapEvents({
        // YÊU CẦU 1: Click vào map (không trúng marker) sẽ gọi hàm onMapClick
        click: () => {
            if (onMapClick) onMapClick();
        },
        // YÊU CẦU 2: Bắt tọa độ khi người dùng kéo thả map xong
        moveend: () => {
            if (isPickingMode && onCenterChange) {
                const center = map.getCenter();
                onCenterChange({ lat: center.lat, lon: center.lng });
            }
        }
    });

    useEffect(() => {
        if (isPickingMode && onCenterChange) {
            const center = map.getCenter();
            onCenterChange({ lat: center.lat, lon: center.lng });
        }
    }, [isPickingMode]);

    return null;
};

const FixMapRender = () => {
    const map = useMap();
    useEffect(() => {
        // Đợi một chút cho DOM và CSS của trang load ổn định, rồi ép Map tự tính lại kích thước
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 500);

        return () => clearTimeout(timer);
    }, [map]);

    return null;
};

// COMPONENT BẢN ĐỒ CHÍNH
const VietnamMap = ({
    width = "100%", height = "100%",
    personList = [], seePersonDetail, selectedPersonId, zoomMode,
    onMapClick,              // Prop mới: Hàm chạy khi click ra ngoài map
    isPickingMode = false,   // Prop mới: Bật/Tắt chế độ hiện ghim giữa màn hình
    onCenterChange,         // Prop mới: Trả về tọa độ trung tâm khi kéo map
    onMapReady
}) => {

    const defaultCenter = [16.0471, 108.2068]; // Đà Nẵng

    return (
        // Wrapper cần position relative để đặt cái ghim nổi lên trên
        <div style={{ position: "relative", width: width, height: height, zIndex: 0 }}>

            {/* YÊU CẦU 2: HIỂN THỊ GHIM TRUNG TÂM KIỂU GRAB/UBER */}
            {isPickingMode && (
                <div style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -100%)", // Đẩy mũi nhọn lên đúng tâm
                    zIndex: 1000, // Đảm bảo nổi trên bản đồ
                    pointerEvents: "none", // QUAN TRỌNG: Để chuột xuyên qua kéo map được
                    fontSize: "40px",
                    filter: "drop-shadow(0px 4px 4px rgba(0,0,0,0.5))"
                }}>
                    📍
                </div>
            )}

            <MapContainer
                center={[16.0471, 108.2068]} // Căn giữa Đà Nẵng

                // --- GIỚI HẠN KHU VỰC VÀ ĐỘ ZOOM ---
                zoom={6}
                minZoom={5} // Không cho zoom xa quá (tránh tải ảnh toàn thế giới)
                maxZoom={18} // Không cho zoom gần quá mức cần thiết
                maxBounds={vietnamBounds} // Khóa camera, không cho kéo ra khỏi Việt Nam
                maxBoundsViscosity={1.0} // Hiệu ứng "đập tường" dội lại khi kéo ra rìa

                scrollWheelZoom={true}
                style={{ width: "100%", height: "100%" }}
            >
                <FixMapRender />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                    // Các config ẩn giúp tăng tốc độ load:
                    keepBuffer={4}          // Giữ lại 4 lớp ảnh xung quanh ngoài màn hình để khi user kéo nhẹ không bị giật
                    updateWhenZooming={false} // Khi user cuộn chuột liên tục, không tải các ảnh ở giữa chừng, đợi dừng hẳn mới tải
                    updateWhenIdle={true}     // Chỉ tính toán tải ảnh mới khi bản đồ đang đứng im
                    eventHandlers={{
                        load: () => {
                            if (onMapReady) onMapReady();
                        }
                    }}
                />

                <MapController selectedPersonId={selectedPersonId} personList={personList} zoomMode={zoomMode} />

                {/* GẮN BỘ LẮNG NGHE SỰ KIỆN VÀO MAP */}
                <MapEventsHandler
                    onMapClick={onMapClick}
                    isPickingMode={isPickingMode}
                    onCenterChange={onCenterChange}
                />

                <MarkerClusterGroup
                    chunkedLoading
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    iconCreateFunction={createClusterCustomIcon}
                >
                    {personList.map((person) => (
                        <Marker
                            key={person.id}
                            position={[person.lat, person.lon]}
                            icon={createCustomIcon(person.avatar)}
                            eventHandlers={{
                                click: () => {
                                    if (seePersonDetail) seePersonDetail(person.id);
                                }
                            }}
                        />
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
};

export default VietnamMap;