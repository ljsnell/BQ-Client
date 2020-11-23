# Using the app
Go to https://bq-client.herokuapp.com/

Create a room which you want everyone to join for your quiz

![Room](https://imgur.com/uts2Dbe.jpg)

Set your username to `QM` if you'd like to make a quiz (otherwise enter whatever you want)

![QM](https://imgur.com/uBU2ef6.jpg)

If you want a randomly generated quiz select `practice` from the dropdown.
![practice](https://imgur.com/0P9NMrg.jpg)

Next select your question type, select the chapters you want to quiz on, and click `Random Question`. That should push the question to everyone in the room.
![Example](https://imgur.com/43DLiKf.jpg)

# Local Setup
You should be able to `npm install` then `npm start` and get the app running successfully in your local. **Note**: by default it will be pointing to the deployed WebSocket and Api endpoints.

If you want to test websocket changes make the following code changes:
Uncomment `var server = 'http://127.0.0.1:8000/'` and comment `var server = 'wss://mysterious-journey-90036.herokuapp.com'`.

If you want to test bible-quiz-api changes and point to your local instance update the webserviceCall file by uncommenting the `localhost` endpoint and commenting the heroku ones.

These could definitely be moved to a .env file, but figure this way we have the endpoints documented in code.
