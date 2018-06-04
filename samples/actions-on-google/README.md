# Dialogflow Fulfillment Actions on Google Sample

## Setup
Choose one of the three options listed below for setup.  You only need to complete one of the three options below to setup this sample.

### Option 1: Add to Dialogflow (recommended)
Click on the **Add to Dialogflow** button below and follow the prompts to create a new agent:

[![Dialogflow Fullfillment: Actions on Google](https://storage.googleapis.com/dialogflow-oneclick/deploy.svg "Dialogflow Fullfillment: Actions on Google")](https://console.dialogflow.com/api-client/oneclick?templateUrl=https%3A%2F%2Fstorage.googleapis.com%2Fdialogflow-oneclick%2Factions-on-google-agent.zip&agentName=ActionsOnGoogleSample)

### Option 2: Dialogflow Inline Editor
1. [Sign up for or sign into Dialogflow](https://console.dialogflow.com/api-client/#/login) and [create a agent](https://dialogflow.com/docs/agents#create_an_agent)
1. Go to your agent's settings and [Restore from zip](https://dialogflow.com/docs/agents#export_and_import) using the `dialogflow-agent.zip` in this directory (Note: this will overwrite your existing agent)
1. [Enable the Cloud Function for Firebase inline editor](https://dialogflow.com/docs/fulfillment#cloud_functions_for_firebase)
1. Copy this code in `functions/index.js` the `index.js` file in the Dialogflow Cloud Function for Firebase inline editor.
1. Add `"dialogflow-fulfillment": "^0.4.1"` and `"actions-on-google": "^2.1.3"` to the `package.json` file's `dependencies` object in the Dialogflow Cloud Function for Firebase inline editor.
1. Click `Deploy`

### Option 3: Firebase CLI
1. [Sign up for or sign into Dialogflow](https://console.dialogflow.com/api-client/#/login) and [create a agent](https://dialogflow.com/docs/agents#create_an_agent)
1. Go to your agent's settings and [Restore from zip](https://dialogflow.com/docs/agents#export_and_import) using the `dialogflow-agent.zip` in this directory (Note: this will overwrite your existing agent)
1. `cd` to the `functions` directory
1. Run `npm install`
1. Install the Firebase CLI by running `npm install -g firebase-tools`
1. Login to your Google account with `firebase login`
1. Add your project to the sample with `firebase use [project ID]` [find your project ID here](https://dialogflow.com/docs/agents#settings)
1. Run `firebase deploy --only functions:dialogflowFirebaseFulfillment`
1. Paste the URL into your Dialogflow agent's fulfillment and click `Save`
1. Under the fulfillment section of your `Default Welcome Intent` and `Default Fallback Intent` check the box for `Use webhook` and click `Save`

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
