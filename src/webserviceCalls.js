const fetchQuestion = (questionID) => {    
  return fetch('https://bible-questions-api.herokuapp.com/?QID='+questionID)            
  // return fetch('http://localhost:5000/?QID='+questionID)
}

const fetchQuestionType =  (questionID) => {    
  return fetch('https://bible-questions-api.herokuapp.com/question-type?QID='+questionID)            
  // return fetch('http://localhost:5000/question-type?QID='+questionID)
}

const fetchRandomQuestion = (qtype, books, chapters) => {    
  return fetch('https://bible-questions-api.herokuapp.com/filtered?qtype='+qtype+'&books='+books+'&chapters='+chapters)
  // return fetch('http://localhost:5000/filtered?qtype='+qtype+'&books='+books+'&chapters='+chapters)
}
export { fetchQuestion, fetchRandomQuestion } 
