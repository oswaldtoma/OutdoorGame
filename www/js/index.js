const token = "pk.eyJ1Ijoic3p5bW9uMTYxIiwiYSI6ImNrdXR6YnY3MzBwMXgydm8wYThncnJlOTUifQ.7WRM1chFOHze_93XjOxLYw";
const mapboxUrl = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";
const apiUrl = "http://127.0.0.1:5000";

const mapModes = {
  Night: L.tileLayer(mapboxUrl, {
    id: "mapbox/dark-v10",
    attribution: "Dark",
    accessToken: token,
  }),
  Satelite: L.tileLayer(mapboxUrl, {
    id: "mapbox/satellite-v9",
    attribution: "Satellite",
    accessToken: token,
  }),
  Streets: L.tileLayer(mapboxUrl, {
    id: "mapbox/streets-v11",
    attribution: "Streets",
    accessToken: token,
  }),
};

const defaultLocation = [49.82245, 19.04686];
const map = L.map("map", { layers: Object.values(mapModes), minZoom: 3 }).setView(defaultLocation, 12);
L.control.layers(mapModes).addTo(map);

const stickman = L.icon({
  iconUrl: "https://www.nicepng.com/png/full/52-526999_stickman-png.png",
  iconSize: [28,65],
});

var userMarker = L.marker(defaultLocation, { icon: stickman }).addTo(map);
userMarker.bindPopup("Tu jesteś!");

var objectiveMarker = L.marker(defaultLocation).addTo(map);
objectiveMarker.bindPopup("Nowe pytanie!");

var currentObjective = {
  question: null,
  answer: null,
  location: null,
  userLocation: null,
  level: 1,
};

const htmlData = {
    question: document.getElementById("question"),
    answer: document.getElementById("userAnswer"),
    confirmButton: document.getElementById("confirm"),
    error: document.getElementById("error"),
    quiz: document.getElementById("quiz")
};

const loadDataFromApiAsync = async (questionNo) => {
    await fetch(apiUrl + "/locations").then(async (httpResponse) => {
        let location = (await httpResponse.json()).find((x) => x.id === questionNo);
        currentObjective.location = [location.latitude, location.longitude];
        objectiveMarker.setLatLng(currentObjective.location);
    })
    .catch((error) => {
        console.log(error);
    });
};

const loadQuestionAsync = async (questionNo) => {
  await fetch(apiUrl + "/questions")
  .then(async (httpResponse) => {
    let q = (await httpResponse.json()).find((x) => x.id === questionNo);
    currentObjective.answer = q.correctAnswer;
    currentObjective.question = q.question;
    htmlData.question.innerText = questionNo + '.' + currentObjective.question;
    htmlData.quiz.hidden = false;
  })
  .catch((error) => {
    console.log(error);
  });
}

const checkAnswerAsync = async () => {
  if (currentObjective.answer != null) {
    let properAnswer = currentObjective.answer.toLowerCase();
    if (htmlData.answer.value.toLowerCase() === properAnswer) {
      htmlData.error.innerText = "";
      htmlData.answer.value = "";
      currentObjective.level++;
      if (currentObjective.level > 5) {
        htmlData.confirmButton.disabled = htmlData.answer.disabled = true;
        alert("Gra skończona!");
      } else {
        htmlData.quiz.hidden = true;
        await loadDataFromApiAsync(currentObjective.level);
      }
    } else {
      alert("Błędna odpowiedź!");
    }
  }
};

// when confirm button is clicked
htmlData.confirmButton.addEventListener("click", checkAnswerAsync);

// when user clicks enter
htmlData.answer.addEventListener("keyup", async (event) => {
  event.preventDefault();
  if (event.keyCode === 13) {
    await checkAnswerAsync();
  }
});

const refreshUserGpsLocation = () => {
  navigator.geolocation.getCurrentPosition((position) => {
    currentObjective.userLocation = [position.coords.latitude, position.coords.longitude];
    userMarker.setLatLng(currentObjective.userLocation);
  }),
    (error) => {
      htmlData.error.innerText = error.message;
    };
};

const refreshShowQuestion = async() => {
  if((userMarker.getLatLng().distanceTo(currentObjective.location).toFixed(0)/1000) < 1) {
    await loadQuestionAsync(currentObjective.level, apiUrl);
  }
}

window.onload = async () => {
  refreshUserGpsLocation();
  await loadDataFromApiAsync(currentObjective.level);
  refreshShowQuestion();
  
  setInterval(refreshShowQuestion, 2000);
  setInterval(refreshUserGpsLocation, 2000 /*milliseconds*/);
};
