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
  const time = 15; // Cantidad de segundos
  const allowedTrust = 50; // Confianza permitida
  const requiredHits = 10; // Número de aciertos requeridos para completar el paso
  const [remainingTime, setRemainingTime] = useState(time);
  const [currentStep, setCurrentStep] = useState(0); // Índice inicial 0 = Paso 1
  const [completedSteps, setCompletedSteps] = useState(new Array(labels.length).fill(false));
  const [predicciones, setPredicciones] = useState([{ clase: "Cargando...", score: 0 }]);
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const [model, setModel] = useState({ net: null, inputShape: [1, 0, 0, 3] });
  const [hits, setHits] = useState(0); // Contador de aciertos
  const [timerStarted, setTimerStarted] = useState(false); // Estado para controlar si el temporizador ha comenzado
  const [streaming, setStreaming] = useState(null); // Estado para controlar si la cámara está activa
  const [inactivityCounter, setInactivityCounter] = useState(0); // Contador de inactividad
  const [showWarning, setShowWarning] = useState(false); // Estado para mostrar el mensaje de advertencia

  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null); // Referencia para el intervalo
  const webcam = new Webcam(); // Instancia de Webcam
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

  // Controlar el intervalo
  useEffect(() => {
    if (timerStarted) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000); // Intervalo de 1 segundo
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerStarted]);

  // Manejar las predicciones y contar aciertos
  useEffect(() => {
    if (predicciones.length > 0) {
      const bestPrediction = predicciones.reduce((max, p) => (p.score > max.score ? p : max), predicciones[0]);
      console.log("Clase: ", bestPrediction.clase, "- Score: ", bestPrediction.score);

      if (bestPrediction.score >= allowedTrust) {
        const stepIndex = labels.indexOf(bestPrediction.clase);

        // Si la predicción coincide con el paso actual
        if (stepIndex === currentStep) {
          setHits((prev) => prev + 1); // Incrementar el contador de aciertos

          // Si es el primer acierto, iniciar el temporizador
          if (!timerStarted) {
            setTimerStarted(true);
          }

          // Reiniciar el contador de inactividad si se detectan manos
          setInactivityCounter(0);
          setShowWarning(false); // Ocultar el mensaje de advertencia
        }
      } else if (timerStarted) {
        // Solo mostrar la advertencia si el temporizador ha comenzado
        setInactivityCounter((prev) => prev + 1);
        if (inactivityCounter >= 2) {
          setShowWarning(true); // Mostrar el mensaje de advertencia después de 2 segundos
        }
      }
    }
  }, [predicciones, currentStep, timerStarted, inactivityCounter]);

  // Validar el paso cuando el tiempo se agote
  useEffect(() => {
    if (remainingTime === 0 && timerStarted) {
      if (hits >= requiredHits) {
        console.log(`Paso ${currentStep + 1} completado correctamente.`);
        if (!completedSteps[currentStep]) playSound();
        setCompletedSteps((prev) => {
          const newSteps = [...prev];
          newSteps[currentStep] = true;
          return newSteps;
        });

        if (currentStep < labels.length - 1) {
          setCurrentStep((prev) => prev + 1);
          setRemainingTime(time);
          setHits(0);
          setTimerStarted(false);
        }
      } else {
        console.log(`Paso ${currentStep + 1} no se completó correctamente.`);
        setRemainingTime(time);
        setHits(0);
        setTimerStarted(false);
      }
    }
  }, [remainingTime, currentStep, hits, timerStarted]);

  // Manejar el contador de inactividad
  useEffect(() => {
    if (inactivityCounter >= 20) {
      setCurrentStep(0);
      setCompletedSteps(new Array(labels.length).fill(false));
      setRemainingTime(time);
      setHits(0);
      setTimerStarted(false);
      setInactivityCounter(0);
      setShowWarning(false);
    }
  }, [inactivityCounter]);

  // Manejador de eventos de teclado
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        if (streaming === null) {
          webcam.open(cameraRef.current);
          cameraRef.current.style.display = "block";
          setStreaming("camera");
        } else if (streaming === "camera") {
          webcam.close(cameraRef.current);
          cameraRef.current.style.display = "none";
          setStreaming(null);
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [streaming]);

  return (
    <div className={style.centeredGrid}>
      <div className={style.app}>
        {loading.loading && <Loader text="Cargando modelo..." progress={(loading.progress * 100).toFixed(2)} />}
        <div className={style.colum}>
          <div className={style.columnContent1}>
            <h1>{capitalizeFirstLetter(labels[currentStep])}</h1>
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
                  color={completedSteps[index] ? "#5396ED" : index === currentStep ? "#AA4CF2" : "#D9D9D9"}
                />
              ))}
            </div>
            <p className={style.subTitles2}>Tiempo</p>
            <CircularProgressTime key={remainingTime} initialTime={remainingTime} size="180" />
            {showWarning && streaming === "camera" ? (
              <p className={style.warningMessage}>Detección insuficiente. Acérquelas a la cámara para evitar el reinicio</p>
            ) : (
              <p className={style.text}>
                Debe continuar realizando el mismo movimiento como se muestra en la imagen izquierda, respetando el ángulo y movimiento para completar
                este paso correctamente durante el transcurso del tiempo.
              </p>
            )}
          </div>
        </div>
        <div className={style.content}>
          <video
            autoPlay
            muted
            ref={cameraRef}
            onPlay={() => detectVideo(cameraRef.current, model, canvasRef.current, (pred) => setPredicciones(pred))}
            style={{ width: 0, height: 0 }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} /> {/* Canvas oculto */}
        </div>
      </div>
    </div>
  );
}