// Filename: quizFeature.js
// Filename: updatedQuizFeature.js

// Function to display only one quiz question at a time
function modifyDisplayQuizForSingleQuestion(quizQuestions) {
    let currentQuestionIndex = 0;
    let userAnswers = [];

    // Function to display a single question
    function displayQuestion(questionIndex) {
        const quizScreen = document.getElementById('quiz-screen');
        quizScreen.innerHTML = '';  // Clear the previous content

        if (questionIndex < quizQuestions.length) {
            const question = quizQuestions[questionIndex];
            const questionContainer = document.createElement('div');
            questionContainer.className = 'quiz-question';
            questionContainer.innerHTML = `
                <p>Question ${questionIndex + 1}: ${question.question}</p>
                <ul class='quiz-answers'>
                    ${question.options.map((option, index) => `<li onclick='handleAnswerSelection(${index}, ${question.correctAnswerIndex}, ${questionIndex})'>${option}</li>`).join('')}
                </ul>
            `;
            quizScreen.appendChild(questionContainer);
        } else {
            // Quiz is complete, show results
            storeQuizResults(userAnswers);
        }
    }

    displayQuestion(currentQuestionIndex);
}

// Function to handle answer selection, validate it, and move to the next question
function handleAnswerSelection(selectedIndex, correctIndex, questionIndex) {
    const isCorrect = selectedIndex === correctIndex;
    updateQuizProgress(questionIndex, isCorrect);
}

// Function to update the quiz progress and display the next question
function updateQuizProgress(questionIndex, isCorrect) {
    // Store the user's answer and whether it was correct
    userAnswers[questionIndex] = { answeredCorrectly: isCorrect };

    // Move to the next question
    displayQuestion(questionIndex + 1);
}

// Function to store the quiz results (could be extended to store results in localStorage or a database)
function storeQuizResults(userAnswers) {
    const quizScreen = document.getElementById('quiz-screen');
    quizScreen.innerHTML = '<h2>Quiz Results</h2>';

    const resultSummary = userAnswers.map((answer, index) => `Question ${index + 1}: ${answer.answeredCorrectly ? 'Correct' : 'Incorrect'}`).join('<br>');
    quizScreen.innerHTML += `<p>${resultSummary}</p>`;

    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Main';
    backButton.addEventListener('click', resetToWelcomeScreen);
    quizScreen.appendChild(backButton);
}

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



// Function to create a Quiz button on the main screen
function createQuizButton() {
    const welcomeContainer = document.querySelector('.welcome-container');
    const quizButton = document.createElement('button');
    quizButton.id = 'generate-quiz';
    quizButton.textContent = 'Generate Quiz from Saved Topics';
    quizButton.addEventListener('click', generateQuiz);
    welcomeContainer.appendChild(quizButton);
}

// Function to generate the quiz based on saved topics
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
}

// Function to fetch a multiple choice question based on the article summary
function fetchMultipleChoiceQuestion(summary) {
    const prompt = `Please create a multiple choice question based on the following summary:\n${summary}`;
    return fetchChatGPTResponse(prompt)
        .then(question => {
            // Assume the response format is suitable for direct inclusion in the quiz
            if (!question || question.trim() === '') throw new Error('Invalid question received.');
            return question;
        });
}

// Function to display the quiz on the screen
function displayQuiz(quizQuestions) {
    hideLoadingScreen();

    // Switch to a dedicated quiz screen (you might need to create this in your HTML)
    document.getElementById('welcome-screen').style.display = 'none';
    const quizScreen = document.getElementById('quiz-screen');
    quizScreen.innerHTML = '';  // Clear previous content

    quizQuestions.forEach((question, index) => {
        const questionContainer = document.createElement('div');
        questionContainer.className = 'quiz-question';
        questionContainer.innerHTML = `<p>Question ${index + 1}: ${question}</p>`;
        quizScreen.appendChild(questionContainer);
    });

    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Main';
    backButton.addEventListener('click', resetToWelcomeScreen);
    quizScreen.appendChild(backButton);

    quizScreen.style.display = 'block';
}

// Once everything is loaded, we add the quiz button to the welcome screen
document.addEventListener('DOMContentLoaded', createQuizButton);
