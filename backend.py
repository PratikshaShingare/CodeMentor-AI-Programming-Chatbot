from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import uuid
from datetime import datetime
import re
import hashlib

app = Flask(__name__)
CORS(app)

users = {}
conversations = {}
user_conversations = {}

dataset = {
    "intents": [
        {
            "tag": "greeting",
            "patterns": ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "what's up", "howdy"],
            "responses": [
                "Hello! 👋 I'm CodeMentor AI. How can I help you with programming today?",
                "Hi there! 😊 What programming topic would you like to explore?",
                "Hey! Ready to dive into some coding? What can I help you with?",
                "Greetings! 💻 I'm here to assist with all your programming questions!"
            ]
        },
        {
            "tag": "goodbye",
            "patterns": ["bye", "goodbye", "see you", "see ya", "exit", "quit", "later"],
            "responses": [
                "Goodbye! 👋 Feel free to come back if you have more programming questions!",
                "See you later! Happy coding! 😄",
                "Bye! Don't hesitate to return if you need more help!",
                "Farewell! 🚀 Keep coding and learning!"
            ]
        },
        {
            "tag": "thanks",
            "patterns": ["thank you", "thanks", "thank you very much", "appreciate it", "thanks a lot"],
            "responses": [
                "You're welcome! 😊 Happy to help with your programming journey!",
                "Anytime! 👍 Let me know if you have more questions!",
                "Glad I could help! 💻 Keep coding and learning!",
                "My pleasure! 🎯 Feel free to ask more programming questions!"
            ]
        },
        {
            "tag": "python_functions",
            "patterns": [
                "how to create function in python", "python function syntax", "define function python",
                "python def", "function in python", "how to write function python",
                "python function example", "create function python"
            ],
            "responses": [
                "In Python, you define a function using the `def` keyword:\n\n```python\ndef function_name(parameters):\n    \"\"\"Docstring explaining the function\"\"\"\n    # function body\n    return value\n```\n\nExample:\n```python\ndef greet(name):\n    return f\"Hello, {name}!\"\n\nprint(greet(\"Alice\"))  # Output: Hello, Alice!\n```",
                "Here's how to create functions in Python:\n\n```python\ndef add_numbers(a, b):\n    \"\"\"Add two numbers and return the result\"\"\"\n    result = a + b\n    return result\n\n# Using the function\nsum_result = add_numbers(5, 3)\nprint(sum_result)  # Output: 8\n```"
            ]
        },
        {
            "tag": "javascript_functions",
            "patterns": [
                "javascript function", "js function syntax", "how to write function javascript",
                "function in js", "javascript function example", "create function javascript"
            ],
            "responses": [
                "In JavaScript, you can define functions in several ways:\n\n```javascript\n// Function declaration\nfunction functionName(parameters) {\n    // function body\n    return value;\n}\n\n// Function expression\nconst functionName = function(parameters) {\n    // function body\n    return value;\n};\n\n// Arrow function (ES6)\nconst functionName = (parameters) => {\n    // function body\n    return value;\n};\n```",
                "JavaScript functions example:\n\n```javascript\n// Traditional function\nfunction calculateArea(width, height) {\n    return width * height;\n}\n\n// Arrow function\nconst calculateArea = (width, height) => width * height;\n\nconsole.log(calculateArea(5, 10)); // Output: 50\n```"
            ]
        },
        {
            "tag": "java_methods",
            "patterns": [
                "java method", "how to create method in java", "java function syntax",
                "method in java", "java method example", "define method java"
            ],
            "responses": [
                "In Java, methods are defined within classes:\n\n```java\npublic class Example {\n    // Method definition\n    public static returnType methodName(parameters) {\n        // method body\n        return value;\n    }\n    \n    // Example\n    public static int addNumbers(int a, int b) {\n        return a + b;\n    }\n}\n```",
                "Java methods example:\n\n```java\npublic class Calculator {\n    public int multiply(int a, int b) {\n        return a * b;\n    }\n    \n    public static void main(String[] args) {\n        Calculator calc = new Calculator();\n        int result = calc.multiply(5, 4);\n        System.out.println(result); // Output: 20\n    }\n}\n```"
            ]
        },
        {
            "tag": "react_components",
            "patterns": [
                "react component", "how to create react component", "react functional component",
                "react component example", "what is react component"
            ],
            "responses": [
                "React components can be functional or class-based. Here's a functional component:\n\n```jsx\nimport React from 'react';\n\nfunction Welcome(props) {\n    return <h1>Hello, {props.name}!</h1>;\n}\n\n// Or using arrow function\nconst Welcome = (props) => {\n    return <h1>Hello, {props.name}!</h1>;\n};\n\n// Using the component\nfunction App() {\n    return <Welcome name=\"Alice\" />;\n}\n```",
                "React component with hooks:\n\n```jsx\nimport React, { useState } from 'react';\n\nfunction Counter() {\n    const [count, setCount] = useState(0);\n    \n    return (\n        <div>\n            <p>Count: {count}</p>\n            <button onClick={() => setCount(count + 1)}>\n                Increment\n            </button>\n        </div>\n    );\n}\n\nexport default Counter;\n```"
            ]
        },
        {
            "tag": "html_structure",
            "patterns": [
                "html basic structure", "html template", "basic html page",
                "html document structure", "how to create html page"
            ],
            "responses": [
                "Basic HTML5 structure:\n\n```html\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Document Title</title>\n</head>\n<body>\n    <header>\n        <h1>Welcome to My Website</h1>\n    </header>\n    <main>\n        <p>This is the main content.</p>\n    </main>\n    <footer>\n        <p>&copy; 2024 My Website</p>\n    </footer>\n</body>\n</html>\n```"
            ]
        },
        {
            "tag": "css_flexbox",
            "patterns": [
                "css flexbox", "how to use flexbox", "flexbox layout",
                "css flex container", "flexbox examples"
            ],
            "responses": [
                "CSS Flexbox makes layout easy:\n\n```css\n.container {\n    display: flex;\n    justify-content: center; /* Horizontal alignment */\n    align-items: center;     /* Vertical alignment */\n    flex-direction: row;     /* row, column, row-reverse, column-reverse */\n    flex-wrap: wrap;         /* wrap, nowrap */\n}\n\n.item {\n    flex: 1;                /* Grow and shrink equally */\n    margin: 10px;\n}\n```\n\nExample HTML:\n```html\n<div class=\"container\">\n    <div class=\"item\">Item 1</div>\n    <div class=\"item\">Item 2</div>\n    <div class=\"item\">Item 3</div>\n</div>\n```"
            ]
        },
        {
            "tag": "git_commands",
            "patterns": [
                "git basic commands", "git tutorial", "how to use git",
                "git commit push", "git commands list"
            ],
            "responses": [
                "Essential Git commands:\n\n```bash\n# Initialize a new Git repository\ngit init\n\n# Clone a repository\ngit clone <repository-url>\n\n# Check status\ngit status\n\n# Add files to staging\ngit add <file-name>\ngit add .  # Add all files\n\n# Commit changes\ngit commit -m \"Commit message\"\n\n# Push to remote repository\ngit push origin main\n\n# Pull latest changes\ngit pull origin main\n\n# Create and switch to new branch\ngit checkout -b new-branch\n\n# Merge branches\ngit merge branch-name\n```"
            ]
        },
        {
            "tag": "sql_basics",
            "patterns": [
                "sql basics", "sql commands", "how to write sql query",
                "sql select statement", "database queries"
            ],
            "responses": [
                "Basic SQL commands:\n\n```sql\n-- Create database\nCREATE DATABASE database_name;\n\n-- Create table\nCREATE TABLE users (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(100),\n    email VARCHAR(100),\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Insert data\nINSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');\n\n-- Select data\nSELECT * FROM users;\nSELECT name, email FROM users WHERE id = 1;\n\n-- Update data\nUPDATE users SET email = 'newemail@example.com' WHERE id = 1;\n\n-- Delete data\nDELETE FROM users WHERE id = 1;\n```"
            ]
        }
    ]
}

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def get_bot_response(message):
    """Get bot response based on user message"""
    message_lower = message.lower().strip()
    
    for intent in dataset.get('intents', []):
        for pattern in intent['patterns']:
            if re.search(r'\b' + re.escape(pattern.lower()) + r'\b', message_lower):
                return intent['responses'][0] if intent['responses'] else "I can help with that!"
    
    default_responses = [
        "I can help you with programming concepts! What specific language or topic are you interested in?",
        "I'm here to assist with Python, JavaScript, Java, SQL, Git, and other programming topics!",
        "Feel free to ask me anything about coding and programming! I can help with various languages and concepts.",
        "I'd be happy to help you learn programming concepts. What's your question about?"
    ]
    
    return default_responses[len(message) % len(default_responses)]

