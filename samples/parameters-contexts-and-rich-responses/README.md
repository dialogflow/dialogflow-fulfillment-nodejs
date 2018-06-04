# Temperature Trivia

## Setup
Choose one of the three options listed below for setup.  You only need to complete one of the three options below to setup this sample.

### Option 1: Add to Dialogflow (recommended)
Click on the **Add to Dialogflow** button below and follow the prompts to create a new agent:

[![Temperature Trivia](https://storage.googleapis.com/dialogflow-oneclick/deploy.svg "Temperature Trivia")](https://console.dialogflow.com/api-client/oneclick?templateUrl=https%3A%2F%2Fstorage.googleapis.com%2Fdialogflow-oneclick%2Ftemperature-converter-agent.zip&agentName=TemperatureConverterSample)

### Option 2: Dialogflow Inline Editor
1. [Sign up for or sign into Dialogflow](https://console.dialogflow.com/api-client/#/login) and [create a agent](https://dialogflow.com/docs/agents#create_an_agent)
1. Go to your agent's settings and [Restore from zip](https://dialogflow.com/docs/agents#export_and_import) using the `dialogflow-agent.zip` in this directory (Note: this will overwrite your existing agent)
1. [Enable the Cloud Function for Firebase inline editor](https://dialogflow.com/docs/fulfillment#cloud_functions_for_firebase)
1. Change the name of the function in `functions/index.js` from `dialogflowFulfillmentLibAdvancedSample` to `dialogflowFirebaseFulfillment`
1. Copy this code in `functions/index.js` the `index.js` file in the Dialogflow Cloud Function for Firebase inline editor.
1. Add `"dialogflow-fulfillment": "^0.4.0"` to the `package.json` file's `dependencies` object in the Dialogflow Cloud Function for Firebase inline editor.
1. Click `Deploy`

### Setup: Firebase CLI (option 2)

1. [Sign up for or sign into Dialogflow](https://console.dialogflow.com/api-client/#/login) and [create a agent](https://dialogflow.com/docs/agents#create_an_agent)
1. Go to your agent's settings and [Restore from zip](https://dialogflow.com/docs/agents#export_and_import) using the `dialogflow-agent.zip` in this directory (Note: this will overwrite your existing agent)
1. `cd` to the `functions` directory
1. Run `npm install`
1. Install the Firebase CLI by running `npm install -g firebase-tools`
1. Login to your Google account with `firebase login`
1. Add your project to the sample with `firebase use [project ID]` [find your project ID here](https://dialogflow.com/docs/agents#settings)
1. Run `firebase deploy --only functions:dialogflowFulfillmentLibAdvancedSample`
1. Paste the URL into your Dialogflow agent's fulfillment

## References and How to report bugs
* Dialogflow documentation: [https://docs.dialogflow.com](https://docs.dialogflow.com).
* If you find any issues, please open a bug on [GitHub](https://github.com/dialogflow/dialogflow-fulfillment-nodejs/issues).
* Questions are answered on [StackOverflow](https://stackoverflow.com/questions/tagged/dialogflow).

## How to make contributions?
Please read and follow the steps in the CONTRIBUTING.md.

## License
See LICENSE.md.

## Terms
Your use of this sample is subject to, and by using or downloading the sample files you agree to comply with, the [Google APIs Terms of Service](https://developers.google.com/terms/).
