const video = document.getElementById('video');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo).catch(err => console.error('Model loading error:', err));

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
      video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        // Add styles to the canvas to overlay on the video container
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        document.querySelector('.video-container').append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          try {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          } catch (err) {
            console.error('Detection error:', err);
          }
        }, 100);
      });
    })
    .catch(err => console.error('Camera access error:', err));
}
