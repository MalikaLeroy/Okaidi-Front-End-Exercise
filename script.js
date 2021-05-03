const questionsContainer = document.getElementById("questions");
const buttonStart = document.querySelector('.btn-start');
const timerElement = document.getElementById('time');
const difficultyElement = document.getElementById('difficulty')
const alertErrRequest = document.querySelector('.alert-danger')
const alertByQuestion = questionsContainer.querySelector('.alert')
const resultElement = document.getElementById('result')
const timeoutElement = document.getElementById('timeout')


let startTime;
function timer(duration, display) {
    let parentTimer = display.parentNode.parentNode.classList.remove('hidden');
    let timer = duration,
        minutes, seconds;
    startTime = setInterval(function() {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = `${minutes}:${seconds}`
        if (--timer < 0) {
            timer = duration;
            clearInterval(startTime);
            timeoutElement.classList.remove("hidden")
            questionsContainer.classList.add("hidden")
            timerElement.parentElement.classList.add("hidden")
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(startTime);
    timerElement.parentElement.classList.add("hidden")
}

function startTimer() {
    timer(119, timerElement);
    difficultyElement.textContent = difficultyLevel
    timerElement.classList.remove("hidden");
    event.target.closest("fieldset").classList.add("hidden")
    questionsContainer.firstChild.classList.remove("hidden")
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/////////////////// Questions display///////////////////
////////////////////////////////////////////////////////
function appendData(data) {
    for (let iQuestion = 0; iQuestion < data.length; iQuestion++) {
        let choicesArray = []
        for (let i = 0; i < data[iQuestion].incorrect_answers.length; i++) {
            choicesArray.push(data[iQuestion].incorrect_answers[i])
        }
        choicesArray.push(data[iQuestion].correct_answer)
        shuffle(choicesArray)
        let choices = choicesArray.map((item, index) => {
            return `
            <input type="radio" id="choiceQ${iQuestion}${index}" name="question${iQuestion}" value="${item}" >
            <label for="choiceQ${iQuestion}${index}">${item}</label>
            `;
        }).join('');
        const fieldset = document.createElement("fieldset")
        fieldset.innerHTML = `
            <legend>${data[iQuestion].question}</legend>
            <div class="choices">${choices}</div>
            <input type="button" value="Next question" class="btn btn-next" disabled/>
            `
        questionsContainer.appendChild(fieldset).classList.add("hidden")
    }
    ////////////////////// Event on each Radio Button
    let counterCorrectAnswer = 0
    questionsContainer.querySelectorAll('input[type="radio"]').forEach(item => {
        item.addEventListener('change', event => {
            let currentValue = this.event.target.value
            let currentQuestion = this.event.currentTarget.name.slice(8)
            if (currentValue == data[currentQuestion].correct_answer) // Si reponse ok
            {
                counterCorrectAnswer++
                event.target.classList.remove("error")
                event.target.classList.add("valid")
                resultElement.querySelector("span").textContent = `${counterCorrectAnswer} / ${data.length}`
            } else {
                event.target.classList.remove("valid")
                event.target.classList.add("error")

            }
            item.parentElement.querySelectorAll('input[type="radio"]').forEach(el => {
                el.disabled = true;
            })
            item.closest("fieldset").querySelector(".btn-next").removeAttribute('disabled')
        })
    })
    //////////////////////  Event on each button NextStep
    let counterStep = 0
    questionsContainer.querySelectorAll('.btn-next').forEach(item => {
        item.addEventListener('click', event => {
            counterStep++
            /*
            if (counterStep < data.length) {
                item.closest("fieldset").classList.add("hidden")
                item.closest("fieldset").nextSibling.classList.remove("hidden")
            } else if (counterStep == data.length) {
                item.value = "Submit this Quiz"
            } else {
                item.closest("fieldset").classList.add("hidden")
                resultElement.classList.remove("hidden")
                stopTimer()
            }*/

            if (counterStep == data.length-1) {
                let lastButton = item.closest("fieldset").nextSibling.querySelector(".btn-next")
                console.log(lastButton)
                lastButton.value = "Submit this Quiz"
            }
            if (counterStep < data.length) {
                item.closest("fieldset").classList.add("hidden")
                item.closest("fieldset").nextSibling.classList.remove("hidden")
            } else{
                item.closest("fieldset").classList.add("hidden")
                resultElement.classList.remove("hidden")
                stopTimer()
            }
        })
    })
}
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////



/////////////////////// API
let difficultyLevel = ""
document.querySelectorAll('input[name="difficulty"]').forEach(item => {
    item.addEventListener('change', event => {
        difficultyLevel = item.value
        const request = new XMLHttpRequest();
        request.open("GET", `https://opentdb.com/api.php?amount=5&category=27&difficulty=${difficultyLevel}&type=multiple`);
        request.send();
        request.onprogress = function() {
            // Ajouter un loader ici
        }
        request.onload = function() {
            if (this.status == 200) {
                try {
                    const json = JSON.parse(this.response);
                    if (json.results) {
                        buttonStart.removeAttribute('disabled')
                        buttonStart.addEventListener("click", startTimer, appendData(json.results.filter(question => question.difficulty == difficultyLevel)));
                    }

                } catch (err) {
                    alertErrRequest.classList.remove("hidden");
                    setTimeout(function() {
                        alertErrRequest.classList.add("hidden");
                        item.checked = false;
                    }, 5000);
                    return false;
                }
            } else {
                alertErrRequest.classList.remove("hidden");
                setTimeout(function() {
                    alertErrRequest.classList.add("hidden");
                    item.checked = false;
                }, 5000);
            }
        }
        request.onerror = function() {
            alertErrRequest.classList.remove("hidden");
            setTimeout(function() {
                alertErrRequest.classList.add("hidden");
                item.checked = false;
            }, 5000);
        }
    })
})