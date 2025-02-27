"use client";
import React, { useRef, useState, useEffect } from "react";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs";
import ButtonHandler from "@/components/Button/btn-handler";
import Loader from "@/components/loader";
import { detectVideo } from "../utils/detect";
import style from '../style/App.module.css';
import SvgIcon from "@/components/IconSteps/IconSteps";
import CircularProgressTime from "@/components/TimeProgress/TimeProgress";
import labels from "../utils/labels.json";

export default function Home() {
  const time = 15; // Cantidad de segundos
  const allowedTrust = 60; // Confianza permitida
  const [remainingTime, setRemainingTime] = useState(time);
  const [currentStep, setCurrentStep] = useState(0); // Índice inicial 0 = Paso 1
  const [completedSteps, setCompletedSteps] = useState(new Array(labels.length).fill(false)); // [false, false, false, false, false, false]
  const [predicciones, setPredicciones] = useState([{ clase: "Cargando...", score: 0 }]);
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const [model, setModel] = useState({ net: null, inputShape: [1, 0, 0, 3] });
  const [isTimerRunning, setIsTimerRunning] = useState(false); // Estado booleano para controlar el temporizador

  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null); // Referencia para el intervalo
  const animationFrameRef = useRef(null); // Referencia para requestAnimationFrame
  const prediccionesRef = useRef(predicciones); // Referencia para las predicciones

  const modelName = "hands_model";

  // Cargar el modelo de TensorFlow.js
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
        setModel({ net: yolov8, inputShape: yolov8.inputs[0].shape });
      }

      tf.dispose([warmupResults, dummyInput]);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Controlar el intervalo basado en isTimerRunning
  useEffect(() => {
    if (isTimerRunning) {
      // Iniciar el intervalo si el temporizador está activo
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev > 0) return prev - 1;
          return 0;
        });
      }, 500); // Intervalo de medio segundo...
    } else {
      // Detener el intervalo si el temporizador no está activo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Limpiar el intervalo al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning]);

  // Manejar las predicciones y actualizar isTimerRunning
  useEffect(() => {
    if (predicciones.length > 0) {
      const bestPrediction = predicciones.reduce((max, p) => (p.score > max.score ? p : max), predicciones[0]);
      console.log("Clase: ", bestPrediction.clase, "- Score: ", bestPrediction.score);

      if (bestPrediction.score >= allowedTrust) {
        const stepIndex = labels.indexOf(bestPrediction.clase);

        // Si la predicción coincide con el paso actual, activar el temporizador
        if (stepIndex === currentStep) {
          setIsTimerRunning(true);
        } else {
          setIsTimerRunning(false);
        }
      } else {
        setIsTimerRunning(false);
      }
    }
  }, [predicciones, currentStep]);

  useEffect(() => {
    if (remainingTime === 0) {
      setIsTimerRunning(false);
  
      setCompletedSteps((prev) => {
        const newSteps = [...prev];
        newSteps[currentStep] = true;
        return newSteps;
      });
  
      // Solo avanzar si NO estamos en el último paso
      if (currentStep < labels.length - 1) {
        setCurrentStep((prev) => prev + 1);
        setRemainingTime(time);
      }
    }
  }, [remainingTime, currentStep, labels.length]);
  
    // Inicializar detectVideo solo cuando el modelo esté listo y el video esté en reproducción
    useEffect(() => {
      if (!loading.loading && cameraRef.current && model.net) {
        const detectFrame = async () => {
          if (cameraRef.current && cameraRef.current.readyState === 4) { // Verificar si el video está listo
            await detectVideo(
              cameraRef.current,
              model,
              canvasRef.current,
              (pred) => {
                // Solo actualizar el estado si las predicciones cambian significativamente
                if (JSON.stringify(pred) !== JSON.stringify(prediccionesRef.current)) {
                  prediccionesRef.current = pred; // Actualizar la referencia
                  setPredicciones(pred); // Actualizar el estado
                }
              }
            );
          }
          animationFrameRef.current = requestAnimationFrame(detectFrame); // Siguiente fotograma
        };
    
        cameraRef.current.onplay = () => {
          detectFrame(); // Iniciar la detección cuando el video comience a reproducirse
        };
    
        // Limpiar recursos al desmontar
        return () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          if (cameraRef.current && cameraRef.current.srcObject) {
            const stream = cameraRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop()); // Detener todas las pistas de la cámara
          }
        };
      }
    }, [loading.loading, model]);
    
  return (
    <div className={style.centeredGrid}>
      <div className={style.app}>
        {loading.loading && (
          <Loader text="Cargando modelo..." progress={(loading.progress * 100).toFixed(2)} />
        )}
        <div className={style.colum}>
          <div className={style.columnContent1}>
            <h1>Paso {currentStep + 1}</h1>
            <img src={`/Pasos/Paso${currentStep + 1}.jpg`} alt={`Paso ${currentStep + 1}`} />
          </div>
          <div className={style.columnContent2}>
            <img src="/LogoAdox.png" alt="Logo de ADOX" />
            <p className={style.title}>Control de lavado de manos</p>
            <div className={style.divider} />
            <p className={style.subTitles1}>Pasos completados</p>
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
            <CircularProgressTime key={remainingTime} initialTime={remainingTime} size="180" />
            <p className={style.text}>Debe continuar realizando el mismo movimiento de manera constante para completar este paso correctamente durante el transcurso del tiempo.</p>
            {/* <div className={style.divider} /> */}
          </div>
        </div>
        <div className={style.content}>
          <video
            autoPlay
            muted
            ref={cameraRef}
            style={{ width: 0, height: 0 }}
          />
        </div>
        <ButtonHandler cameraRef={cameraRef} />
      </div>
    </div>
  );
}