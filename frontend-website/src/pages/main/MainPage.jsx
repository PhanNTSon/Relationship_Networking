import { React, useContext, useState, useEffect, useRef } from "react";
import VietnamMap from "../../components/VietnamMap";
import "./MainPage.css";
import { AppCtx } from "../../context/AppContext";

export default function MainPage() {
    const { jwt, role, setPersons } = useContext(AppCtx)

    const containerRef = useRef(null)
    const [size, setSize] = useState({ width: 0, height: 0 })

    const persons = [
        {
            id: "user_001",
            avatar: "https://i.pravatar.cc/150?img=11", // Ảnh giả lập từ pravatar
            name: "Nguyễn Văn A",
            lon: 105.8542, // Hà Nội
            lat: 21.0285
        },
        {
            id: "user_002",
            avatar: "https://i.pravatar.cc/150?img=32",
            name: "Trần Thị B",
            lon: 106.6297, // TP. Hồ Chí Minh
            lat: 10.8231
        },
        {
            id: "user_003",
            avatar: "https://i.pravatar.cc/150?img=68",
            name: "Lê Văn C",
            lon: 108.2068, // Đà Nẵng
            lat: 16.0471
        },
        {
            id: "user_004",
            avatar: "https://i.pravatar.cc/150?img=47",
            name: "Phạm Thị D",
            lon: 105.7469, // Cần Thơ
            lat: 10.0452
        },
        {
            id: "user_005",
            avatar: "https://i.pravatar.cc/150?img=12",
            name: "Hoàng Văn E",
            lon: 109.1967, // Nha Trang (Khánh Hòa)
            lat: 12.2388
        }
    ]

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

    }, [])

    return (
        <div id="main-page">
            <div id="container" ref={containerRef}>
                <div className="layers" id="map-layer">
                    <VietnamMap
                        width={size.width}
                        height={size.height}
                        personList={persons}
                        seePersonDetail={seePersonDetail}
                    />

                </div>
                <div className="layers" id="tool-layer"></div>
            </div>
        </div>
    )
}

function seePersonDetail(person) {

}

