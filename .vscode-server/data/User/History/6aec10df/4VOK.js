// Filename: quizFeature.js

// Function to display only one quiz question at a time and handle the quiz logic
function modifyDisplayQuizForSingleQuestion(quizQuestions) {
    let currentQuestionIndex = 0;
    let userAnswers = [];

    // Function to display a single question and capture user's answer
    function displayQuestion(questionIndex) {
        const quizScreen = document.getElementById('quiz-screen');
        quizScreen.innerHTML = '';

        if (questionIndex < quizQuestions.length) {
            const question = quizQuestions[questionIndex];
            const questionContainer = document.createElement('div');
            questionContainer.className = 'quiz-question';
            questionContainer.innerHTML = `
                <p>Question ${questionIndex + 1}: ${question.question}</p>
                <ul class='quiz-answers'>
                    ${question.options.map((option, index) => 
                        `<li onclick='handleAnswerSelection(${index}, ${question.correctAnswerIndex}, ${questionIndex})'>${option}</li>`
                    ).join('')}
                </ul>
            `;
            quizScreen.appendChild(questionContainer);
        } else {
            storeQuizResults(userAnswers);
        }
    }

    window.handleAnswerSelection = function(selectedIndex, correctIndex, questionIndex) {
        const isCorrect = selectedIndex === correctIndex;
        userAnswers[questionIndex] = { answeredCorrectly: isCorrect };
        displayQuestion(questionIndex + 1);
    };

    displayQuestion(currentQuestionIndex);
}

// Function to store and display the quiz results
function storeQuizResults(userAnswers) {
    const quizScreen = document.getElementById('quiz-screen');
    quizScreen.innerHTML = '<h2>Quiz Results</h2>';

    const resultSummary = userAnswers.map((answer, index) => 
        `Question ${index + 1}: ${answer.answeredCorrectly ? 'Correct' : 'Incorrect'}`
    ).join('<br>');
    quizScreen.innerHTML += `<p>${resultSummary}</p>`;

    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Main';
    backButton.addEventListener('click', resetToWelcomeScreen);
    quizScreen.appendChild(backButton);
}


// Button creation and quiz initialization logic remains the same
function createQuizButton() {
    const welcomeContainer = document.querySelector('.welcome-container');
    const quizButton = document.createElement('button');
    quizButton.id = 'generate-quiz';
    quizButton.textContent = 'Generate Quiz from Saved Topics';
    quizButton.addEventListener('click', generateQuiz);
    welcomeContainer.appendChild(quizButton);
}

document.addEventListener('DOMContentLoaded', createQuizButton);

// Adjust the generateQuiz function to utilize the new structure
function generateQuiz() {
    const savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];
    if (savedArticles.length === 0) {
        alert('No saved topics to generate a quiz.');
        return;
    }
    showLoadingScreen();
    const quizQuestions = [];

    // Sequentially process each saved topic to generate questions
    const processArticle = (index) => {
        if (index >= savedArticles.length) {
            // Once all topics are processed, display the quiz
            displayQuiz(quizQuestions);
            return;
        }

        const article = savedArticles[index];
        fetchMultipleChoiceQuestion(article.summary)
            .then(question => {
                quizQuestions.push(question);
                processArticle(index + 1);  // Process the next article
            })
            .catch(error => {
                console.error('Error fetching question for article:', article.title, error);
                processArticle(index + 1);  // Process the next article even if there's an error
            });
    };

    // Start processing from the first saved article
    processArticle(0);
    // Assume the processArticle and fetchMultipleChoiceQuestion functions remain as previously defined
    // Now processArticle should call modifyDisplayQuizForSingleQuestion instead of displayQuiz

    // Process articles, fetch questions, then call modifyDisplayQuizForSingleQuestion
    // For simplicity, assume each fetchMultipleChoiceQuestion returns a question with a structure like:
    // { question: "What is ...?", options: ["Option 1", "Option 2", "Correct Answer", "Option 4"], correctAnswerIndex: 2 }
    // And then after all articles are processed:

    modifyDisplayQuizForSingleQuestion(quizQuestions);
}


