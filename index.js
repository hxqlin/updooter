/**
 * A Bot for Slack!
 */

/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don"t have a way to find out who installed us, so we can"t message them :(
 */

function onInstallation (bot, installer) {
    if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say("I am a bot that has just joined your team");
                convo.say("You must now /invite me to a channel so that I can be of use!");
            }
        });
    }
}

/**
 * Configure the persistence options
 */

let config = {};

if (process.env.MONGOLAB_URI) {
    const BotkitStorage = require("botkit-storage-mongo");
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN)? "./db_slack_bot_ci/":"./db_slack_bot_a/"), //use a different name if an app or CI
    };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */
let controller;

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    const customIntegration = require("./lib/custom_integrations");
    const token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && (process.env.PORT || 5000)) {
    //Treat this as an app
    const app = require("./lib/apps");
    controller = app.configure(process.env.PORT || 5000, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log("Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment");
    process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren"t going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on("rtm_open", function (bot) {
    console.log("** The RTM api just connected!");
});

controller.on("rtm_close", function (bot) {
    console.log("** The RTM api just closed");
    // you may want to attempt to re-open
});

/**
 * When a user is created or updated, save their information to the data store.
 */

controller.on(["create_user", "update_user"], function(bot, user) {
    controller.storage.users.save(user);
    console.log("user saved " + JSON.stringify(user));
});

/**
 * Core bot logic goes here!
 */

let aReactions = ["pray", "fire", "sunglasses", "aussieparrot", "fastparrot", "kirby", "sonic", 
    "congaparrot", "fiestaparrot", "dealwithitparrot", "ice-cream-parrot", "nyan_parrot", "bananadance",
    "thumbsup_parrot", "coffee_parrot", "explodyparrot", "shuffleparrot", "ultrafastparrot", "braedon", 
    "benton", "cynthia_kawaii", "parrotdad", "eyes"]; // 23 in total

/**
 * A direct mention gets updoots from the bot!
 */

controller.on("direct_mention,mention", function (bot, message) { // 23
    for (reaction of aReactions) {
        bot.api.reactions.add({
            timestamp: message.ts,
            channel: message.channel,
            name: reaction,
        });
    } 
});

/**
 * Message the bot "updoot [CHANNEL NAME]" to have the bot react to the latest message
 * in #[CHANNEL NAME] on your behalf! [CHANNEL NAME] must be a public channel.
 */

controller.hears("updoot .*", "direct_message", function(bot,message) {
    console.log(message);
    const aText = message.text.split(" ");
    const sChannelName = aText[1];
    console.log(sChannelName);
    console.log("this user sent me a message: " + message.user);
    let user;

    controller.storage.users.get(message.user, function(error, storedUser){
        user = storedUser;
        console.log("user: " + JSON.stringify(user));
        console.log("error: " + error);
    });

    if (!user) {
        bot.reply(message, "not authorized");
        return;
    }

    const WebClient = require("@slack/client").WebClient;
    const token = process.env.SLACK_API_TOKEN || ""; // from env in this case or your data store
    const web = new WebClient(token);
    let channel;

    const channelsPromise = new Promise(function(resolve, reject) {
        web.channels.list({}, function(err,response) {
            channel = response.channels.find((channel) => channel.name === sChannelName);
            if (channel) {
                resolve("found channel");
            } else {
                reject("didn't find channel");
            }
        });
      })
      .then(() => {
        web.channels.history({channel: channel.id, count: 1}, function(err, response) {
            const latest = response.messages[0];
            const aReactPromises = [];

            const http = require("https");

            for (reaction of aReactions) {
                const reactPromise = new Promise(function(resolve, reject) {
                    const options = {
                        "method": "POST",
                        "hostname": "slack.com",
                        "path": "/api/reactions.add?token=" + user.access_token + 
                            "&name=" + reaction + 
                            "&channel=" + channel.id + 
                            "&timestamp=" + latest.ts
                    };
            
                    const req = http.request(options, function (res) {
                        const chunks = [];
                
                        res.on("data", function (chunk) {
                            chunks.push(chunk);
                        });
                
                        res.on("end", function () {
                            const body = Buffer.concat(chunks);
                            const response = JSON.parse(body.toString());
                            if (response.ok) {
                                resolve(response);
                            } else {
                                reject(response);
                            }
                        });
                    });
                    req.end();
                });
                aReactPromises.push(reactPromise);
            }
            const reflect = promise => promise.then(value => ({value, status: "fulfilled" }),
                            error => ({error, status: "rejected" }));

            Promise.all(aReactPromises.map(reflect)).then(function(results){
                console.log(results);
                const error = results.some(x => x.status === "rejected");
                if (error) {
                    console.log("something went wrong when trying to add reactions")
                    bot.reply(message, "something went wrong");
                } else {
                    console.log("reacted successfully")
                    bot.reply(message, "reacted successfully");
                }
            });
        });
      })
      .catch((error) => {
          console.log(error);
          console.log("something went wrong when getting the channels")
          bot.reply(message, "something went wrong");
      });
});


