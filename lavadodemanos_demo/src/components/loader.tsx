import React from "react";
import style from "../style/loader.module.css";

type LoaderProps = {
  text: string;
  progress: string;
};

const Loader: React.FC<LoaderProps> = ({ text, progress }) => {
  // Convertimos el progress a número, asegurando que sea válido
  const progressValue = parseFloat(progress);

  return (
    <div className={style.body}>
      <div className={style.content}>
        <img src="/LogoAdox.png" alt="Logo de ADOX" />
        <p className={style.title}>Lavado de manos</p>
        <p className={style.text}>{text}</p>

        {/* Contenedor de la barra de progreso */}
        <div className={style.progressContainer}>
          <p className={style.progressText}>{progressValue.toFixed(2)}%</p>
          
          <div className={style.progressBar}>
            <div
              className={style.progressFill}
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
