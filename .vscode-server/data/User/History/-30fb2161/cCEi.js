
function resetToWelcomeScreen() {
    document.getElementById('article-screen').style.display = 'none';
    document.getElementById('saved-articles-screen').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'block';
}

function showLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'block';
}

function hideLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'none';
}

let chatSessionId = null;
let chatHistory = [];
// Set up event listeners only once, outside any other function
document.getElementById('back-to-main').addEventListener('click', resetToWelcomeScreen);
document.getElementById('back-to-main_saved').addEventListener('click', resetToWelcomeScreen);
document.getElementById('generate-article').addEventListener('click', generateRandomArticle);
document.getElementById('generate-another').addEventListener('click', generateRandomArticle);

// Display saved articles and handle their selection
document.getElementById('view-saved').addEventListener('click', function() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('saved-articles-screen').style.display = 'block';

    const savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];
    const savedArticlesContainer = document.getElementById('saved-articles');
    savedArticlesContainer.innerHTML = '';

    savedArticles.forEach((article, index) => {
        const articleContainer = document.createElement('div');
        articleContainer.className = 'saved-article-container';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'delete-' + index;
        checkbox.className = 'delete-checkbox';

        const label = document.createElement('label');
        label.htmlFor = 'delete-' + index;
        label.textContent = article.title;
        label.className = 'saved-article-title';

        savedArticlesContainer.appendChild(articleContainer);
    });

    savedArticles.forEach(article => {
        const topicButton = document.createElement('button');
        topicButton.textContent = article.title;
        topicButton.className = 'topic-button';
        topicButton.addEventListener('click', function() {
            document.getElementById('saved-articles-screen').style.display = 'none';
            document.getElementById('article-title').textContent = article.title;
        
            // Apply formatting to the article summary before displaying it
            let formattedSummary = formatSummaryText(article.summary);
            document.getElementById('article-summary').innerHTML = article.summary;
        
            document.getElementById('article-image1').src = article.image1 || '';
            document.getElementById('article-image2').src = article.image2 || '';
        
            document.getElementById('article-image1').style.display = article.image1 ? 'block' : 'none';
            document.getElementById('article-image2').style.display = article.image2 ? 'block' : 'none';
        
            document.getElementById('article-screen').style.display = 'block';
        });
        
        savedArticlesContainer.appendChild(topicButton);
    });
});

function formatSummaryText(summary) {
    // Split the text into lines
    let lines = summary.split('\n');
    let formattedText = '';

    lines.forEach(line => {
        // Check if the line is a header
        if (line.match(/(Key Concepts:|Relevance:)/)) {
            formattedText += `<strong>${line}</strong><br>`;
        // Check if the line is a list item
        } else if (line.startsWith('-')) {
            // Add an opening <ul> tag if this is the first list item
            if (!formattedText.endsWith('</ul>') && !formattedText.includes('<ul>')) {
                formattedText += '<ul>';
            }
            formattedText += `<li>${line.substring(1).trim()}</li>`;
        } else {
            // Add a closing </ul> tag if this is the end of a list
            if (formattedText.includes('<ul>') && !line.startsWith('-')) {
                formattedText += '</ul>';
            }
            formattedText += `${line}<br>`;
        }
    });

    // Close the list if the summary ends with a list
    if (formattedText.includes('<ul>') && !formattedText.endsWith('</ul>')) {
        formattedText += '</ul>';
    }

    return formattedText;
}
// Handle article generation and display
function generateRandomArticle() {
    document.getElementById('welcome-screen').style.display = 'none';

    // Select a random topic
    const categories = Object.keys(subjects);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomTopicList = subjects[randomCategory];
    const randomTopic = randomTopicList[Math.floor(Math.random() * randomTopicList.length)];
    const prompt = `Please generate a random topic related to the genre of ${randomTopic}, like if genre is sports then it could generate like what is basketball or what is cricket?`;
    fetchChatGPTResponse(prompt).then(randomtopicgen => {
        // Ensure this value is used after it's been set
        fetchSummaryAndImages(randomtopicgen);
    })
}
        ;

