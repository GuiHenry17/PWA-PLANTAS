if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      let reg;
      reg = await navigator.serviceWorker.register("/sw.js", {
        type: "module",
      });

      console.log("Service worker registrada! 😍", reg);
    } catch (err) {
      console.log("😬 Service worker registro falhou: ", err);
    }
  });
}

var constraints = { video: { facingMode: "environment" }, audio: false };

const cameraView = document.querySelector("#camera--view"),
  cameraOutput = document.querySelector("#camera--output"),
  cameraSensor = document.querySelector("#camera--sensor"),
  cameraTrigger = document.querySelector("#camera--trigger");

function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      let track = stream.getTracks()[0];
      cameraView.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Ocorreu um Erro.", error);
    });
}

cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;

  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
  cameraSensor.style.display = "block";

  cameraSensor.toBlob(function (blob) {
    window.fotoBlob = blob;
    cameraOutput.src = URL.createObjectURL(blob);
    cameraOutput.classList.add("taken");
  }, "image/webp");
};

window.addEventListener("load", cameraStart, false);
