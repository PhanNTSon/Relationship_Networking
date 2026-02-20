import { React, useContext, useState, useEffect, useRef } from "react";
import VietnamMap from "../../components/VietnamMap";
import "./MainPage.css";
import { AppCtx } from "../../context/AppContext";

export default function MainPage() {
    const { jwt, role } = useContext(AppCtx)

    const containerRef = useRef(null)
    const [size, setSize] = useState({ width: 0, height: 0 })

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

    return (
        <div id="main-page">
            <div id="container" ref={containerRef}>
                <div className="layers" id="map-layer">
                    <VietnamMap
                        width={size.width}
                        height={size.height}
                    />
                </div>
                <div className="layers" id="tool-layer"></div>
            </div>
        </div>
    )
}

