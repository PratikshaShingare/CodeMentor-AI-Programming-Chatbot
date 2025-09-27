CodeMentor AI – Programming Chatbot
Instructions to run the chatbot

How the Chatbot Works
The CodeMentor AI chatbot is a full-stack web application built with:
•	Frontend: React.js (with context-based authentication, modern UI, and chat interface).
•	Backend: Python (Flask) handling authentication, dataset processing, and chatbot responses.
•	Dataset: dataset.json contains syllabus/programming-related Q&A pairs. The chatbot looks up queries from this dataset and responds contextually.
•	Flow: 
1.	User registers or logs in.
2.	User types a programming-related query in the chat interface.
3.	The frontend sends the query to the backend (backend.py → chatbot.py).
4.	The backend matches the question against the dataset and returns the best possible answer.
5.	Response is displayed in the chat window, stored in conversation history.
The chatbot also supports conversation history, dark/light theme toggle, and multiple chat sessions.
________________________________________
Syllabus Topics Covered
The chatbot is trained on programming syllabus topics such as:
•	Python (functions, loops, data structures, OOP, file handling, exceptions)
•	JavaScript (variables, functions, closures, DOM manipulation, ES6+)
•	Java (classes, objects, inheritance, exception handling, collections)
•	React (components, hooks, state management)
•	SQL (queries, joins, normalization)
•	Git & Version Control (basic commands, branching, merging)
•	HTML & CSS basics
•	General Programming Concepts (algorithms, debugging, best practices)
(You can extend by updating dataset.json with new Q&A.)
________________________________________
⚙️ Instructions to Run the Chatbot
1. Clone or Download the Project
git clone <your-repo-link>
cd AI_CHATBOT
2. Backend Setup (Python + Flask)
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate       # Linux/Mac
venv\Scripts\activate          # Windows

# Install requirements

flask==2.3.3
flask-cors==4.0.0
flask-jwt-extended==4.5.3
nltk==3.8.1
scikit-learn==1.3.0
numpy==1.24.3

Run the backend:
python backend.py
•	Backend will start on: http://localhost:5000
________________________________________
3. Frontend Setup (React.js)
cd chatbot-frontend

# Install dependencies
npm install
Run the React frontend:
npm start
•	Frontend will start on: http://localhost:3000
________________________________________
4. Access the Chatbot
1.	Open http://localhost:3000 in your browser.
2.	Register/Login with a username & password.
3.	Start chatting with CodeMentor AI.
________________________________________
Summary of Commands
Backend
> cd AI_CHATBOT
> python -m venv venv
> source venv/bin/activate   # or venv\Scripts\activate on Windows
> pip install flask flask-cors
> python backend.py
Frontend
> cd chatbot-frontend
> npm install
> npm start
Now both backend (port 5000) and frontend (port 3000) will run.

