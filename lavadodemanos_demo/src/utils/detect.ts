import * as tf from "@tensorflow/tfjs";
import { renderBoxes } from "./renderBox";
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
 * Function run inference and do detection from source.
 * @param {HTMLImageElement|HTMLVideoElement} source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 * @param {VoidFunction} callback function to run after detection process
 */
export const detect = async (
  source: HTMLImageElement | HTMLVideoElement,
  model: {
    net: tf.GraphModel;
    inputShape: number[];
  },
  canvasRef: HTMLCanvasElement,
  callback: VoidFunction = () => {}
) => {
  if (model == null || model.inputShape == undefined) return; // handle if model is not loaded
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); // get model width and height

  tf.engine().startScope(); // start scoping tf engine
  const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight); // preprocess image

  // ACA ES LA PREDICCION
  //EJECUTA EL MODELO SOBRE LA IMAGEN PREPROCESSADA
  const res = model.net.execute(input) as tf.Tensor<tf.Rank>; // inference model
  // RES= [1, 11, 8400] 1 batch/ejemplo/imagen, 11 atributos por deteccion, 8400 detecciones

  input.dispose(); // libera de la memoria el tensor armado en preprocess, ya que no se usa mas y se pasa a ysar el res
  const transRes = res.transpose([0, 2, 1]); // transpose result [b, det, n] => [b, n, det]
  console.log(transRes, "transRes", transRes.shape);
  const boxes = tf.tidy(() => {
    const w = transRes.slice([0, 0, 2], [-1, -1, 1]); // get width
    const h = transRes.slice([0, 0, 3], [-1, -1, 1]); // get height
    const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)); // x1
    const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); // y1
    return tf
      .concat(
        [
          y1,
          x1,
          tf.add(y1, h), //y2
          tf.add(x1, w), //x2
        ],
        2
      )
      .squeeze();
  }); // process boxes [y1, x1, y2, x2]

  const [scores, classes] = tf.tidy(() => {
    // class scores
    const rawScores = transRes.slice([0, 0, 4], [-1, -1, numClass]).squeeze(0); // #6 only squeeze axis 0 to handle only 1 class models
    return [rawScores.max(1), rawScores.argMax(1)];
  }); // get max scores and classes index
  // console.log("scores:", scores);
  // console.log("Clases index:", classes);

  const nms = await tf.image.nonMaxSuppressionAsync(
    boxes,
    scores,
    500,
    0.5,
    0.5
  ); // NMS to filter boxes Devuelve los indices de los cuadros que sobreviven

//`tf.image.non_max_suppression` es una función en TensorFlow que se utiliza para seleccionar un conjunto de cuadros delimitadores (bounding boxes) en un problema de detección de objetos, eliminando aquellos que se solapan excesivamente entre sí. Aquí te explico cómo funciona cada parámetro:

// 1. **boxes**: Una lista de cuadros delimitadores en forma de tensores. Cada cuadro está representado como [y1, x1, y2, x2], donde (y1, x1) es la esquina superior izquierda y (y2, x2) es la esquina inferior derecha.

// 2. **scores**: Un tensor que contiene las puntuaciones correspondientes a cada cuadro delimitador. Estas puntuaciones indican cuán seguro está el modelo de que un cuadro contiene un objeto de interés.

// 3. **max_output_size**: Un entero que representa el número máximo de cuadros que deseas mantener después de la supresión no máxima. Esto te permite limitar el número de cuadros de salida.

// 4. **iou_threshold**: Umbral de la relación de intersección sobre unión (Intersection Over Union, IoU). Si la IoU entre dos cuadros es mayor que este umbral, uno de los cuadros será eliminado. Por defecto, este valor es 0.5.

// 5. **score_threshold**: Un umbral opcional para las puntuaciones de los cuadros delimitadores. Los cuadros con una puntuación por debajo de este valor serán descartados.

// 6. **name**: Un nombre opcional para la operación.

// La función devuelve los índices de los cuadros seleccionados que sobreviven a la supresión no máxima.

// Por ejemplo, en un problema de detección de objetos, puedes tener varios cuadros delimitadores que se superponen entre sí. `tf.image.non_max_suppression` ayuda a reducir esos cuadros a un conjunto más manejable, asegurando que solo los más relevantes permanezcan.

  console.log(first)
  const boxes_data = boxes.gather(nms, 0).dataSync(); // indexing boxes by nms index
  const scores_data = scores.gather(nms, 0).dataSync(); // indexing scores by nms index
  const classes_data = classes.gather(nms, 0).dataSync(); // indexing classes by nms index
  renderBoxes(canvasRef, boxes_data, scores_data, classes_data, [
    xRatio,
    yRatio,
  ]); // render boxes
  tf.dispose([res, transRes, boxes, scores, classes, nms]); // clear memory

  callback();

  tf.engine().endScope(); // end of scoping
};

/**
 * Function to detect video from every source.
 * @param {HTMLVideoElement} vidSource video source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 */
// export const detectVideo = (
//   vidSource: HTMLVideoElement,
//   model: {
//     net: tf.GraphModel;
//     inputShape: number[];
//   },
//   canvasRef: HTMLCanvasElement
// ) => {
//   /**
//    * Function to detect every frame from video
//    */
//   const detectFrame = async () => {
//     if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
//       const ctx = canvasRef.getContext("2d");
//       ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
//       return; // handle if source is closed
//     }

//     detect(vidSource, model, canvasRef, () => {
//       requestAnimationFrame(detectFrame); // get another frame
//     });
//   };

//   detectFrame(); // initialize to detect every frame
// };

export const detectVideo = async (videoElement: HTMLVideoElement, model: any, canvasElement: HTMLCanvasElement) => {
  if (!videoElement || !model || !canvasElement) return;

  const ctx = canvasElement.getContext("2d");
  if (!ctx) return;

  const detectFrame = async () => {
    const predictions = await model.detect(videoElement);
    
    if (predictions.length > 0) {
      // Extraer scores y clases
      const scores_data = new Float32Array(predictions.map(pred => pred.score));
      const classes_data = new Int32Array(predictions.map(pred => pred.class));

      // Obtener el paso con mayor confianza
      const detectedStep = getMostConfidentStep(scores_data, classes_data);
      console.log("Paso detectado:", detectedStep);
      
      // Aquí puedes usar el paso detectado como mejor te convenga
      // Por ejemplo, actualizar un estado en React si es necesario.
    }

    requestAnimationFrame(detectFrame); // Seguir detectando en tiempo real
  };

  detectFrame();
};

/**
 * Function to get the most confident detected step
 * @param {Float32Array} scores_data - Confidence scores for detected objects
 * @param {Int32Array} classes_data - Detected class indices
 * @returns {Object} Most confident step with confidence score
 */
const getMostConfidentStep = (
  scores_data: Float32Array,
  classes_data: Int32Array
) => {
  if (scores_data.length === 0 || classes_data.length === 0) {
    return { paso: null, confidence: 0 };
  }

  let maxIndex = 0;
  let maxConfidence = scores_data[0];

  for (let i = 1; i < scores_data.length; i++) {
    if (scores_data[i] > maxConfidence) {
      maxConfidence = scores_data[i];
      maxIndex = i;
    }
  }

  return {
    paso: labels[classes_data[maxIndex]], // Get the label of the detected step
    confidence: maxConfidence.toFixed(2), // Format confidence to 2 decimal places
  };
};
