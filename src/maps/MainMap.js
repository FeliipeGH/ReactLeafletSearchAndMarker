import React, {useEffect, useMemo, useRef, useState} from 'react';
import {MapConsumer, MapContainer, TileLayer, useMap} from 'react-leaflet';
import {GeoSearchControl, OpenStreetMapProvider} from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import L from "leaflet";
import LCG from 'leaflet-control-geocoder';
import icon from "./constants";

function LeafletGeoSearch() {
    const map = useMap();
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
        provider,
        showMarker: false,
        searchLabel: "Buscar dirección",
        style: "bar"
    });
    useEffect(() => {
        map.addControl(searchControl);
        // clic on map after loss focus because search
        const inputContent = document.querySelector(".glass ");
        const mapContainer = document.getElementById('mapContainer');
        inputContent.onblur = function () {
            mapContainer.click();
        };

        return () => map.removeControl(searchControl);
    });
    return null;
}

function OnEventClick(map, onMarked) {
    const marker = useRef(null);

    const onInit = () => {
        LCG.L = L;
        const geocoder = LCG.L.Control.Geocoder.nominatim();
        map.on("click", function (e) {
            const {lat, lng} = e.latlng;
            if (marker.current !== null) {
                map.removeLayer(marker.current);
            }
            marker.current = L.marker([lat, lng], {icon}).addTo(map);
            geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), results => {
                let r = results[0];
                if (r) {
                    marker.current.bindPopup(r?.name).openPopup();
                    onMarked(r);
                }
            });
        });
    };

    useEffect(onInit, [map, onMarked]);
    return null;
}

export const MainMap = () => {
    const [markData, setMarkData] = useState({});

    const handleMark = (data) => {
        setMarkData({...data});
    };

    const MapContent = useMemo(() => {
        return (
            <MapContainer center={[18.960336897236065, -99.225899768445]} zoom={12} scrollWheelZoom={true}
                          style={{height: "80%", width: "100%"}} id="mapContainer">
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LeafletGeoSearch/>
                <MapConsumer>
                    {
                        (map) => OnEventClick(map, handleMark)
                    }
                </MapConsumer>
            </MapContainer>
        );
    }, []);

    return (
        <div style={{height: "100vh"}}>
            {MapContent}
            <div style={{
                margin: "0 1rem"
            }}>
                <h2>Dirección seleccionada: </h2>
                <h3>{markData?.name}</h3>
            </div>
        </div>
    );
};
