async function bootSequence() {
    await setupCamera();
    imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
    imageElement = document.getElementById("image");
    imageElement.onload = async function () {
      const result = await detector.detect(imageElement);
      drawImage(imageElement, result);
    }
    detector = await cocoSsd.load("mobilenet_v2");
    const c = document.getElementById('canvas');
    c.style.display = "block";
    const l = document.getElementById('loading-indicator');
    l.parentElement.removeChild(l);
    setCanvasSize();
    setInterval(()=>{
      detect();
    }, 300);
  }
  
  async function setupCamera() {
    stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        width: { ideal: 4096 },
        height: { ideal: 2160 }
      },
    });
    const videoSettings = stream.getVideoTracks()[0].getSettings();
    realWidth = videoSettings.width;
    realHeight = videoSettings.height;
    window.addEventListener("resize", setCanvasSize);
  }
  
  async function detect() {
    const photo = await imageCapture.takePhoto();
    if (imageElement.src != "") {
      URL.revokeObjectURL(imageElement.src);
    }
    const newURL = URL.createObjectURL(photo);
    imageElement.src = newURL;
  }
  
  function drawImage(image, result) {
    const c = document.getElementById('canvas');
    const context = c.getContext('2d');
    context.drawImage(image, 0, 0);
    context.font = '30px Arial';
  
    for (let i = 0; i < result.length; i++) {
      context.beginPath();
      context.rect(...result[i].bbox);
      context.lineWidth = 5;
      context.strokeStyle = 'green';
      context.fillStyle = 'green';
      context.stroke();
      context.fillText(
        result[i].score.toFixed(3) + ' ' + result[i].class, result[i].bbox[0],
        result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10);
    }
  }
  
  function setCanvasSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const rs = screenWidth/screenHeight;
    const ri = realWidth/realHeight;
    const finalDimensions = rs > ri ? [realWidth * screenHeight/realHeight, screenHeight] : [screenWidth, realHeight * screenWidth/realWidth];
    canvas.width = realWidth;
    canvas.height = realHeight;
    canvas.style.width = finalDimensions[0] + "px";
    canvas.style.height = finalDimensions[1] + "px";
  }
  
  bootSequence();