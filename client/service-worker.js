// if ("undefined" === typeof window) {
//   importScripts("/librairie/idb-operations.js");
//   importScripts("/librairie/idb.js");
// }

importScripts("/librairie/idb-operations.js");
importScripts("/librairie/idb.js");
const versionCache = "2";
const NOM_CACHE_STATIQUE = `cache-statique-${versionCache}`;
const NOM_CACHE_DYNAMIQUE = `cache-dynamique-${versionCache}`;

//Ressources statiques pour mettre en cache
const ressources = ["/", "/index.html", "/pages/contact.html", "/css/style.css", "/js/global.js", "/service-worker.js", "/librairie/idb-operations.js", "/librairie/idb.js", "/librairie/utilitaires.js", "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap", "https://fonts.googleapis.com/icon?family=Material+Icons", "https://code.getmdl.io/1.3.0/material.min.js", "manifest.webmanifest"];

// self.addEventListener("install", function (event) {
//   console.log("[Service Worker] En cours d'installation du SW ...", event);
//   event.waitUntil(
//     caches.open(NOM_CACHE_STATIQUE).then((cache) => {
//       cache.addAll(ressources);
//     })
//   );
// });

//si je prends la VERSION 2 du install plus bas, la cache dynamique ne fonctionne pas
self.addEventListener("install", function (event) {
  console.log("[Service Worker] En cours d'installation du SW ...", event);
  event.waitUntil(
    caches
      .open(NOM_CACHE_STATIQUE)
      .then((cache) => {
        cache.addAll(ressources);
      })
      .then(() => fetch("/json/films_categs.json"))
      .then((response) => response.json())
      .then((data) => {
        creerBD({
          bd: "dbfilms",
          stores: [{ st: "genres" }, { st: "films", id: "id" }],
        }).then((db) => {
          addData("genres", data.genres);
          addData("films", data.films);
        });
      })
  );
});

// VERSION 2
// self.addEventListener("install", function (event) {
//   console.log("[Service Worker] En cours d'installation du SW ...", event);
//   event.waitUntil(
//     caches
//       .open(NOM_CACHE_STATIQUE)
//       .then((cache) => {
//         cache.addAll(ressources);
//       })
//       .then(() => fetch("/json/films_categs.json"))
//       .then((response) => response.json())
//       .then((data) => {
//         addData("genres", data.genres);
//         addData("films", data.films);
//       })
//   );
// });

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== NOM_CACHE_STATIQUE && key !== NOM_CACHE_DYNAMIQUE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  let url = "http://localhost:300/json/films_categs.json";
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then((resp) => {
        var cloneResp = resp.clone();
        cloneResp.json().then((donnees) => {
          for (var film of donnees.movies) {
            enregistrer("dbfilms", film); //cet appel à besoin de dbPromise
          }
          return resp;
        });
        return resp;
      })
    );
  } else {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          return (
            // Si dans le cache statique alors le retourner
            response ||
            // sinon, prenez la réponse de la demande, ouvrez le cache dynamique
            //et stockez-y la réponse
            // on utilise resp puisque response est déjà utilisé
            fetch(event.request).then((resp) => {
              return caches.open(NOM_CACHE_DYNAMIQUE).then((cache) => {
                // vous devez stoker absolument un clone de la réponse soit resp
                cache.put(event.request.url, resp.clone());
                // puis renvoyez la demande d'origine au navigateur
                return resp;
              });
            })
          );
        })
        .catch((err) => {})
    );
  }
});

// self.addEventListener("sync", (event) => {
//   if (event.tag === "sync-nouveau-film") {
//     console.log("[Service Worker] sync nouveau film");
//     event.waitUntil(
//       contenuStore("sync-films").then((listeFilms) => {
//         for (var unFilm of listeFilms) {
//           console.log("En SW");
//           console.log(JSON.stringify(unFilm));
//           fetch("/enregistrer", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Accept: "application/json",
//             },
//             body: JSON.stringify(unFilm),
//           })
//             .then((res) => {
//               console.log(res);
//               //afficherDansListeFilms(leFilmEnregistre);
//               if (res.ok) {
//                 supprimerElement("sync-films", unFilm.NumFilm);
//               }
//             })
//             .catch((err) => {
//               console.log("Erreur avec envoyer les données", err);
//             });
//         }
//       })
//     );
//   }
// });

//Pour les notifications
// self.addEventListener("notificationclick", (event) => {
//   var notification = event.notification;
//   var action = event.action;

//   console.log(notification);

//   if (action === "accepter") {
//     console.log("Vous avez choisi accepter");
//   } else if (action === "infos") {
//     event.waitUntil(
//       clients.matchAll().then((cls) => {
//         var client = cls.find((c) => {
//           return c.visibilityState === "visible";
//         });

//         if (client !== undefined) {
//           client.navigate(notification.data);
//           client.focus();
//         } else {
//           client.openWindow(notification.data);
//         }
//         notification.close();
//       })
//     );
//   } else {
//     console.log(action);
//   }
//   notification.close();
// });

//Push Notifications
// self.addEventListener("push", (event) => {
//   const obj = event.data.json();

//   const options = {
//     body: obj.content,
//     data: obj.url,
//     icon: "/src/images/icons/icon-96x96.png",
//     badge: "/src/images/icons/icon-96x96.png",
//     actions: [{ action: "infos", title: "Infos", icon: "/src/images/icons/icon-96x96.png" }],
//   };
//   event.waitUntil(self.registration.showNotification(obj.title, options));
// });

// self.addEventListener("notificationclose", (event) => {
//   console.log("Notification fermée", event);
// });
