"use client";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import { useEffect } from "react";
import ButtonHandler from "@/components/btn-handler";
import Loader from "@/components/loader";
import { detect, detectAllClasses, detectVideo } from "../utils/detect";
import style from "../style/App.module.css";
import "../style/App.css";

// import "@tensorflow/tfjs-backend-webgl";

export default function Home() {
  const [predicciones, setPredicciones] = useState([
    { clase: "Cargando...", score: 0 },
  ]); // prediction state
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  });
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
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
      if (!yolov8) return;
      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }); // set model & input shape

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  }, []);
  return (
    <div className={style.centeredGrid}>
      <div className={style.app}>
        {loading.loading && (
          <Loader
            text="Cargando modelo..."
            progress={(loading.progress * 100).toFixed(2)}
          />
        )}
        <div className={style.header}>
          <img src="/LogoAdox.png" alt="Logo de ADOX" />

          <p>¡Bienvenido a ADOX HandWash AI! 👏</p>
          <p className={style.description}>
            Este sistema inteligente analiza el lavado de manos en tiempo real,
            detectando movimientos y asegurando un proceso adecuado.
          </p>
          <p>
            Modelo de servicio utilizado:{" "}
            <code className={style.code}>{modelName}</code>
          </p>
        </div>

        <div className={style.content}>
          <img
            src="#"
            ref={imageRef}
            onLoad={() =>
              detectAllClasses(
                imageRef.current,
                model,
                canvasRef.current,
                (pred) => {
                  console.log(pred);
                }
              )
            }
          />
          <video
            autoPlay
            muted
            ref={cameraRef}
            onPlay={() =>
              detectVideo(
                cameraRef.current,
                model,
                canvasRef.current,
                (pred) => {
                  setPredicciones(pred);
                }
              )
            }
          />
          <canvas
            width={model.inputShape[1]}
            height={model.inputShape[2]}
            ref={canvasRef}
          />
        </div>
        <div className={style.prediction}>
          <h2>Predicciones</h2>
          <ul>
            {predicciones.map((pred, index) => (
              <li key={index}>
                {pred.clase} - {pred.score}%
              </li>
            ))}
          </ul>
        </div>
        <ButtonHandler
          imageRef={imageRef}
          cameraRef={cameraRef}
          videoRef={videoRef}
        />
      </div>
    </div>
  );
}
