import React, { useState } from "react";
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
const VietnamMap = ({ width = 800, height = 600, personList, seePersonDetail }) => {
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
                            />
                        ))
                    }
                </Geographies>
                {
                    makers.map(
                        (maker) => (
                            <Marker key={maker.key} coordinates={maker.coordinates}>

                                {/* Định nghĩa phần ảnh được chèn vào*/}
                                <defs>
                                    <clipPath id={`clip-${maker.key}`}>
                                        <circle r={makerImgRadius} />
                                    </clipPath>
                                </defs>

                                <circle r={makerTotalRadius} fill={makerFill} stroke="#fff" strokeWidth={1} />
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
