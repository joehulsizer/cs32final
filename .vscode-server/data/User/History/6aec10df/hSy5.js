// Filename: quizFeature.js

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
