# telegram-wordle-bot

Telegram bot that 

### Running Locally

1. Ensure `dynamodb-local` is running
2. `./scripts/up`
  a. start an `ngrok http 3000`
  b. set the telegram webhook URL to the ngrok tunnel
  c. run the app locally (via `yarn serverless offline`)
  
### Deploying

  ```
  yarn sls deploy
  ```