// Handle saving articles
// Handle saving articles
document.getElementById('save-article').addEventListener('click', function() {
    const title = document.getElementById('article-title').textContent;
    
    const summary = document.getElementById('article-summary').innerHTML;
    const image1 = document.getElementById('article-image1').src;
    const image2 = document.getElementById('article-image2').style.display !== 'none' ? document.getElementById('article-image2').src : '';

    let savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];
    
    // Check if the article is already saved
    const isArticleSaved = savedArticles.some(article => article.title === title);

    if (!isArticleSaved) {
        savedArticles.push({ title, summary, image1, image2 });
        localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
        alert('Article saved!');
    } else {
        alert('This article is already saved!');
    }

    resetToWelcomeScreen();
});


// Clear all saved topics
document.getElementById('clear-topics').addEventListener('click', function() {
    localStorage.removeItem('savedArticles');
    const savedArticlesContainer = document.getElementById('saved-articles');
    savedArticlesContainer.innerHTML = '';
    alert('All saved topics have been cleared.');
    resetToWelcomeScreen();
});



// Add event listener for the ChatGPT interaction


// Function to fetch response from ChatGPT
function fetchChatGPTResponse(message) {
    const apiKey = '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'; // Replace with your actual API key
    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4", // Update according to the API documentation
            messages: [{role: "user", content: message}]
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error.message);
        }
        return data.choices[0].message.content;
    })
    .catch(error => {
        console.error('API Error:', error);
        return `API Error: ${error.message}`;
    });
}


// Function for the Learn Specific Topic button
document.getElementById('learn-specific-topic').addEventListener('click', function() {
    document.getElementById('specific-topic-form').style.display = 'block';
});

document.getElementById('submit-specific-topic').addEventListener('click', learnSpecificTopic);

function learnSpecificTopic() {
    const topic = document.getElementById('specific-topic-text').value.trim();
    if (!topic) {
        alert('Please enter a topic.');
        return;
    }

    fetchSummaryAndImages(topic);  // Fetch and display the information for the entered topic.
}

function fetchSummaryAndImages(topic) {
    showLoadingScreen(); 
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('article-screen').style.display = 'block';
    document.getElementById('article-title').textContent = '';
    document.getElementById('article-summary').innerHTML = '';
    document.getElementById('article-image1').src = '';
    document.getElementById('article-image1').style.display = 'none';
    document.getElementById('article-image2').src = '';
    document.getElementById('article-image2').style.display = 'none';

    const summaryPrompt = `In less than 200 words and avoiding the words "middle schooler":
        What is ${topic}?
        Explain ${topic} for a middle schooler, focusing on key concepts and their relevance.
        
        Key Concepts:
        Describe any fundamental concepts or terms in a straightforward manner.
        
        Relevance:
        List some applicable knowledge points, like famous people or events or examples of use or just quick notes that would allow me to be informed in a conversation about ${topic} in bullet points.
    `;

    fetchChatGPTResponse(summaryPrompt).then(summary => {
        let formattedSummary = formatSummaryText(summary);
        document.getElementById('article-title').textContent = topic;
        document.getElementById('article-summary').innerHTML = formattedSummary;
        
        // Fetch an image using Google's Custom Search JSON API
        fetchImageFromGoogle(topic);
    })
    .finally(() => {
        hideLoadingScreen();
    });
}

// You should ensure that similar image fetching and displaying logic is used in generateRandomArticle.
// The generateRandomArticle function should include proper logic to fetch and display images as done in fetchSummaryAndImages.
function fetchImageFromGoogle(topic) {
    const apiKey = 'AIzaSyD7dpxeJoR1irPP1mYljevPrQN5HDcIjvM';  // Replace with your actual API key.
    const searchEngineId = 'e1330f0d708e64b76';  // Replace with your search engine ID.
    const query = topic;
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${searchEngineId}&searchType=image&key=${apiKey}&num=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const imageUrl = data.items[0].link;
                document.getElementById('article-image1').src = imageUrl;
                document.getElementById('article-image1').style.display = 'block';
            } else {
                console.log('No images found.');
                document.getElementById('article-image1').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching image:', error);
            document.getElementById('article-image1').style.display = 'none';
        });
}
// Add Learn More button functionality


// Filename: extendArticle.js

// Function to initialize Learn More button functionality
function addLearnMoreButton() {
    document.getElementById('learn-more').addEventListener('click', displayOptionsBox);
}

// Function to display options box for extending the article
function displayOptionsBox() {
    document.getElementById('options-box').style.display = 'block';
}

