"use client";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import { useEffect } from "react";
import ButtonHandler from "@/components/btn-handler";
import Loader from "@/components/loader";
import { detect, detectVideo } from "../utils/detect";
import style from "../style/App.module.css";

// import "@tensorflow/tfjs-backend-webgl";

export default function Home() {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  });
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  const modelName = "hands_model";
  useEffect(() => {
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      // warming up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape || [1, 224, 224, 3]);
      const warmupResults = yolov8.execute(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }); // set model & input shape

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  }, []);
  return (
    <div className="grid place-items-center">
      <div className={style.App}>
        {loading.loading && (
          <Loader>
            Cargando modelo... {(loading.progress * 100).toFixed(2)}%
          </Loader>
        )}
        <div className={style.header}>
          <h1>📷 Aplicación de detección de lavado de manos</h1>
          <p>
            ADOX
          </p>
          <p>
            Servicio : <code className={style.code}>{modelName}</code>
          </p>
        </div>

        <div className={style.content}>
          <img
            src="#"
            ref={imageRef}
            onLoad={() => detect(imageRef.current, model, canvasRef.current)}
          />
          <video
            autoPlay
            muted
            ref={cameraRef}
            onPlay={() =>
              detectVideo(cameraRef.current, model, canvasRef.current)
            }
          />
          <canvas
            width={model.inputShape[1]}
            height={model.inputShape[2]}
            ref={canvasRef}
          />
        </div>

        <ButtonHandler
          imageRef={imageRef}
          cameraRef={cameraRef}
        />
      </div>
    </div>
  );
}
