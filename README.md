# Token Stealer
[![Licence](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/Trard/token-stealer-bot/blob/master/LICENSE)
[![Stars](https://img.shields.io/github/stars/Trard/token-stealer-bot?style=social)](https://github.com/Trard/token-stealer-bot/stargazers)

Bot to steal tokens from github.

## Disclaimer
Bot for informational purposes only.
I am not responsible for any damage caused by the bot inside my repository.

## Installation
> **[Node.js](https://nodejs.org/) is required**  
> **[Redis](https://redis.io/) is required**  

### Clon the bot:
```
git clone https://github.com/Trard/stealer.git
```

### Add environment variables:
- GITHUB_TOKEN="token from github"
- STEALER_TELEGRAM_TOKEN="token from telegram bot"
- STEALER_MONGO_LINK="link mongodb"

### Install dependencies:
```
npm install
```

## Run

### Start the bot:
```
npm start
```