// Function to extend the article summary based on the selected option
// This function now explicitly uses the current summary displayed on the page.
function extendArticleSummary(option) {
    let currentSummary = document.getElementById('article-summary').innerHTML;
    
    // Show loading screen while generating additional information
    showLoadingScreen();

    // The API call or processing should now use the currentSummary as a context or starting point
    // for generating additional content. This is simulated as follows:
    const extensionPromptDepth = `Given this summary: "${currentSummary}". Explain in the exactly same form at a high school level instead of the current middle school level of the given summary.`; // Placeholder for extension logic
    const extensionPromptSimple = `Given this summary: "${currentSummary}". Explain in the exactly same form at a simpler level instead of the current middle school level of the given summary.`; // Placeholder for extension logic
    const extensionPromptTalking = `Given this summary: "${currentSummary}". Explain in the exactly same form, with additional points in the relevance and talking points section.`; // Placeholder for extension logic
    if(option == 'More In-Depth'){
        extensionPrompt = extensionPromptDepth;
    } else if(option == 'Explain Simpler'){
        extensionPrompt = extensionPromptSimple;
    }
    else if(option == 'More Talking Points'){
        extensionPrompt = extensionPromptTalking;
    }

    fetchChatGPTResponse(extensionPrompt).then(extendedContent => {
        // Append the extended content to the current summary
        let extendedformattedSummary = formatSummaryText(extendedContent);

        let extendedSummary = extendedformattedSummary;

        // Update the article summary with the extended information
        document.getElementById('article-summary').innerHTML = extendedSummary;

        // Hide loading screen after the content is updated
        hideLoadingScreen();
    }).catch(error => {
        console.error('Error extending article:', error);
        // Hide loading screen even if there's an error
        hideLoadingScreen();
    });
}

// Add event listeners for the options to extend the summary
document.getElementById('explain-simpler').addEventListener('click', () => extendArticleSummary('Explain Simpler'));
document.getElementById('more-in-depth').addEventListener('click', () => extendArticleSummary('More In-Depth'));
document.getElementById('more-talking-points').addEventListener('click', () => extendArticleSummary('More Talking Points'));

// Initialize the Learn More button when the page loads
addLearnMoreButton();
// Add a "Generate Quiz" button listener
// Adjusted generateQuiz function
async function generateQuiz() {
    let savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];
    let quizQuestions = [];

    for (let article of savedArticles) {
        try {
            let questionText = await fetchChatGPTResponse(`Generate a multiple-choice question based on the following summary: ${article.summary}`);
            let question = {
                title: article.title,
                question: questionText,
                // Assume the structure of questionText includes the question and multiple choices
            };
            quizQuestions.push(question);
        } catch (error) {
            console.error('Error generating question for article:', article.title, error);
        }
    }

    localStorage.setItem('quizQuestions', JSON.stringify(quizQuestions));
    startQuiz();
}

// Refined startQuiz function
function startQuiz() {
    let quizQuestions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
    let questionIndex = 0;
    let correctAnswers = 0;  // You will need a mechanism to track this based on actual responses

    function showQuestion(question) {
        // Assume question object includes a text field and an array of options
        document.getElementById('question-title').textContent = question.title;
        document.getElementById('question-text').textContent = question.text;
    
        const answerOptionsContainer = document.getElementById('answer-options');
        answerOptionsContainer.innerHTML = ''; // Clear previous options
    
        question.options.forEach((option, index) => {
            let label = document.createElement('label');
            let radioButton = document.createElement('input');
            radioButton.type = 'radio';
            radioButton.name = 'quizOption';
            radioButton.value = index;
            label.appendChild(radioButton);
            label.appendChild(document.createTextNode(option));
            answerOptionsContainer.appendChild(label);
            answerOptionsContainer.appendChild(document.createElement('br'));
        });
    
        document.getElementById('submit-answer').style.display = 'block';
    }
    

    document.getElementById('next-question').addEventListener('click', () => {
        // Increment questionIndex and show the next question
        questionIndex++;
        if (questionIndex < quizQuestions.length) {
            showQuestion();
        } else {
            endQuiz();
        }
    });

    showQuestion();  // Initialize the quiz with the first question
}

function endQuiz() {
    // Finalize quiz results here; this is a placeholder for now
    let quizQuestions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
    // You would include logic to calculate correctAnswers based on user inputs
    alert(`Quiz completed! You answered ${correctAnswers} out of ${quizQuestions.length} correctly.`);
    document.getElementById('quiz-screen').style.display = 'none';
    resetToWelcomeScreen();
}

