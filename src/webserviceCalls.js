const fetchQuestion = (questionID) => {    
  return fetch('https://bible-questions-api.herokuapp.com/?QID='+questionID)            
}

const fetchRandomQuestion = (qtype, books, chapters) => {    
  return fetch('https://bible-questions-api.herokuapp.com/filtered?qtype='+qtype+'&books='+books+'&chapters='+chapters)            
}
export { fetchQuestion, fetchRandomQuestion } 
