export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const playSound = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const audio = new Audio('/sounds/success.mp3');
        audio.play()
        .then(() => resolve())
        .catch(error => {
            console.error('Error al reproducir el sonido:', error);
            reject(error);
        });
    });
};