# CDC Reader

This script automatically fetches the latest results from the CDC noticeboard. Yep, fully automated; no need to waste 3 minutes every time you want to check the board!

An implementation of this is accessible via the `,cdc` command in the `#bot-spam` channel on the [IIT Kharagpur Discord server](https://discord.gg/PnJdRu76yc).


## Installing

`git clone` into `cd cdc-reader` into `npm install`. Windows users, you're on your own.


## Configuring

Clone the `src/credentials-example.json` into `src/credentials.json` and fill in your values. The `src/config.js` file only really has one option, and that's `strictQuestions<Boolean>`, which basically compares letters instead of the exact question (with `false`, 'How are you' is the same as 'how are you', primarily added for special characters that web requests suck at dealing with; `true` compares stuff including capitalization).

You can specify `false` instead of an answer if you don't remember the answer to it; the script will just try again until it gets a question you have an answer for.


## Terms of Use

Go wild. I'm not responsible for anything you do with this code, nor am I responsible if this code breaks something. Credit me if you do use this code (or any substantial portion of it).


## Clarifications

* No, I am not collecting your passwords (or any data, for that matter; you can check the `src/index.js` file to see all outgoing requests and data).
* Yes, I made this for free. If you want to sponsor me, buy me a coffee. :3
* No, please don't try and pass off this code as your own elsewhere. I put in work into this. :<

