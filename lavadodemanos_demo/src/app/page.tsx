"use client";
import React, { useRef, useState } from "react";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import * as tf from "@tensorflow/tfjs";
import { useEffect } from "react";
import ButtonHandler from "@/components/Button/btn-handler";
import Loader from "@/components/loader";
import { detectVideo } from "../utils/detect";
import style from '../style/App.module.css';
import SvgIcon from "@/components/IconSteps/IconSteps";
import CircularProgressTime from "@/components/TimeProgress/TimeProgress";
import labels from "../utils/labels.json";

export default function Home() {
  const time: number = 10;
  const [remainingTime, setRemainingTime] = useState(time);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Array(labels.length).fill(false));
  const [isDetecting, setIsDetecting] = useState(false);
  const [validPredictionsCount, setValidPredictionsCount] = useState(0);
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const [model, setModel] = useState({ net: null, inputShape: [1, 0, 0, 3] });

  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  const modelName = "hands_model";
  useEffect(() => {
    let isMounted = true;
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}/model.json`,
        {
          onProgress: (fractions) => {
            if (isMounted) {
              setLoading({ loading: true, progress: fractions });
            }
          },
        }
      );
  
      const dummyInput = tf.ones(yolov8.inputs[0].shape || [1, 224, 224, 3]);
      const warmupResults = yolov8.execute(dummyInput);
  
      if (isMounted) {
        setLoading({ loading: false, progress: 1 });
        setModel({
          net: yolov8,
          inputShape: yolov8.inputs[0].shape,
        });
      }
  
      tf.dispose([warmupResults, dummyInput]);
    });
  
    return () => {
      isMounted = false;
    };
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
            {labels.map((_, index) => (
              <SvgIcon 
                key={index} 
                color={
                  completedSteps[index] 
                    ? "#5396ED" 
                    : index === currentStep 
                      ? "#AA4CF2"
                      : "#D9D9D9"
                } 
              />
            ))}
          </div>

          <p className={style.subTitles2}>Tiempo</p>
          {/* barra grafica de tiempo */}
          <CircularProgressTime initialTime={remainingTime} size="180" />
          <p>Debe continuar realizando el mismo movimiento de manera constante para completar este paso correctamente durante el transcurso del tiempo.</p>
          <div className={style.divider}/>
        </div>
      </div>        
      <div className={style.content}>
          <video
            autoPlay
            muted
            ref={cameraRef}
            onPlay={() => {
              setIsDetecting(true);
              detectVideo(
                cameraRef.current,
                model,
                canvasRef.current,
                (pred) => {
                  const maxConfidence = Math.max(...pred.map(p => p.score * 100));

                  if (maxConfidence >= 60) {
                    setValidPredictionsCount(prev => prev + 1);

                    if (validPredictionsCount + 1 >= 10) {
                      setRemainingTime(prev => Math.max(prev - 1, 0));
                      setValidPredictionsCount(0); // Reinicia el contador de predicciones exitosas
                    }
                  } else {
                    setValidPredictionsCount(0); // Reinicia si no se alcanza el umbral
                  }

                  if (remainingTime <= 0) {
                    setCompletedSteps(prev => {
                      const updatedSteps = [...prev];
                      updatedSteps[currentStep] = true;
                      return updatedSteps;
                    });

                    setCurrentStep(prev => Math.min(prev + 1, labels.length - 1));
                    setRemainingTime(time);
                  }
                }
              );
            }}
            style={{ width: 0, height: 0 }}
          />
        </div>

        <ButtonHandler
          cameraRef={cameraRef}
        />
      </div>
    </div>
  );
}

