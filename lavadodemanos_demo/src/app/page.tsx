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
  const time = 15; // Tiempo total de cada paso (en segundos)
  const allowedTrust = 50; // Confianza permitida para que un movimiento se considere válido
  const [remainingTime, setRemainingTime] = useState(time); // Tiempo restante para completar el paso
  const [currentStep, setCurrentStep] = useState(0); // Índice del paso actual
  const [completedSteps, setCompletedSteps] = useState(new Array(labels.length).fill(false)); // Estado de pasos completados
  const [predicciones, setPredicciones] = useState([{ clase: "Cargando...", score: 0 }]); // Predicciones de TensorFlow
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // Estado de carga
  const [model, setModel] = useState({ net: null, inputShape: [1, 0, 0, 3] }); // Modelo cargado de TensorFlow
  const [timeAccrued, setTimeAccrued] = useState(0); // Tiempo acumulado (en segundos)
  const [timerRunning, setTimerRunning] = useState(false); // Si el temporizador está corriendo
  const [timerStarted, setTimerStarted] = useState(false); // Si el temporizador ha comenzado
  const [streaming, setStreaming] = useState(null); // Estado de la cámara

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

  // Controlar el intervalo del temporizador
  useEffect(() => {
    if (timerStarted && timerRunning) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev > 0) return prev - 1;
          return 0;
        });
      }, 1000); // Intervalo de 1 segundo
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerStarted, timerRunning]);

  // Manejar las predicciones y acumular el tiempo de aciertos
  useEffect(() => {
    if (predicciones.length > 0) {
      const bestPrediction = predicciones.reduce((max, p) => (p.score > max.score ? p : max), predicciones[0]);
      console.log("Clase: ", bestPrediction.clase, "- Score: ", bestPrediction.score);

      if (bestPrediction.score >= allowedTrust) {
        const stepIndex = labels.indexOf(bestPrediction.clase);

        // Si la predicción coincide con el paso actual
        if (stepIndex === currentStep) {
          // Si el temporizador no ha comenzado, iniciarlo
          if (!timerStarted) {
            setTimerStarted(true);
          }

          // Si el tiempo no está corriendo, comenzar a acumularlo
          if (!timerRunning) {
            setTimerRunning(true);
            setTimeAccrued((prev) => prev + 1); // Acumular 1 segundo cuando el movimiento es detectado
          }
        }
      } else {
        // Si el movimiento no es detectado correctamente, detener el temporizador
        if (timerRunning) {
          setTimerRunning(false);
        }
      }
    }
  }, [predicciones, currentStep, timerStarted, timerRunning]);

  // Validar el paso cuando el tiempo se agote
  useEffect(() => {
    if (remainingTime === 0 && timerStarted) {

      console.log("timeAccrued: ",timeAccrued);
      console.log("time: ", time);
      
      if (timeAccrued >= time) {

        console.log(`Paso ${currentStep + 1} completado correctamente.`);
        
        // Solo reproducir el sonido si el paso no ha sido completado previamente
        if (!completedSteps[currentStep]) {
          playSound();
        }

        setCompletedSteps((prev) => {
          const newSteps = [...prev];
          newSteps[currentStep] = true;
          return newSteps;
        });

        // Solo avanzar si NO estamos en el último paso
        if (currentStep < labels.length - 1) {
          setCurrentStep((prev) => prev + 1);
          setRemainingTime(time); // Reiniciar el tiempo
          setTimeAccrued(0); // Reiniciar el tiempo acumulado
          setTimerStarted(false); // Reiniciar el estado del temporizador
          setTimerRunning(false); // Detener el temporizador
        }
      } else {
        console.log(`Paso ${currentStep + 1} no se completó correctamente.`);
        setRemainingTime(time); // Reiniciar el tiempo
        setTimeAccrued(0); // Reiniciar el tiempo acumulado
        setTimerStarted(false); // Reiniciar el estado del temporizador
        setTimerRunning(false); // Detener el temporizador
      }
    }
  }, [remainingTime, currentStep, timeAccrued, timerStarted]);

  // Manejador de eventos de teclado
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        if (streaming === null) {
          webcam.open(cameraRef.current); // Abrir la cámara
          cameraRef.current.style.display = "block"; // Mostrar la cámara
          setStreaming("camera"); // Establecer el estado de streaming
        } else if (streaming === "camera") {
          webcam.close(cameraRef.current); // Cerrar la cámara
          cameraRef.current.style.display = "none"; // Ocultar la cámara
          setStreaming(null); // Reiniciar el estado de streaming

          // Limpiar el canvas cuando se cierra la cámara
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          }
        }
      }
    };

    // Agregar el manejador de eventos al documento
    document.addEventListener("keydown", handleKeyPress);

    // Limpiar el manejador de eventos al desmontar el componente
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
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
          </div>
        </div>
        <div className={style.content}>
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
            style={{ width: 0, height: 0 }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} /> {/* Canvas oculto */}
        </div>
      </div>
    </div>
  );
}