@app.route('/')
def home():
    return jsonify({"message": "CodeMentor AI API is running!", "status": "success"})

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        email = data.get('email', '').strip()

        if not username or not password:
            return jsonify({'success': False, 'error': 'Username and password are required'}), 400

        if username in users:
            return jsonify({'success': False, 'error': 'Username already exists'}), 400

        user_id = str(uuid.uuid4())
        users[username] = {
            'id': user_id,
            'username': username,
            'password': hash_password(password),
            'email': email,
            'preferences': {'theme': 'light', 'animations': True},
            'createdAt': datetime.now().isoformat()
        }

        conversation_id = str(uuid.uuid4())
        new_convo = {
            'id': conversation_id,
            'title': 'Welcome Chat',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        user_conversations[user_id] = [new_convo]
        conversations[conversation_id] = []

        return jsonify({
            'success': True,
            'user': {
                'username': username,
                'preferences': users[username]['preferences']
            }
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        if not username or not password:
            return jsonify({'success': False, 'error': 'Username and password are required'}), 400

        user = users.get(username)
        if not user or user['password'] != hash_password(password):
            return jsonify({'success': False, 'error': 'Invalid username or password'}), 401

        return jsonify({
            'success': True,
            'user': {
                'username': username,
                'preferences': user['preferences']
            }
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    try:
        username = request.headers.get('Username', 'default')
        user = users.get(username)
        if not user:
            return jsonify({'conversations': []})
        
        user_id = user['id']
        return jsonify({'conversations': user_conversations.get(user_id, [])})
    except Exception as e:
        return jsonify({'conversations': [], 'error': str(e)})

@app.route('/api/conversations', methods=['POST'])
def create_conversation():
    try:
        username = request.headers.get('Username', 'default')
        user = users.get(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.json
        conversation_id = str(uuid.uuid4())
        
        new_convo = {
            'id': conversation_id,
            'title': data.get('title', 'New Chat'),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        user_id = user['id']
        if user_id not in user_conversations:
            user_conversations[user_id] = []
        
        user_conversations[user_id].insert(0, new_convo)
        conversations[conversation_id] = []
        
        return jsonify({'conversation': new_convo})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversations/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    try:
        return jsonify({'messages': conversations.get(conversation_id, [])})
    except Exception as e:
        return jsonify({'messages': [], 'error': str(e)})

@app.route('/api/conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    try:
        username = request.headers.get('Username', 'default')
        user = users.get(username)
        if user:
            user_id = user['id']
            if user_id in user_conversations:
                user_conversations[user_id] = [conv for conv in user_conversations[user_id] if conv['id'] != conversation_id]
        
        if conversation_id in conversations:
            del conversations[conversation_id]
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/conversations/<conversation_id>', methods=['PUT'])
def update_conversation(conversation_id):
    try:
        username = request.headers.get('Username', 'default')
        user = users.get(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.json
        user_id = user['id']
        
        if user_id in user_conversations:
            for conv in user_conversations[user_id]:
                if conv['id'] == conversation_id:
                    conv['title'] = data.get('title', conv['title'])
                    conv['updatedAt'] = datetime.now().isoformat()
                    return jsonify({'conversation': conv})
        
        return jsonify({'error': 'Conversation not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        username = request.headers.get('Username', 'default')
        user = users.get(username)
        conversation_id = data.get('conversation_id')
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            new_convo = {
                'id': conversation_id,
                'title': user_message[:25] + '...' if len(user_message) > 25 else user_message or 'New Chat',
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            
            if user:
                user_id = user['id']
                if user_id not in user_conversations:
                    user_conversations[user_id] = []
                user_conversations[user_id].insert(0, new_convo)
            conversations[conversation_id] = []
        
        user_msg_obj = {
            'id': str(uuid.uuid4()),
            'text': user_message,
            'sender': 'user',
            'timestamp': datetime.now().isoformat()
        }
        
        if conversation_id not in conversations:
            conversations[conversation_id] = []
        conversations[conversation_id].append(user_msg_obj)
        
        bot_response = get_bot_response(user_message)
        
        bot_msg_obj = {
            'id': str(uuid.uuid4()),
            'text': bot_response,
            'sender': 'bot',
            'timestamp': datetime.now().isoformat()
        }
        conversations[conversation_id].append(bot_msg_obj)
        
        return jsonify({
            'response': bot_response,
            'conversation_id': conversation_id,
            'typing_delay': 1
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    suggestions = [
        "How do I write a function in Python?",
        "Explain JavaScript closures",
        "What is React hooks?",
        "How to use Git branches?",
        "What is object-oriented programming?",
        "How to debug JavaScript code?",
        "Explain Python list comprehensions",
        "What is async/await in JavaScript?",
        "How to create a REST API?",
        "What is CSS Flexbox?"
    ]
    return jsonify({'suggestions': suggestions})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')