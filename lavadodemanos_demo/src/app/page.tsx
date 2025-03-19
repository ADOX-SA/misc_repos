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
  const requiredHits = 10;
  const [remainingTime, setRemainingTime] = useState(time);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Array(labels.length).fill(false));
  const [predicciones, setPredicciones] = useState<{ clase: string; score: number }[]>([]); // Corregido: estado inicial vacío
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const [model, setModel] = useState<{ net: tf.GraphModel | null; inputShape: number[] }>({ net: null, inputShape: [1, 0, 0, 3] });
  const [hits, setHits] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [streaming, setStreaming] = useState<"camera" | null>(null);
  const [inactivityCounter, setInactivityCounter] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const [consecutiveNoHandsFrames, setConsecutiveNoHandsFrames] = useState(0);

  const stopDetectionRef = useRef<() => void>(() => {});
  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const webcam = new Webcam();
  const modelName = "hands_model";

  // Cargar modelo
  useEffect(() => {
    let isMounted = true;
    tf.ready().then(async () => {
      try {
        const yolov8 = await tf.loadGraphModel(
          `${window.location.href}/${modelName}/model.json`,
          { onProgress: (fractions) => isMounted && setLoading({ loading: true, progress: fractions }) }
        );

        const dummyInput = tf.ones(yolov8.inputs[0].shape || [1, 224, 224, 3]);
        const warmupResults = yolov8.execute(dummyInput);

        if (isMounted) {
          setLoading({ loading: false, progress: 1 });
          setModel({ net: yolov8, inputShape: yolov8.inputs[0].shape });
        }

        tf.dispose([warmupResults, dummyInput]);
      } catch (error) {
        console.error("Error cargando el modelo:", error);
      }
    });

    return () => { isMounted = false; };
  }, []);

  // Temporizador principal
  useEffect(() => {
    if (timerStarted) {
      intervalRef.current = setInterval(() => {
        setRemainingTime(prev => Math.max(prev - 1, 0));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerStarted]);

// useEffect para predicciones y manejo de inactividad
useEffect(() => {
  if (predicciones.length === 0) {
    setConsecutiveNoHandsFrames(prev => {
      if (prev < 5) return prev + 1;
      else {
        if (timerStarted) {
          setInactivityCounter(prev => prev + 1); // Incrementar inactividad cada 5 fotogramas
          console.log("Inactividad detectada (5 fotogramas sin manos)");
        }
        return 0; // Reiniciar contador de fotogramas
      }
    });
  } else {
    setConsecutiveNoHandsFrames(0); // Resetear si hay manos
    const bestPrediction = predicciones.reduce((max, p) => (p.score > max.score ? p : max), predicciones[0]);
    const isValid = bestPrediction.score >= allowedTrust && labels.indexOf(bestPrediction.clase) === currentStep;

    if (isValid) {
      setHits(prev => prev + 1);
      if (!timerStarted) setTimerStarted(true);
      setInactivityCounter(0);
    } else if (timerStarted) {
      setInactivityCounter(prev => prev + 1); // Inactividad por paso incorrecto (sin esperar 5 fotogramas)
    }
  }
}, [predicciones, currentStep, timerStarted]);

  // Mostrar advertencia después de 2 segundos de inactividad
  useEffect(() => {
    setShowWarning(inactivityCounter >= 2);
  }, [inactivityCounter]);

  // Reinicio total después de 20 segundos de inactividad
  useEffect(() => {
    if (inactivityCounter >= 20) {
      setCurrentStep(0);
      setCompletedSteps(new Array(labels.length).fill(false));
      setRemainingTime(time);
      setHits(0);
      setTimerStarted(false);
      setInactivityCounter(0);
    }
  }, [inactivityCounter]);

  // Validar paso al terminar el tiempo
  useEffect(() => {
    if (remainingTime === 0 && timerStarted) {
      const success = hits >= requiredHits;
      console.log(`Paso ${currentStep + 1} ${success ? "completado" : "fallado"}`);

      if (success) {
        if (!completedSteps[currentStep]) playSound();
        setCompletedSteps(prev => prev.map((v, i) => i === currentStep ? true : v));
        
        if (currentStep < labels.length - 1) {
          setCurrentStep(prev => prev + 1);
          setRemainingTime(time);
          setHits(0);
          setTimerStarted(false);
        }
      } else {
        setRemainingTime(time);
        setHits(0);
        setTimerStarted(false);
      }
    }
  }, [remainingTime, hits, timerStarted]);

  // Manejo de cámara
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (!streaming) {
          webcam.open(cameraRef.current!);
          cameraRef.current!.style.display = "block";
          setStreaming("camera");
        } else {
          webcam.close(cameraRef.current!);
          cameraRef.current!.style.display = "none";
          setStreaming(null);
          
          stopDetectionRef.current?.();
          canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
          onPlay={() => {
            // Detener cualquier detección previa
            if (stopDetectionRef.current) stopDetectionRef.current();
            
            // Iniciar nueva detección y guardar la función de detención
            stopDetectionRef.current = detectVideo(
              cameraRef.current,
              model,
              canvasRef.current,
              allowedTrust,
              (pred) => setPredicciones(pred)
            );
          }}
          style={{ width: 0, height: 0 }}
        />
          <canvas ref={canvasRef} style={{ display: "none" }} /> {/* Canvas oculto */}
        </div>
      </div>
    </div>
  );
}