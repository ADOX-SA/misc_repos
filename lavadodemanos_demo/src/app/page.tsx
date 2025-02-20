"use client";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import { useEffect } from "react";
import ButtonHandler from "@/components/btn-handler";
import Loader from "@/components/loader";
import { detect, detectVideo } from "../utils/detect";
import style from '../style/App.module.css';
import "../style/App.css";
import SvgIcon from "@/components/IconSteps/IconSteps";
import CircularProgressTime from "@/components/TimeProgress/TimeProgress";

// import "@tensorflow/tfjs-backend-webgl";

export default function Home() {
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
          <Loader text="Cargando modelo..." progress={(loading.progress * 100).toFixed(2)} />
        )}
      <div className={style.colum}>
          <div className={style.columnContent1}>
            <h1>Paso 4</h1>
            <img src="/Pasos/Paso4.jpg" alt="Paso de lavado de mano" />
          </div>
        <div className={style.columnContent2}>
          <img src="/LogoAdox.png" alt="Logo de ADOX" />
          <p className={style.title}>Control de lavado de manos</p>
          <div className={style.divider}/>
          <p className={style.subTitles1}>Pasos completados</p>
          {/* Iconos de pasos completados*/}
          {/* TODO:Mapear esto... */}
          <div className={style.IconSteps}>
            <SvgIcon color="#5396ED"/>
            <SvgIcon color="#5396ED"/>
            <SvgIcon color="#5396ED"/>
            <SvgIcon color="#AA4CF2"/>
            <SvgIcon/>
            <SvgIcon/>
            <SvgIcon/>
          </div>
          <p className={style.subTitles2}>Tiempo</p>
          {/* barra grafica de tiempo */}
          <CircularProgressTime initialTime={16} size="180"/>
          <p>Debe continuar realizando el mismo movimiento de manera constante para completar este paso correctamente durante el transcurso del tiempo.</p>
          <div className={style.divider}/>
        </div>
      </div>

        {/* <div className={style.content}>
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
          videoRef={videoRef}
        /> */}
      </div>
    </div>
  );
}
