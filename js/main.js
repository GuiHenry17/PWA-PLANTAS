// Registrando a service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            let reg;
            reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });

            console.log('Service worker registrada! 😍', reg);
        } catch (err) {
            console.log('😬 Service worker registro falhou: ', err);
        }
    });
}

// configurando as constraines do video stream
var constraints = { video: { facingMode: "user" }, audio: false };
// capturando os elementos em tela
const cameraView = document.querySelector("#camera--view"),
      cameraOutput = document.querySelector("#camera--output"),
      cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger");

// Estabelecendo o acesso a camera e inicializando a visualização
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

// Função para tirar foto
cameraTrigger.onclick = function () {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;

    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    cameraSensor.style.display = "block";

    cameraSensor.toBlob(function(blob) {
        window.fotoBlob = blob; // <- guardar foto tirada
        cameraOutput.src = URL.createObjectURL(blob); // preview
        cameraOutput.classList.add("taken");
    }, "image/webp");
};


// carrega imagem de camera quando a janela carregar
window.addEventListener("load", cameraStart, false);
