import { openDB } from "idb";
let db;

async function createDB() {
  try {
    db = await openDB("banco", 1, {
      upgrade(db, oldVersion) {
        if (oldVersion === 0) {
          const store = db.createObjectStore("plantas", {
            keyPath: "nome",
          });
          store.createIndex("imagem", "imagem");
        }
      },
    });

    showResult("Banco de dados aberto.");
  } catch (e) {
    showResult("Erro ao criar o banco de dados: " + e.message);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  createDB();
  document.getElementById("btnSalvar").addEventListener("click", addData);
  document.getElementById("btnListar").addEventListener("click", getData);
});

async function addData() {
  const nome = document.getElementById("nome").value;
  const arquivoImagem = window.fotoBlob;

  if (!arquivoImagem) {
    showResult("Tire uma foto antes de salvar!")
    return
  }
  if (!nome) {
    showResult("Adicione um nome antes de salvar!")
    return
  }

  const tx = await db.transaction("plantas", "readwrite")
  const store = tx.objectStore("plantas")

  await store.add({
    nome: nome,
    imagem: arquivoImagem,
  })

  await tx.done
  const cameraOutput = document.getElementById("camera--sensor")
  cameraOutput.style.display = 'none';

  document.getElementById("nome").value = "";
  showResult("Salvo com sucesso!")
}

function mostarPlantas(plantas) {
  const urlImagem = URL.createObjectURL(plantas.imagem);

  return `
    <div>
        <h2 id="planta-nome">${plantas.nome}</h2>
        <img src="${urlImagem}" width="120">
        <br>
        <div class="buttons">
        <button onclick="editarPlanta('${plantas.nome}')" id="btnEditar">Editar</button>
        <button onclick="deletarPlanta('${plantas.nome}')" id="btnRemover">Remover</button>
        </div>
        <hr>
    </div>
    `;
}

async function getData() {
  const tx = await db.transaction("plantas", "readonly");
  const store = tx.objectStore("plantas");

  const plantas = await store.getAll()

  if (plantas.length > 0) {
    plantas.reverse()
    showResult(plantas.map(mostarPlantas).join(""))
  } else {
    showResult("Nenhum registro encontrado!")
  }
}

function showResult(text) {
  document.querySelector("output").innerHTML = text;
}

window.editarPlanta = async function (nome) {
  const tx = await db.transaction("plantas", "readonly");
  const store = tx.objectStore("plantas");
  const planta = await store.get(nome);

  if (!planta) {
    showResult("Planta não encontrada!")
    return
  }

  document.getElementById("nome").value = planta.nome;

  const input = document.getElementById("nome");
  input.scrollIntoView({
    behavior: "smooth",
    block: "center",
  })

  const btn = document.getElementById("btnSalvar");
  btn.textContent = "Atualizar"

  btn.onclick = async function () {
    await updateData(nome, planta.imagem)
    btn.textContent = "Salvar"
    btn.onclick = addData
  }
}

async function updateData(nomeAntigo, imagemAntiga) {
  const novoNome = document.getElementById("nome").value;

  const tx = await db.transaction("plantas", "readwrite");
  const store = tx.objectStore("plantas");

  if (nomeAntigo !== novoNome) {
    await store.delete(nomeAntigo)
  }

  await store.put({
    nome: novoNome,
    imagem: imagemAntiga,
  })

  await tx.done;

  showResult("Registro atualizado!");
  getData();
}

window.deletarPlanta = async function (nome) {
  if (!confirm(`Deseja remover ${nome}?`)){
     return
  }

  const tx = await db.transaction("plantas", "readwrite");
  const store = tx.objectStore("plantas");
  await store.delete(nome);
  await tx.done;

  showResult(`"${nome}" removido com sucesso!`);
  getData();
}
