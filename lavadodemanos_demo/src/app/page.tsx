"use client";
import React, { useRef, useState, useEffect } from "react";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs";
import { Webcam } from "../utils/webcam";
import Loader from "@/components/loader";
import { detectVideo } from "../utils/detect";
import style from '../style/App.module.css';
import SvgIcon from "@/components/IconSteps/IconSteps";
import CircularProgressTime from "@/components/TimeProgress/TimeProgress";
import labels from "../utils/labels.json";
import { capitalizeFirstLetter, playSound } from "@/utils/func.utils";

export default function Home() {
  const time = 15;
  const allowedTrust = 50;
  const [remainingTime, setRemainingTime] = useState(time);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Array(labels.length).fill(false));
  const [predicciones, setPredicciones] = useState([{ clase: "Cargando...", score: 0 }]);
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const [model, setModel] = useState({ net: null, inputShape: [1, 0, 0, 3] });
  const [streaming, setStreaming] = useState(null);

  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const modelName = "hands_model";
  const webcam = new Webcam();

  useEffect(() => {
    let isMounted = true;
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}/model.json`,
        {
          onProgress: (fractions) => {
            if (isMounted) setLoading({ loading: true, progress: fractions });
          },
        }
      );

      const dummyInput = tf.ones(yolov8.inputs[0].shape || [1, 224, 224, 3]);
      const warmupResults = yolov8.execute(dummyInput);

      if (isMounted) {
        setLoading({ loading: false, progress: 1 });
        setModel({ net: yolov8, inputShape: yolov8.inputs[0].shape });
      }

      tf.dispose([warmupResults, dummyInput]);
    });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (predicciones.length > 0) {
      const bestPrediction = predicciones.reduce((max, p) => (p.score > max.score ? p : max), predicciones[0]);
      console.log("Clase: ", bestPrediction.clase, "- Score: ", bestPrediction.score);

      if (bestPrediction.score >= allowedTrust) {
        const stepIndex = labels.indexOf(bestPrediction.clase);
  
        if (stepIndex === currentStep) {
          if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
              setRemainingTime((prev) => {
                if (prev === 1) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                return Math.max(prev - 1, 0);
              });
            }, 1000);
          }
        } else {
          // Si el paso cambia y no se detecta la acción correcta, el temporizador se pausa
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [predicciones]);
  
  // Controla el avance de pasos
  useEffect(() => {
    if (remainingTime === 0 && currentStep < labels.length - 1) {
      playSound();
      setCompletedSteps((prev) => {
        const newSteps = [...prev];
        newSteps[currentStep] = true;
        return newSteps;
      });
      setCurrentStep((prev) => prev + 1);
      setRemainingTime(time); // Reinicia el tiempo pero no lo empieza a contar aún
    }
  }, [remainingTime, currentStep]);
  
  // Limpia el intervalo cuando el componente se desmonta
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);
  

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        if (!streaming) {
          webcam.open(cameraRef.current);
          cameraRef.current.style.display = "block";
          setStreaming(true);
        } else {
          webcam.close(cameraRef.current);
          cameraRef.current.style.display = "none";
          setStreaming(false);
          const ctx = canvasRef.current?.getContext("2d");
          ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [streaming]);

  return (
    <div className={style.centeredGrid}>
      <div className={style.app}>
        {loading.loading && (
          <Loader text="Cargando modelo..." progress={(loading.progress * 100).toFixed(2)} />
        )}
        <div className={style.colum}>
          <div className={style.columnContent1}>
            <h1>{capitalizeFirstLetter(labels[currentStep])}</h1>
            <img src={`/Pasos/Paso${currentStep + 1}.jpg`} alt={`Paso ${currentStep + 1}`} />
          </div>
          <div className={style.columnContent2}>
            <img src="/LogoAdox.png" alt="Logo ADOX" />
            <p className={style.title}>Control de lavado de manos</p>
            <div className={style.divider} />
            <p className={style.subTitles1}>Pasos completados</p>
            <div className={style.IconSteps}>
              {labels.map((_, index) => (
                <SvgIcon
                  key={index}
                  color={completedSteps[index] 
                    ? "#5396ED" 
                    : index === currentStep 
                      ? "#AA4CF2" 
                      : "#D9D9D9"}
                />
              ))}
            </div>
            <p className={style.subTitles2}>Tiempo</p>
            <CircularProgressTime 
              key={remainingTime} 
              initialTime={remainingTime} 
              size="180" 
            />
            <p className={style.text}>
              Mantenga el movimiento hasta completar el tiempo del paso.
            </p>
          </div>
        </div>
        <div className={style.content}>
          <video
            autoPlay
            muted
            ref={cameraRef}
            onPlay={() => detectVideo(
              cameraRef.current,
              model,
              canvasRef.current,
              (pred) => setPredicciones(pred)
            )}
            style={{ width: 0, height: 0 }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
}
