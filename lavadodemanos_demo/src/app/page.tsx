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
  const time: number = 15; // Cantidad de segundos
  const allowedTrust: number = 60; // Confianza permitida
  const [remainingTime, setRemainingTime] = useState(time);
  const [currentStep, setCurrentStep] = useState(0); //Index incial 0 = Paso 1. Despues se va sumando hasta 5 cada uno representa un index de las clases.
  const [completedSteps, setCompletedSteps] = useState(new Array(labels.length).fill(false)); // Valor inical => [false, false, false, false, false, false]
  const [predicciones, setPredicciones] = useState([{ clase: "Cargando...", score: 0 }]);
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
        setModel({ net: yolov8, inputShape: yolov8.inputs[0].shape });
      }

      tf.dispose([warmupResults, dummyInput]);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Efecto para actualizar el tiempo en base a predicciones
  useEffect(() => {
    if (predicciones.length > 0) {
      //Esto encuentra la predicción con el score más alto...
      const bestPrediction = predicciones.reduce((max, p) => (p.score > max.score ? p : max), predicciones[0]);

      console.log(`Mejor predicción: ${bestPrediction.clase} - ${bestPrediction.score}`);

      // Si la predicción tiene suficiente score (≥ 60%) y es el paso actual, reducimos el tiempo en 1s.
      if (bestPrediction.score >= allowedTrust) {
        const stepIndex = labels.indexOf(bestPrediction.clase);
        
        // Si stepIndex es igual a currentStep, significa que la persona está haciendo el movimiento correcto y se reduce el tiempo.
        if (stepIndex === currentStep) {
          // TODO: El bardo esta aca. Aunque se habilite el paso 2, si en la secuencia anterior el tiempo del paso 1 seguía reduciéndose, este continúa restándose incluso después de avanzar al siguiente paso.
          setInterval(() => {
            setRemainingTime((prev) => Math.max(prev - 1, 0));
          }, 1000); // Reducir tiempo sin que sea negativo
          
          if (remainingTime === 0 && currentStep < labels.length - 1) {
            setCompletedSteps((prev) => {
              const newSteps = [...prev];
              newSteps[currentStep] = true;
              return newSteps;
            });
            setCurrentStep((prev) => prev + 1);
      
            // Reiniciar el tiempo correctamente al cambiar de paso
            setRemainingTime(time);
          }
        }
      }
    }
  }, [predicciones, currentStep]);

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
            <div className={style.divider}/>
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
            <p>Debe continuar realizando el mismo movimiento de manera constante para completar este paso correctamente durante el transcurso del tiempo.</p>
            <div className={style.divider}/>
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
        </div>
        <ButtonHandler cameraRef={cameraRef} />
      </div>
    </div>
  );
}
