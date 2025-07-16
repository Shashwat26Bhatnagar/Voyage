import React from "react";
import { InfoWindow as GInfoWindow } from "@vis.gl/react-google-maps";

const InfoWindow = ({ place, anchor, onCloseClick }) => {
  const { name, address } = place;

  return (
    <GInfoWindow anchor={anchor} onCloseClick={onCloseClick}>
      <div className="info-window">
        <div className="info-window-content">
          <div className="info-window-details">
            <h2 className="info-window-title">{name}</h2>
          </div>
        </div>
        <div className="info-window-address">{address}</div>
      </div>
    </GInfoWindow>
  );
};

export default InfoWindow;
