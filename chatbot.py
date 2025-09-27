import json
import random
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ProgrammingChatbot:
    def __init__(self, dataset_file="dataset.json"):
        self.dataset = self.load_dataset(dataset_file)
        self.vectorizer = TfidfVectorizer()
        self.setup_knowledge_base()
    
    def load_dataset(self, dataset_file):
        try:
            with open(dataset_file, 'r') as f:
                return json.load(f)
        except:
            return {
                "python": [
                    {"question": "How to create a list in Python?", "answer": "Use square brackets: my_list = [1, 2, 3]"},
                    {"question": "How to define a function?", "answer": "Use the def keyword: def my_function():"}
                ],
                "general": [
                    {"question": "What is programming?", "answer": "Programming is the process of creating instructions for computers to execute."}
                ]
            }
    
    def setup_knowledge_base(self):
        self.documents = []
        self.answers = []
        
        for category, qna_list in self.dataset.items():
            for qna in qna_list:
                self.documents.append(qna['question'])
                self.answers.append(qna['answer'])
        
        if self.documents:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)
        else:
            self.tfidf_matrix = None
    
    def get_response(self, user_input):
        for category, qna_list in self.dataset.items():
            for qna in qna_list:
                if qna['question'].lower() in user_input.lower():
                    return qna['answer']
        
        if self.tfidf_matrix is not None:
            query_vec = self.vectorizer.transform([user_input])
            similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
            best_match_idx = np.argmax(similarities)
            
            if similarities[best_match_idx] > 0.1:
                return self.answers[best_match_idx]
        
        fallback_responses = [
            "I'm not sure about that. Could you try asking about a specific programming concept?",
            "I don't have information on that topic yet. Try asking about Python, JavaScript, or Java concepts.",
            "That's an interesting question. Could you rephrase it or ask about a different programming topic?"
        ]
        
        return random.choice(fallback_responses)