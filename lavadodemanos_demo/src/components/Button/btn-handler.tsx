import React, { useState } from "react";
import { Webcam } from "../../utils/webcam";
import style from './Button.module.css';

interface ButtonProps {
  cameraRef: React.RefObject<null>;
}

const ButtonHandler: React.FC<ButtonProps>= ({ cameraRef }) => {
  const [streaming, setStreaming] = useState(null); // streaming state
  const webcam = new Webcam(); // webcam handler

  return (
    <div className={style.button}>
      {/* Webcam Handler */}
      <button
        onClick={() => {
          // if not streaming
          if (streaming === null) {
            webcam.open(cameraRef.current); // open webcam
            cameraRef.current.style.display = "block"; // show camera
            setStreaming("camera"); // set streaming to camera
          }
          // closing video streaming
          else if (streaming === "camera") {
            webcam.close(cameraRef.current);
            cameraRef.current.style.display = "none";
            setStreaming(null);
          }
        }}
      >
        {streaming === "camera" ? "Close" : "Open"} Webcam
      </button>
    </div>
  );
};

export default ButtonHandler;
