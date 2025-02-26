import * as tf from "@tensorflow/tfjs";
import labels from "./labels.json";

const numClass = labels.length;

/**
 * Preprocess image / frame before forwarded into the model
 * @param {HTMLVideoElement|HTMLImageElement} source
 * @param {Number} modelWidth
 * @param {Number} modelHeight
 * @returns input tensor, xRatio and yRatio
 */
const preprocess = (
    source: HTMLVideoElement | HTMLImageElement,
    modelWidth: number,
    modelHeight: number
) => {
  let xRatio, yRatio; // ratios for boxes

    const input = tf.tidy(() => {
        const img = tf.browser.fromPixels(source);

        // padding image to square => [n, m] to [n, n], n > m
        const [h, w] = img.shape.slice(0, 2); // get source width and height
        const maxSize = Math.max(w, h); // get max size
        const imgPadded = img.pad([
        [0, maxSize - h], // padding y [bottom only]
        [0, maxSize - w], // padding x [right only]
        [0, 0],
        ]);

    xRatio = maxSize / w; // update xRatio
    yRatio = maxSize / h; // update yRatio

    return tf.image
      .resizeBilinear(imgPadded as tf.Tensor3D, [modelWidth, modelHeight]) // resize frame
      .div(255.0) // normalize
      .expandDims(0); // add batch
    });

    return [input, xRatio, yRatio];
};

/**
 * Function to detect video from every source.
 * @param {HTMLVideoElement} vidSource video source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 */

export const detectAllClasses = async (
    source: HTMLImageElement | HTMLVideoElement,
    model: {
        net: tf.GraphModel;
        inputShape: number[];
    },
    canvasRef: HTMLCanvasElement,
    callback: (predicciones: { clase: string; score: number }[]) => void
) => {
  if (model == null || model.inputShape == undefined) return; // handle if model is not loaded
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); // get model width and height

  tf.engine().startScope(); // start scoping tf engine
  const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight); // preprocess image

  // ACA ES LA PREDICCION
  //EJECUTA EL MODELO SOBRE LA IMAGEN PREPROCESSADA
    if (!input) {
        throw new Error("Input tensor is undefined");
    }
  const res = model.net.execute(input) as tf.Tensor<tf.Rank>; // inference model
  // RES= [1, 11, 8400] 1 batch/ejemplo/imagen, 11 atributos por deteccion, 8400 detecciones

  input.dispose(); // libera de la memoria el tensor armado en preprocess, ya que no se usa mas y se pasa a ysar el res

  const transRes = res.transpose([0, 2, 1]); // transpose result [b, det, n] => [b, n, det]
  const rawScores = transRes.slice([0, 0, 4], [-1, -1, numClass]).squeeze(0); // #6 only squeeze axis 0 to handle only 1 class models
  // const scores = rawScores

    const scores = [] as number[];

    for (let i = 0; i < numClass; i++) {
        scores.push(
        rawScores.slice([0, i], [-1, 1]).flatten().max().arraySync() as number
        );
    }

    const predictionss = scores.map((score, i) => ({
        clase: labels[i],
        score: Math.ceil(score * 100),
    }));

  // const claseScores1 = rawScores
  //   .slice([0, 0], [-1, 1])
  //   .flatten()
  //   .max()
  //   .arraySync();
  // const claseScores2 = rawScores
  //   .slice([0, 1], [-1, 1])
  //   .flatten()
  //   .max()
  //   .arraySync();
  // const claseScores3 = rawScores
  //   .slice([0, 2], [-1, 1])
  //   .flatten()
  //   .max()
  //   .arraySync();
  // const claseScores4 = rawScores
  //   .slice([0, 3], [-1, 1])
  //   .flatten()
  //   .max()
  //   .arraySync();
  // const claseScores5 = rawScores
  //   .slice([0, 4], [-1, 1])
  //   .flatten()
  //   .max()
  //   .arraySync();
  // const claseScores6 = rawScores
  //   .slice([0, 5], [-1, 1])
  //   .flatten()
  //   .max()
  //   .arraySync();

  // const predictions = [
  //   { clase: labels[0], score: (claseScores1 * 100).toFixed(2) },
  //   { clase: labels[1], score: Math.ceil(claseScores2 * 100) },
  //   { clase: labels[2], score: (claseScores3 * 100).toFixed(2) },
  //   { clase: labels[3], score: (claseScores4 * 100).toFixed(2) },
  //   { clase: labels[4], score: (claseScores5 * 100).toFixed(2) },
  //   { clase: labels[5], score: (claseScores6 * 100).toFixed(2) },
  // ];

    callback(predictionss);

    tf.dispose([res, transRes, rawScores, input]); // cleanup memory

    tf.engine().endScope(); // end of scoping
    };

    export const detectVideo = (
    vidSource: HTMLVideoElement,
    model: {
        net: tf.GraphModel;
        inputShape: number[];
    },
    canvasRef: HTMLCanvasElement,
    callback: (predicciones: { claseScores: string; score: number }[]) => void
    ) => {
    /**
     * Function to detect every frame from video
     */
    const detectFrame = async () => {
        if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
        const ctx = canvasRef.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
        return; // handle if source is closed
        }

        detectAllClasses(vidSource, model, canvasRef, (e) => {
        callback(e);
        requestAnimationFrame(detectFrame); // get another frame
        });
    };

  detectFrame(); // initialize to detect every frame
};