import React, { useEffect, useState } from "react";
import styles from './TimeProgress.module.css';

interface CircularProgressProps {
    initialTime: number;
    size?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ initialTime, size="100"}) => {
    const [time, setTime] = useState(initialTime);

    useEffect(() => {
        setTime(initialTime); // Se actualiza cuando cambia initialTime
    }, [initialTime]);

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = ((initialTime - time) / initialTime) * circumference;

    return (
        <div className={styles.progressContainer}>
        <svg width={size} height={size} viewBox="0 0 100 100">
            <circle className={styles.backgroundCircle} cx="50" cy="50" r={radius} />
            <circle
            className={styles.progressCircle}
            cx="50"
            cy="50"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform="rotate(-90 50 50)"
            />
            <circle className={styles.innerCircle} cx="50" cy="50" r="30" />
            <text x="52" y="60" textAnchor="middle" className={styles.text}>
                {time}s
            </text>
        </svg>
        </div>
    );
};

export default CircularProgress;
