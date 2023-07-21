# Telegram bot for language courses

The bot is designed to account for participants in language courses: it has all the necessary information about courses, automates registration for courses, has an admin panel for additional control over processes.

## Installation

Clone the repository:

```bash
git clone https://github.com/VadymSerheiev/telegram-bot.git
```

## Configuration

Before you can run the bot, you need to set up the necessary credentials. Follow the steps below to configure your bot:

1. Create a new Telegram bot and obtain the API token from [BotFather](https://core.telegram.org/bots#botfather).

2. Rename the `.env.example` file to `.env`:

```bash
mv .env.example .env
```

3. Open the .env file using a text editor and replace YOUR_TELEGRAM_BOT_TOKEN with the API token you obtained from BotFather.

```bash
# .env
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
```

4. Register for an account on MongoDB Atlas if you haven't already. MongoDB Atlas is a cloud-based database service. Create a new MongoDB cluster, and once it's set up, obtain the connection URL from MongoDB Atlas. The URL should look like this (with placeholders):

```bash
mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, `<cluster-url>`, and `<database-name>` with your actual MongoDB Atlas credentials and database information.

Add the MongoDB connection URL to the .env file:

```bash
# .env
MONGODB_URL=YOUR_MONGODB_URL
```

## Usage

```bash
# Install dependencies:
npm install

# Running the bot:
npm start 
```