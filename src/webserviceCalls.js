const fetchQuestion = (questionID) => {    
        return fetch('https://bible-questions-api.herokuapp.com/?QID='+questionID)            
      }

export { fetchQuestion } 
