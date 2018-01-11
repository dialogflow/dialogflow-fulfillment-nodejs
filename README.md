# Dialoglfow Fulfillment Library Node.js

The Dialogflow Fulfillment Library makes creating fulfillment for Dialogflow v1 and v2 agents for 8 chat and voice platforms on Node.js easy and simple. Cross-platform text, card, image, suggestion and custom payload responses are supported for Actions on Google, Facebook, Slack, Telegram, Kik, Skype, Line, Viber and Dialogflow's simulator.

Dialogflow fulfillment allows you to connect Dialogflow's natural language understanding and processing to your own systems, APIs and databases. Using fulfillment, you can surface commands and information from your services to your users through a natural conversational interface. More about Dialogflow fulfillment: https://dialogflow.com/docs/fulfillment

## Setup Instructions

 1. Import the appropriate class:

```javascript
const WebhookClient = require('dialogflow-fulfillment');
```

 2. Create an instance:

```javascript
const agent = new WebhookClient({request: request, response: response});
```

## References and How to report bugs
* Dialogflow documentation: [https://docs.dialogflow.com](https://docs.dialogflow.com).
* If you find any issues, please open a bug on [GitHub](https://github.com/dialogflow/dialogflow-fulfillment).
* Questions are answered on [StackOverflow](https://stackoverflow.com/questions/tagged/dialogflow).

## How to make contributions?
Please read and follow the steps in the CONTRIBUTING.md.

## License
See LICENSE.md.

## Terms
Your use of this sample is subject to, and by using or downloading the sample files you agree to comply with, the [Google APIs Terms of Service](https://developers.google.com/terms/).
