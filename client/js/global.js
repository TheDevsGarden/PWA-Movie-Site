let fetchedData;
// function fetchFilmsData() {
//   return fetch("/json/client/json/films_categs.json")
//     .then((response) => response.json())
//     .then((data) => {
//       fetchedData = data;
//       return data;
//     })
//     .catch((error) => console.error("Error:", error));
// }

async function fetchFilmsData() {
  try {
    let response = await fetch("../json/films_categs.json");
    let data = await response.json();
    fetchedData = data;
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

let valider = (leForm) => {
  let mpass = document.getElementById("mpass").value;
  let cpass = document.getElementById("cpass").value;
  if (mpass == cpass) {
    return true;
  } else {
    alert("Vérifier l'égalité des  mots de passe");
    return false;
  }
};

let creerSelectCategs = () => {
  let selCategs = document.getElementById("selCategs");
  let tabCategs = [];

  tabCategs = fetchedData.genres;
  //console.log(tabCategs);

  tabCategs.sort().reverse();
  for (let categ of tabCategs) {
    selCategs.options[selCategs.options.length] = new Option(categ, categ.substring(0, 2));
  }
};

let card = (unFilm, pos) => {
  //console.log(unFilm.posterUrl);

  return `<div class="card text-bg-secondary border">
                <img src=${unFilm.posterUrl} class="card-img-top ht-card-img" alt=${unFilm.title} onerror="this.onerror=null; this.src='../images/pochettes/no-load.png';">
                <div class="card-body">
                    <h5 class="card-title">${unFilm.title}</h5>
                    <p class="card-text">${unFilm.year}</p>
                    <p class="card-text">${unFilm.genres.join(", ")}</p>
                    <a data-index="${pos}" onclick="movieModal(this)" data-bs-toggle="modal" data-bs-target="#modalFilm" href="#" class="btn btn-light">Savoir plus</a>
                </div>
            </div>`;
};

let movieModal = (button) => {
  let filmPos = button.getAttribute("data-index");
  let unFilm = fetchedData.movies[filmPos];
  let modalContent = `<div class="modal-header">
  <h5 class="modal-title">${unFilm.title}</h5>
  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>
    <div class="modal-body">
    <img src=${unFilm.posterUrl} class="modal-card-img " alt=${unFilm.title} onerror="this.onerror=null; this.src='../images/pochettes/no-load.png';">
      <p><span class="span-text" >Titre: </span>${unFilm.title}</p>
      <p><span class="span-text" >Année: </span>${unFilm.year}</p>
      <p><span class="span-text" >Durée (minutes): </span>${unFilm.runtime}</p>
      <p><span class="span-text" >Genres: </span>${unFilm.genres.join(", ")}</p>
      <p><span class="span-text" >Réallisateur: </span>${unFilm.director}</p>
      <p><span class="span-text" >Acteurs: </span>${unFilm.actors}</p>
      <p><span class="span-text" >Synopsis: </span>${unFilm.plot}</p>
    </div>
  <div class="modal-footer">
  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`;
  document.querySelector("#modalFilm .modal-content").innerHTML = modalContent;
};

let afficherLivres = (categ) => {
  let listeCards = `<div class="row">`;
  for (let i = 0; i < fetchedData.movies.length; i++) {
    if (categ == "T" || fetchedData.movies[i].genres.includes(categ)) {
      listeCards += card(fetchedData.movies[i], i);
    }
  }
  listeCards += `</div>`;
  document.getElementById("main").innerHTML = listeCards;
};
// let afficherLivres = async (categ) => {
//   let listeCards = `<div class="row">`;
//   for (let i = 0; i < fetchedData.movies.length; i++) {
//     if (categ == "T" || fetchedData.movies[i].genres.includes(categ)) {
//       listeCards += await card(fetchedData.movies[i], i); // add await here
//     }
//   }
//   listeCards += `</div>`;
//   document.getElementById("main").innerHTML = listeCards;
// };

let afficherChoix = (leSel) => {
  let posChoix = leSel.selectedIndex;
  let categ = leSel.options[posChoix].text;
  afficherLivres(categ);
};

// let initialiser = () => {
//   fetchFilmsData().then(() => {
//     creerSelectCategs();
//     afficherLivres("T");
//     //afficherChoix();
//   });
// };

let initialiser = async () => {
  await fetchFilmsData();
  creerSelectCategs();
  afficherLivres("T");
  //afficherChoix();
};

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js", { scope: "/" })
    .then((registration) => {
      console.log("Service Worker Enregistré: ");
    })
    .catch((error) => {
      console.log("L'enregistrement du travailleur de service a échoué : ", error);
    });
}

var promptDiffere;
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallprompt Event fired");
  e.preventDefault();
  promptDiffere = e;
  return false;
});

function montrerInstallBanner() {
  if (promptDiffere) {
    promptDiffere.prompt();
    promptDiffere.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "dismissed") {
        console.log("L'utilisateur a annulé l'installation");
      } else {
        console.log("L'utilisateur a installé l'application");
      }
      promptDiffere = null;
    });
  }
}
