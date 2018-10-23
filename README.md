# Dialogflow Fulfillment Library
The [Dialogflow Fulfillment Library](https://dialogflow.com/docs/fulfillment) allows you to connect natural language understanding and processing to your own systems, APIs, and databases. Using Fulfillment, you can surface commands and information from your services to your users through a natural conversational interface.

Dialogflow Fulfillment makes creating fulfillment for Dialogflow v1 and v2 agents for 8 chat and voice platforms on Node.js easy and simple.

![fulfillment library works with 8 platforms](https://raw.githubusercontent.com/dialogflow/dialogflow-fulfillment-nodejs/master/dialogflow-fulfillment-graphic.png "Dialogflow's fulfillment library works with 8 platforms")

## Supported features
+ Text
+ Cards
+ Images
+ Suggestion Chips (Quick Replies)
+ Payloads (Platform-specific responses)

This library is intended to help build Node.js Dialogflow Fulfillment for multiple [integrations](https://dialogflow.com/docs/integrations/) including Google Assistant, Slack, Facebook, Telegram, Kik, Skype, Line, and Viber. See the reference documentation for more: https://dialogflow.com/docs/reference/fulfillment-library/webhook-client

If only building Dialogflow Fulfillment for the [Google Assistant](https://dialogflow.com/docs/integrations/google-assistant) and no other integrations, use the Actions of Google NPM module ([actions-on-google](https://www.npmjs.com/package/actions-on-google)) which supports all Actions on Google features.

## Quick Start
1. [Sign-up/Log-in to Dialogflow](https://console.dialogflow.com/api-client/#/login)
2. Create a Dialogflow agent
3. Go to **Fulfillment** > **Enable Dialogflow Inline Editor**<sup> A.</sup > **package.json** tab to add `"dialogflow-fulfillment": "^0.5.0"` to the `dependencies` object.
4. Select **Deploy**.
  <sup>A.</sup> Powered by Cloud Functions for Firebase

## Setup Instructions
```javascript
// Import the appropriate class
const { WebhookClient } = require('dialogflow-fulfillment');

 //Create an instance
const agent = new WebhookClient({request: request, response: response});
```
## Samples
| Name                                 | Language                         |
| ------------------------------------ |:---------------------------------|
|[Dialogflow Fulfillment & Actions on Google](https://github.com/dialogflow/fulfillment-actions-library-nodejs) | Node.js |
| [Dialogflow & Firebase's Firestore DB](https://github.com/dialogflow/fulfillment-firestore-nodejs) | Node.js |
| [Bike Shop-Google Calendar API](https://github.com/dialogflow/fulfillment-bike-shop-nodejs)| Node.js|
| [Temperature Trivia](https://github.com/dialogflow/fulfillment-temperature-converter-nodejs) | Node.js |
|[Multi-language/locale](https://github.com/dialogflow/fulfillment-multi-locale-nodejs)| Node.js |
| [Dialogflow's Inline Editor Template](https://github.com/dialogflow/fulfillment-webhook-nodejs)| Node.js |

## References & Issues
+ Questions? Try [StackOverflow](https://stackoverflow.com/questions/tagged/dialogflow) or [Dialogflow Developer Community](https://plus.google.com/communities/103318168784860581977).
+ For bugs, please report an issue on [Github](https://github.com/dialogflow/dialogflow-fulfillment-nodejs/issues).
+ Dialogflow [Documentation](https://docs.dialogflow.com).
+ [Dialogflow WebhookClient class reference doc](https://dialogflow.com/docs/reference/fulfillment-library/webhook-client).
+ [Dialogflow rich response classes reference doc](https://dialogflow.com/docs/reference/fulfillment-library/webhook-client).
+ For more info on [Actions on Google NPM module](https://github.com/actions-on-google/actions-on-google-nodejs)
+ For more info on [Building Actions on Google with Dialogflow Agents Documentation](https://developers.google.com/actions/dialogflow/)

## Limitations
No verification for platforms-specific incompatible response combinations (i.e. multiple cards are not supported in a single Actions on Google response).

## How To Make Contributions
Please read and follow the steps in the CONTRIBUTING.md.

## License
See LICENSE.md.

## Terms
Your use of this sample is subject to, and by using or downloading the sample files you agree to comply with, the [Google APIs Terms of Service](https://developers.google.com/terms/).
