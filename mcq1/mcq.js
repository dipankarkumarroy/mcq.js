// Get the link element by its custom type attribute
var ques = document.querySelector('link[type="questions"]');
var ans = document.querySelector('link[type="answers"]');

if (ques) {
    // Get the href attribute value
    var question = ques.getAttribute("href");
} else {
    alert("Link element questions not found.");
}

if (ans) {
    // Get the href attribute value
    var answer = ans.getAttribute("href");
} else {
    alert("Link element answers not found.");
}
// Function to load questions from an external JSON file
function loadQuestions() {
    return fetch(question) // Replace 'questions.json' with your JSON file path
        .then((response) => response.json())
        .catch((error) => console.error('Error loading questions:', error));
}

// Function to load answer data from an external JSON file
function loadAnswerData() {
    return fetch(answer) // Replace 'answerData.json' with your JSON file path
        .then((response) => response.json())
        .catch((error) => console.error('Error loading answer data:', error));
}

// Function to initialize the quiz after loading data
async function initializeQuiz() {
    try {
        const [questionsData, answerData] = await Promise.all([loadQuestions(), loadAnswerData()]);
        const questionData = parseQuestions(questionsData);

        generateQuiz(questionData, answerData);

        const form = document.getElementById("quizForm");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            calculateResult(questionData, answerData);
        });
    } catch (error) {
        console.error('Error initializing quiz:', error);
    }
}

// Function to parse the questions and options
function parseQuestions(data) {
    return Object.entries(data).map(([key, questionString]) => {
        const [question, ...options] = questionString.split(",");
        return {
            key,
            question,
            options,
        };
    });
}

// Function to dynamically generate the quiz questions and options
function generateQuiz(questionData, answerData) {
    const questionsDiv = document.getElementById("questions");

    questionData.forEach((questionObj) => {
        const questionElement = document.createElement("div");
        questionElement.dataset.key = questionObj.key;
        questionElement.innerHTML = `<p>${questionObj.question}</p>`;

        questionObj.options.forEach((option, optionIndex) => {
            const radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.name = questionObj.key;
            radioInput.value = optionIndex;
            radioInput.id = `${questionObj.key}option${optionIndex}`;

            const label = document.createElement("label");
            label.setAttribute("for", `${questionObj.key}option${optionIndex}`);
            label.textContent = option;

            questionElement.appendChild(radioInput);
            questionElement.appendChild(label);
        });

        questionsDiv.appendChild(questionElement);
    });
}

// Calculate and display the quiz result
function calculateResult(questionData, answerData) {
    const form = document.getElementById("quizForm");
    const resultDiv = document.getElementById("result");
    let score = 0;

    questionData.forEach((questionObj) => {
        const selectedOption = form.elements[questionObj.key].value;

        // Check if the selected option is not an empty string (indicating it was answered)
        if (selectedOption !== "") {
            const isCorrect = parseInt(selectedOption) === answerData[questionObj.key];

            const questionElement = document.querySelector(`#questions div[data-key="${questionObj.key}"]`);
            const label = questionElement.querySelector(`label[for="${questionObj.key}option${selectedOption}"]`);

            if (isCorrect) {
                label.classList.add("correct");
                score++;
            } else {
                label.classList.add("incorrect");
                const correctLabel = questionElement.querySelector(`label[for="${questionObj.key}option${answerData[questionObj.key]}"]`);
                correctLabel.classList.add("correct");
            }

            // Disable radio inputs after submission
            const radioInputs = questionElement.querySelectorAll(`input[type=radio][name="${questionObj.key}"]`);
            radioInputs.forEach((input) => {
                input.disabled = true;
            });
        }
    });

    // Disable the Submit button after submission
    form.querySelector("button[type=submit]").disabled = true;

    resultDiv.textContent = `You scored ${score} out of ${Object.keys(questionData).length}`;
}

// Initialize the quiz
initializeQuiz();

