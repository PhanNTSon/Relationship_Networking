import React, { useState } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
    Marker
} from "react-simple-maps";
import vietnamMap from "../assets/vn-all2.geo.json";

const VietnamMap = ({ width, height }) => {
    const [position, setPosition] = useState({
        coordinates: [width / 2, height / 2],
        zoom: 1,
    });

    const [activeMarker, setActiveMarker] = useState(null);

    return (
        <ComposableMap projection="geoIdentity" width={width ? width : 800} height={height ? height : 600}>
            

            <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates}
                minZoom={1}
                maxZoom={8}
                onMoveEnd={setPosition}
                translateExtent={[

                    [0, 0],
                    [width, height]
                ]}

            >
                <Geographies geography={vietnamMap}>
                    {({ geographies, projection }) => {
                        projection.reflectY(true);
                        projection.fitSize(
                            [width, height],
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
                                style={{
                                    default: { outline: "none" },
                                    hover: { fill: "#B2EBF2", outline: "none" },
                                    pressed: { outline: "none" },
                                }}
                            />
                        ));
                    }}
                </Geographies>

            </ZoomableGroup>
        </ComposableMap>
    );
};

export default VietnamMap;
