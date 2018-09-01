# updooter

## The story of updooter

In the SAP Vancouver Interns Slack workspace, interns frequently add lots of reactions to, or "updoot," each other's messages to hype up the content. As you might imagine, this can become tedious when you want to maximize that hype by adding 23 reactions (the maximum Slack allows) to everyone's messages. This seemed like a problem a bot could solve, and thus, updooter was born. updooter adds reactions to message based on user commands and can even "updoot" messages on behalf of the user.

## To add your own version of updooter to your workspace:

These instructions assume you have npm/Node.js installed. Reference: "Using Botkit for Custom Bots" at https://github.com/hxqlin/easy-peasy-bot. 

1. Go to https://api.slack.com/apps?new_app=1. Pick a name for your bot and a development workspace.
2. Go to Settings > Basic Information > App Credentials and take note of your client ID and client secret.
3. Go to Features > OAuth & Permissions > Tokens for Your Workspace and take note of your OAuth Access token. 
4. Fork or clone this repo. Navigate to the folder using the command line and run your bot like so:

    ```bash
    CLIENT_ID=xxxxxxxxxx.xxxxxxxxxxxx CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx SLACK_API_TOKEN=xoxp-xxxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxxxxxxxx npm start
    ```

Your bot should now become active in your workspace and respond to messages. Get your message updooted by mentioning @updooter (or whatever username it has been given)! updooter will also updoot the latest message in the public channel you specify if you authenticate it. :)

Note: Many of the reactions used by this bot are custom reactions and may not be available in workspaces other than SAP Vancouver Interns.
