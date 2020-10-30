# gmail-api
1. Install necessary packages using `npm install`.
2. Save your GCP dev account's client secrets in the directory with the name `client_secret.json`.
3. Run the server using `node server.js`.
4. Go to [http://localhost:3000/api](http://localhost:3000/api) on your browser to start the OAuth process. This also saves access tokens to a local file.
5. Now use Postman or a similar tool to make a POST request to [http://localhost:3000/api/send](http://localhost:3000/api/send) with request JSON body of the form:

  ```javascript
  {
    "to": "<insert recipient address>",
    "subject": "<insert email subject>",
    "messageBody": "<insert email body>"
  }
  ```
