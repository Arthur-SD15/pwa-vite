import { openDB } from "idb";

let db;

async function createDB() {
  try {
    db = await openDB("banco", 1, {
      upgrade(db, oldVersion, newVersion, transaction) {
        switch (oldVersion) {
          case 0:
          case 1:
            const store = db.createObjectStore("pessoas", {
              // A propriedade nome será o campo chave
              keyPath: "nome",
            });
            // Criando um índice id na store, deve estar contido no objeto do banco.
            store.createIndex("id", "id");
            showResult("Banco de dados criado!");
        }
      },
    });
    showResult("Banco de dados aberto.");
  } catch (e) {
    showResult("Erro ao criar o banco de dados: " + e.message);
  }
}

window.addEventListener("DOMContentLoaded", async (event) => {
  createDB();
  document.getElementById("input");
  document.getElementById("btnSalvar").addEventListener("click", addData);
  document.getElementById("btnListar").addEventListener("click", getData);
});

async function getData() {
  if (db == undefined) {
    showResult("O banco de dados está fechado");
    return;
  }

  const tx = await db.transaction("pessoas", "readonly");
  const store = tx.objectStore("pessoas");
  const value = await store.getAll();
  const listagemDiv = document.querySelector('.listagem'); 

  if (value.length > 0) {
    listagemDiv.innerHTML = '';

    value.forEach(item => {
      const card = document.createElement('div');
      card.classList.add('card'); 

      const nomeElement = document.createElement('p');
      const idadeElement = document.createElement('p');

      nomeElement.textContent = `Nome: ${item.nome}`;
      idadeElement.textContent = `Idade: ${item.idade}`;
      
      card.appendChild(nomeElement);
      card.appendChild(idadeElement);
      listagemDiv.appendChild(card);
    });
  } else {
    showResult("Não há nenhum dado no banco!");
  }
}

async function addData() {
  const nome = document.getElementById("nomeInput").value;
  const idade = document.getElementById("idadeInput").value;

  if (db == undefined) {
    showResult("O banco de dados está fechado");
    return;
  }

  if (!nome || !idade) {
    showResult("Preencha os campos");
    return;
  }

  const tx = await db.transaction("pessoas", "readwrite");
  const store = tx.objectStore("pessoas");
  store.add({ nome: nome, idade: idade });
  await tx.done;

  document.getElementById("nomeInput").value = "";
  document.getElementById("idadeInput").value = "";
  showResult("Nome e idade adicionado no banco de dados");
}

function showResult(text) {
  document.querySelector("output").innerHTML = text;
}