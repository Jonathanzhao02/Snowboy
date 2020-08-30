# SnowBoy
Welcome to the Snowboy Discord bot repository!

## About
Snowboy is a voice-activated Discord bot built with discord.js.
The speech-recognition capabilities come from Wit.ai and Snowboy (hence the name, since that was their most popular hotword detection).
It also utilizes a few Google Cloud APIs such as Youtube's data API and Google's search API to accomplish a few features.
It is NOT verified, so it cannot be invited to more than 100 servers.

## Usage
To install every package, navigate to the directory and run the following command:
```bash
npm install
```

Afterwards, simply run:
```bash
node index.js
```

This should run the bot.
Some command line arguments can be passed in, such as `-t` or `--testing` to use the testing bot account.

There are a few environmental variables/keys/tokens which need to be set for the bot to run properly.
Most of these can be acquired for completely free and should not incur any fees from testing. These should be created in a .env file.

## Contributing
Just read CONTRIBUTING.md real quick.
