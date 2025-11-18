if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      let reg = await navigator.serviceWorker.register("/sw.js", {
        type: "module",
      });
      console.log("Service worker registrada! 😍", reg);
    } catch (err) {
      console.log("😬 Service worker registro falhou: ", err);
    }
  });
}

let cameraStream = null;
let usandoFrontal = false;

const constraints = {
  video: { facingMode: "environment" },
  audio: false,
};

const cameraView = document.querySelector("#camera--view"),
  cameraOutput = document.querySelector("#camera--output"),
  cameraSensor = document.querySelector("#camera--sensor"),
  cameraTrigger = document.querySelector("#camera--trigger"),
  cameraSwitch = document.querySelector("#camera--switch");

function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      cameraStream = stream;
      cameraView.srcObject = stream;
    })
    .catch((error) => {
      console.error("Ocorreu um Erro.", error);
    });
}

cameraSwitch.onclick = async function () {
  if (!cameraStream) return;

  usandoFrontal = !usandoFrontal;

  const novoModo = usandoFrontal ? "user" : "environment";
  const track = cameraStream.getVideoTracks()[0];

  try {
    await track.applyConstraints({ facingMode: novoModo });
    console.log("Câmera trocada para:", novoModo);
  } catch (err) {
    console.warn("applyConstraints falhou. Usando fallback…", err);
    fallbackTrocarCamera(novoModo);
  }
};

function fallbackTrocarCamera(modo) {
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => t.stop());
  }

  navigator.mediaDevices
    .getUserMedia({
      video: { facingMode: modo },
      audio: false,
    })
    .then((stream) => {
      cameraStream = stream;
      cameraView.srcObject = stream;
    });
}

cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;

  const ctx = cameraSensor.getContext("2d");
  ctx.drawImage(cameraView, 0, 0);

  cameraSensor.style.display = "block";

  cameraSensor.toBlob(function (blob) {
    window.fotoBlob = blob;
    cameraOutput.src = URL.createObjectURL(blob);
    cameraOutput.classList.add("taken");
  }, "image/webp");
};

window.addEventListener("load", cameraStart, false);
