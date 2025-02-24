import React, { useEffect, useState } from "react";
import styles from './TimeProgress.module.css';

interface CircularProgressProps {
    initialTime: number;
    size?: string;
    timeIsUp:React.Dispatch<React.SetStateAction<boolean>>;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ initialTime, size="100", timeIsUp}) => {
    const [time, setTime] = useState(initialTime);

    useEffect(() => {
        if (time > 0) {
        const timer = setInterval(() => {
            setTime((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
        } else {
            if(time == 0){
                timeIsUp(true);
            }
        }
    }, [time]);

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = ((initialTime - time) / initialTime) * circumference;

    return (
        <div className={styles.progressContainer}>
        <svg width={size} height={size} viewBox="0 0 100 100">
            <circle
            className={styles.backgroundCircle}
            cx="50"
            cy="50"
            r={radius}
            />
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
