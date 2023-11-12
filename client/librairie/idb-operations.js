//Librairie pour les opérations sur la base de données idb (IndexedDB) dbfilms
//tester si le navigateur a indexedDB

async function creerBD(infosBD) {
  // if (!Window.indexedDB) {
  //   console.log('Dans ce navigateur IndexedDB pas disponible');
  //   return;
  // }
  return await idb.open(infosBD.bd, 1, (db) => {
    //retourne une Promise de la BD
    let listeStores = infosBD.stores;
    for (unSt of listeStores) {
      if (unSt.st === "genres") {
        db.createObjectStore(unSt.st, { autoIncrement: true });
      } else {
        db.createObjectStore(unSt.st, { keyPath: unSt.id });
      }
    }
  });
}

creerBD({
  bd: "dbfilms",
  stores: [{ st: "genres" }, { st: "films", id: "id" }],
});

function addData(st, donnees) {
  return dbPromise.then((db) => {
    var tx = db.transaction(st, "readwrite");
    var store = tx.objectStore(st);
    store.add(donnees);
    return tx.complete;
  });
}
function enregistrer(st, donnees) {
  return dbPromise.then((db) => {
    var tx = db.transaction(st, "readwrite");
    var store = tx.objectStore(st);
    store.put(donnees);
    return tx.complete;
  });
}

function contenuStore(st) {
  return dbPromise.then((db) => {
    var tx = db.transaction(st, "readonly");
    var store = tx.objectStore(st);
    return store.getAll();
  });
}

//Autres fonctions utilitaires
function viderStore(st) {
  return dbPromise.then(function (db) {
    var tx = db.transaction(st, "readwrite");
    var store = tx.objectStore(st);
    store.clear();
    return tx.complete;
  });
}

function supprimerElement(st, id) {
  dbPromise
    .then(function (db) {
      var tx = db.transaction(st, "readwrite");
      var store = tx.objectStore(st);
      store.delete(id);
      return tx.complete;
    })
    .then(function () {
      console.log("Elément supprimé");
    });
}
