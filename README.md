# updooter

## The story of updooter

In the SAP Vancouver Interns Slack workspace, interns frequently add lots of reactions to, or "updoot," each other's messages to hype up the content. As you might imagine, this can become tedious when you want to maximize that hype by adding 23 reactions (the maximum Slack allows) to everyone's messages. This seemed like a problem a bot could solve, and thus, updooter was born. updooter adds reactions to message based on user commands and can even "updoot" messages on behalf of the user.

## To add updooter to your workspace:

Instructions adapted from "Using Botkit for Custom Bots" at https://github.com/hxqlin/easy-peasy-bot.

1. Go to https://my.slack.com/apps/new/A0F7YS25R-bots and pick a name for your new bot.
2. Once you’ve clicked “Add integration,” you’ll be taken to a page where you can further customize your bot. Of importance is the bot token—take note of it now.
3. Once you have the token, you can run your bot easily:

    ```bash
    TOKEN=xoxb-your-token-here npm start
    ```

    Your bot will now attempt to log into your team. 
    
4. Add your bot to the conversation and get your message updooted by mentioning @updooter (or whatever username it has been given)! updooter will also updoot the latest message in the channel you specify if you authenticate it. :)

Note: Many of the reactions used by this bot are custom reactions and may not be available in workspaces other than SAP Vncouver Interns.