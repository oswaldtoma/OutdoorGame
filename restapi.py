# restapi.py
#set FLASK_APP=restapi.py
#set FLASK_ENV=development
#py -3 -m flask run

from flask import Flask, request, jsonify

app = Flask(__name__)

questions = [
    {"id": 1, "question": "Podaj stolicę Polski.", "correctAnswer": "Warszawa"},
    {"id": 3, "question": "Przy jakiej ulicy znajduje się Akademia Techniczno-Humanistyczna w Bielsku Białej?", "correctAnswer": "Willowej"},
    {"id": 4, "question": "Podaj stolicę Egiptu.", "correctAnswer": "Kair"},
    {"id": 5, "question": "Podaj stolicę Czech.", "correctAnswer": "Praga"}
]

locations = [
    {"id": 1, "latitude": 50.012100, "longitude": 20.985842},
    {"id": 2, "latitude": 50.286263, "longitude": 19.104078},
    {"id": 3, "latitude": 50.435947, "longitude": 18.846025},
    {"id": 4, "latitude": 52.406376, "longitude": 16.925167},
    {"id": 5, "latitude": 53.013790, "longitude": 18.598444},
    {"id": 6, "latitude": 51.935619, "longitude": 15.506186},
    {"id": 7, "latitude": 53.428543, "longitude": 14.552812},
    {"id": 8, "latitude": 50.041187, "longitude": 21.999121},
    {"id": 9, "latitude": 50.049683, "longitude": 19.944544},
    {"id": 10, "latitude": 53.770226, "longitude": 20.490189}
]

def _find_next_id(arr):
    return max(element["id"] for element in arr) + 1

@app.get("/questions")
def get_questions():
    return jsonify(questions)

@app.post("/questions")
def add_question():
    if request.is_json:
        question = request.get_json()
        question["id"] = _find_next_id(questions)
        questions.append(question)
        return question, 201
    return {"error": "Request must be JSON"}, 415

@app.get("/locations")
def get_locations():
    return jsonify(locations)

@app.post("/locations")
def add_location():
    if request.is_json:
        location = request.get_json()
        location["id"] = _find_next_id(locations)
        locations.append(location)
        return location, 201
    return {"error": "Request must be JSON"}, 415