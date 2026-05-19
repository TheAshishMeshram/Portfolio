/**
 * Ashish Meshram's Portfolio Chatbot Assistant
 * Pure client-side interactive assistant matching portfolio themes.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inject FontAwesome if not already present (failsafe, though portfolio has it)
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
        document.head.appendChild(fa);
    }

    // 1. Create and Inject Chatbot HTML Elements
    const chatContainer = document.createElement('div');
    chatContainer.id = 'portfolio-chatbot-root';
    chatContainer.innerHTML = `
        <!-- Launcher Button -->
        <button class="chatbot-launcher" id="chatLauncher" aria-label="Open Chatbot">
            <i class="fa-solid fa-comments"></i>
            <span class="notification-badge" id="chatBadge"></span>
        </button>

        <!-- Chat Window -->
        <div class="chatbot-window" id="chatWindow">
            <!-- Header -->
            <div class="chat-header">
                <div class="header-info">
                    <div class="bot-avatar">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="bot-details">
                        <span class="bot-name">Ashish's Assistant</span>
                        <span class="bot-status">
                            <span class="status-dot"></span> Online
                        </span>
                    </div>
                </div>
                <button class="close-btn" id="closeChat" aria-label="Close Chatbot">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Messages Area -->
            <div class="chat-body" id="chatBody">
                <!-- Messages dynamically appended here -->
            </div>

            <!-- Quick Replies Chips -->
            <div class="quick-replies-container" id="quickReplies">
                <!-- Suggestions dynamically generated -->
            </div>

            <!-- Input Footer -->
            <div class="chat-footer">
                <input type="text" class="chat-input" id="chatInput" placeholder="Ask about Ashish..." autocomplete="off">
                <button class="chat-send-btn" id="sendBtn" aria-label="Send message">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // 2. DOM Elements
    const chatLauncher = document.getElementById('chatLauncher');
    const chatBadge = document.getElementById('chatBadge');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const quickReplies = document.getElementById('quickReplies');

    // Chatbot state
    let isChatOpened = false;
    let initialGreetingSent = false;

    // Quick replies list
    const defaultQuickReplies = [
        "Tell me about Ashish",
        "What are his skills?",
        "Show experience",
        "Get contact details",
        "Tell me about services"
    ];

    // Data for knowledge base matching
    const kb = {
        greetings: {
            keywords: ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening", "yo"],
            response: "Hello! 👋 I am Ashish Meshram's virtual assistant. I can help answer questions about his skills, education, experience, services, and contact info. How can I assist you today?"
        },
        about: {
            keywords: ["about", "who are you", "who is", "ashish", "meshram", "profile", "bio", "summary", "background"],
            response: "<strong>Ashish Meshram</strong> is an aspiring Data Science professional and a 4th-semester undergraduate studying Computer Science & Engineering (Data Science) at JD College of Engineering & Management, Nagpur.<br><br>He has a strong foundation in Python, statistics, and machine learning, and is looking for data science or data analyst internship opportunities to solve real-world problems. 🚀"
        },
        skills: {
            keywords: ["skills", "skill", "technologies", "languages", "python", "sql", "programming", "javascript", "html", "css", "data viz", "machine learning", "ml"],
            response: "Ashish has a robust technical skillset:<br><ul>" +
                "<li><strong>Programming:</strong> Python, SQL, JavaScript, HTML5, CSS3</li>" +
                "<li><strong>Data Science & ML:</strong> Data Analysis, Predictive Modeling, Machine Learning workflows</li>" +
                "<li><strong>Cloud & AI:</strong> Vertex AI, Generative AI models, Cloud Storage, VMs</li>" +
                "<li><strong>Soft Skills:</strong> Problem Solving, Analytical Thinking, Teamwork</li>" +
                "</ul>Would you like to see his full skillset details?<br><button class='msg-action-btn' onclick='window.location.href=\"skills.html\"'>Go to Skills Page</button>"
        },
        experience: {
            keywords: ["experience", "internship", "intern", "job", "work", "where did he work", "google cloud", "android developer"],
            response: "Ashish has completed several prestigious virtual internships:<br><ul>" +
                "<li><strong>Google Cloud Computing Internship</strong> (Apr 2026 - Present): Focused on VMs, cloud storage, networking, and deployment.</li>" +
                "<li><strong>Google Cloud Generative AI Internship</strong> (Jan 2026 - Mar 2026): Mastered Vertex AI, prompt engineering, and LLM apps.</li>" +
                "<li><strong>Google AI/ML Internship</strong> (Oct 2025 - Dec 2025): Practical machine learning workflows and data analysis.</li>" +
                "<li><strong>Google Android Developer Internship</strong> (Jul 2025 - Sep 2025): Developed apps using Kotlin and Android Studio.</li>" +
                "</ul>Would you like to explore details about these internships?<br><button class='msg-action-btn' onclick='window.location.href=\"experience.html\"'>Go to Experience Page</button>"
        },
        education: {
            keywords: ["education", "college", "school", "degree", "btech", "cgp", "marks", "hsc", "ssc", "kendriya vidyalaya", "study"],
            response: "Ashish's academic credentials:<br><ul>" +
                "<li><strong>BTech in CSE (Data Science)</strong> (2024 - Present)<br>J D College of Engineering & Management, Nagpur.</li>" +
                "<li><strong>HSC / Intermediate</strong> (2022 - 2023)<br>Kendriya Vidyalaya O.F. Bhandara (7.3 CGPA).</li>" +
                "<li><strong>SSC / Matriculate</strong> (2020 - 2021)<br>Kendriya Vidyalaya O.F. Bhandara (7.2 CGPA).</li>" +
                "</ul>View details about his educational path:<br><button class='msg-action-btn' onclick='window.location.href=\"education.html\"'>Go to Education Page</button>"
        },
        services: {
            keywords: ["services", "service", "what do you do", "hire you to", "freelance", "web dev", "analysis", "data analyst"],
            response: "Ashish offers professional services in the following areas:<br><ul>" +
                "<li><strong>Web Development:</strong> Crafting responsive, highly interactive, and visually stunning web interfaces.</li>" +
                "<li><strong>Data Analysis:</strong> Cleaning, processing, and analyzing complex datasets to extract actionable insights.</li>" +
                "<li><strong>Machine Learning:</strong> Training predictive models, classifier models, and integrating AI capabilities.</li>" +
                "</ul>Check out details on these services:<br><button class='msg-action-btn' onclick='window.location.href=\"services.html\"'>Go to Services Page</button>"
        },
        contact: {
            keywords: ["contact", "email", "hire", "hire me", "phone", "reach", "linkedin", "github", "twitter", "social", "address", "location"],
            response: "You can reach Ashish Meshram through any of the following channels:<br><ul>" +
                "<li>📧 <strong>Email:</strong> <a href='mailto:iashishmeshram@gmail.com'>iashishmeshram@gmail.com</a></li>" +
                "<li>💼 <strong>LinkedIn:</strong> <a href='https://www.linkedin.com/in/theashishmeshram/' target='_blank' rel='noopener noreferrer'>theashishmeshram</a></li>" +
                "<li>💻 <strong>GitHub:</strong> <a href='https://github.com/TheAshishMeshram' target='_blank' rel='noopener noreferrer'>TheAshishMeshram</a></li>" +
                "<li>🐦 <strong>Twitter / X:</strong> <a href='https://twitter.com/AshishXMeshram' target='_blank' rel='noopener noreferrer'>AshishXMeshram</a></li>" +
                "</ul>Or fill out the form directly:<br><button class='msg-action-btn' onclick='window.location.href=\"contact.html\"'>Go to Contact Page</button>"
        },
        smalltalk: {
            keywords: ["how are you", "doing", "are you okay", "thank you", "thanks", "awesome", "great", "nice", "cool"],
            response: "I'm doing fantastic, thank you! I'm always excited to talk about Ashish's qualifications. Let me know what you'd like to explore next! 😊"
        }
    };

    // 3. UI Interactions

    // Toggle Chat Window
    chatLauncher.addEventListener('click', () => {
        isChatOpened = !isChatOpened;

        if (isChatOpened) {
            chatWindow.classList.add('active');
            chatLauncher.innerHTML = `<i class="fa-solid fa-minus"></i>`;

            // Hide badge
            if (chatBadge) {
                chatBadge.style.display = 'none';
            }

            // Focus input (on desktop)
            if (window.innerWidth > 768) {
                setTimeout(() => chatInput.focus(), 300);
            }

            // Send initial greeting if not already done
            if (!initialGreetingSent) {
                sendBotGreeting();
            }
        } else {
            chatWindow.classList.remove('active');
            chatLauncher.innerHTML = `<i class="fa-solid fa-comments"></i>`;
        }
    });

    // Close Chat Button
    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('active');
        chatLauncher.innerHTML = `<i class="fa-solid fa-comments"></i>`;
        isChatOpened = false;
    });

    // Send Message on Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserMessageSubmit();
        }
    });

    // Send Message on Send Button Click
    sendBtn.addEventListener('click', () => {
        handleUserMessageSubmit();
    });

    // 4. Chat logic helpers

    function renderMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.innerHTML = text;
        chatBody.appendChild(messageDiv);

        // Auto scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function renderTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'chat-message bot typing-container';
        indicatorDiv.id = 'typingIndicator';
        indicatorDiv.innerHTML = `
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        chatBody.appendChild(indicatorDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function renderQuickReplies(replies) {
        quickReplies.innerHTML = '';
        replies.forEach(reply => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.innerText = reply;
            btn.addEventListener('click', () => {
                // Remove prompt chips to avoid crowding
                quickReplies.innerHTML = '';

                // Submit message
                handleUserMsg(reply);
            });
            quickReplies.appendChild(btn);
        });
    }

    function sendBotGreeting() {
        initialGreetingSent = true;
        renderTypingIndicator();

        // Customize greeting based on page name
        let pageSpecific = "Welcome to Ashish Meshram's portfolio! ";
        const path = window.location.pathname.toLowerCase();

        if (path.includes('services')) {
            pageSpecific = "Looking to hire? You're on Ashish's services page! ";
        } else if (path.includes('skills')) {
            pageSpecific = "Check out Ashish's technical capabilities on this skills page! ";
        } else if (path.includes('education')) {
            pageSpecific = "Interested in Ashish's academic background? ";
        } else if (path.includes('experience')) {
            pageSpecific = "Explore Ashish's cloud & development internship experience! ";
        } else if (path.includes('contact')) {
            pageSpecific = "Need to get in touch? You can fill the form or ask me details here! ";
        }

        setTimeout(() => {
            removeTypingIndicator();
            renderMessage(`👋 Hi there! ${pageSpecific}I'm Ashish's virtual assistant. Ask me anything about him, or choose a prompt below!`, 'bot');
            renderQuickReplies(defaultQuickReplies);
        }, 800);
    }

    function handleUserMessageSubmit() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        handleUserMsg(text);
    }

    function handleUserMsg(text) {
        // Render user message
        renderMessage(text, 'user');

        // Render typing indicator
        renderTypingIndicator();

        // Generate and send bot response after dynamic delay
        const responseDelay = Math.max(800, Math.min(1600, text.length * 15));

        setTimeout(() => {
            removeTypingIndicator();
            const botResponse = matchResponse(text);
            renderMessage(botResponse.text, 'bot');

            // Suggest remaining or new quick replies
            if (botResponse.replies && botResponse.replies.length > 0) {
                renderQuickReplies(botResponse.replies);
            } else {
                renderQuickReplies(defaultQuickReplies.filter(r => r.toLowerCase() !== text.toLowerCase()).slice(0, 4));
            }
        }, responseDelay);
    }

    // 5. NLP Matcher
    function matchResponse(text) {
        const cleanedText = text.toLowerCase().trim();

        // Track match counts to find best topic
        let bestTopic = null;
        let maxMatchCount = 0;

        for (const [topic, data] of Object.entries(kb)) {
            let matchCount = 0;
            data.keywords.forEach(keyword => {
                // Check if word/phrase exists in the cleaned text
                if (cleanedText.includes(keyword)) {
                    matchCount++;
                    // Extra weight for exact matches or full keyword matches
                    if (cleanedText === keyword) matchCount += 2;
                }
            });

            if (matchCount > maxMatchCount) {
                maxMatchCount = matchCount;
                bestTopic = topic;
            }
        }

        // Return matching response or default fallback
        if (bestTopic && maxMatchCount > 0) {
            // Customize replies based on matches to keep suggestions fresh
            let topicReplies = [...defaultQuickReplies];
            if (bestTopic === 'skills') {
                topicReplies = ["Show experience", "Get contact details", "Tell me about services"];
            } else if (bestTopic === 'experience') {
                topicReplies = ["What are his skills?", "Get contact details", "Show me education"];
            } else if (bestTopic === 'education') {
                topicReplies = ["Show experience", "What are his skills?", "Get contact details"];
            } else if (bestTopic === 'contact') {
                topicReplies = ["Tell me about Ashish", "What are his skills?", "Tell me about services"];
            }

            return {
                text: kb[bestTopic].response,
                replies: topicReplies
            };
        }

        // Fallback response
        return {
            text: "Interesting question! I'm not fully sure how to answer that. As Ashish's assistant, I'm best at sharing details about his <strong>skills</strong>, <strong>experience</strong>, <strong>education</strong>, <strong>services</strong>, or <strong>contact information</strong>. Feel free to choose one of these areas below!",
            replies: defaultQuickReplies
        };
    }
});
