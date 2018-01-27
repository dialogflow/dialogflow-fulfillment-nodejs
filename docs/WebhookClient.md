<a name="WebhookClient"></a>

## WebhookClient
This is the class that handles the communication with Dialogflow's webhook
fulfillment API v1 & v2 with support for rich responses across 8 platforms and
Dialogflow's simulator

**Kind**: global class  

* [WebhookClient](#WebhookClient)
    * [new WebhookClient(options)](#new_WebhookClient_new)
    * [.agentVersion](#WebhookClient+agentVersion) : <code>number</code>
    * [.action](#WebhookClient+action) : <code>string</code>
    * [.parameters](#WebhookClient+parameters) : <code>Array.&lt;Object&gt;</code>
    * [.contexts](#WebhookClient+contexts) : <code>string</code>
    * [.requestSource](#WebhookClient+requestSource) : <code>string</code>
    * [.query](#WebhookClient+query) : <code>string</code>
    * [.locale](#WebhookClient+locale) : <code>string</code>
    * [.session](#WebhookClient+session) : <code>string</code>
    * [.send(response)](#WebhookClient+send) ⇒ <code>void</code>
    * [.handleRequest(handler)](#WebhookClient+handleRequest) ⇒ <code>void</code>
    * [.addText(textResponse)](#WebhookClient+addText) ⇒ [<code>WebhookClient</code>](#WebhookClient)
    * [.addCard(cardResponse)](#WebhookClient+addCard) ⇒ [<code>WebhookClient</code>](#WebhookClient)
    * [.addImage(imageResponse)](#WebhookClient+addImage) ⇒ [<code>WebhookClient</code>](#WebhookClient)
    * [.addSuggestion(suggestion)](#WebhookClient+addSuggestion) ⇒ [<code>WebhookClient</code>](#WebhookClient)
    * [.addPayload(platform, payload)](#WebhookClient+addPayload) ⇒ [<code>WebhookClient</code>](#WebhookClient)
    * [.buildText(text)](#WebhookClient+buildText) ⇒ [<code>TextResponse</code>](#TextResponse)
    * [.buildCard(title)](#WebhookClient+buildCard) ⇒ [<code>CardResponse</code>](#CardResponse)
    * [.buildImage(imageUrl)](#WebhookClient+buildImage) ⇒ [<code>ImageResponse</code>](#ImageResponse)
    * [.buildSuggestion(suggestion)](#WebhookClient+buildSuggestion) ⇒ [<code>SuggestionsResponse</code>](#SuggestionsResponse)
    * [.buildPayload(platform, payload)](#WebhookClient+buildPayload) ⇒ [<code>PayloadResponse</code>](#PayloadResponse)
    * [.setContext(context)](#WebhookClient+setContext) ⇒ [<code>WebhookClient</code>](#WebhookClient)
    * [.clearOutgoingContexts()](#WebhookClient+clearOutgoingContexts) ⇒ [<code>WebhookClient</code>](#WebhookClient)
    * [.clearContext(context)](#WebhookClient+clearContext) ⇒ [<code>WebhookClient</code>](#WebhookClient)
    * [.getContext(contextName)](#WebhookClient+getContext) ⇒ <code>Object</code>

<a name="new_WebhookClient_new"></a>

### new WebhookClient(options)
Constructor for WebhookClient object
To be used in the Dialogflow fulfillment webhook logic


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | JSON configuration. |
| options.request | <code>Object</code> | Express HTTP request object. |
| options.response | <code>Object</code> | Express HTTP response object. |

<a name="WebhookClient+agentVersion"></a>

### webhookClient.agentVersion : <code>number</code>
The agent version (v1 or v2) based on Dialogflow webhook request
https://dialogflow.com/docs/reference/v2-comparison

**Kind**: instance property of [<code>WebhookClient</code>](#WebhookClient)  
<a name="WebhookClient+action"></a>

### webhookClient.action : <code>string</code>
Dialogflow action or null if no value: https://dialogflow.com/docs/actions-and-parameters

**Kind**: instance property of [<code>WebhookClient</code>](#WebhookClient)  
<a name="WebhookClient+parameters"></a>

### webhookClient.parameters : <code>Array.&lt;Object&gt;</code>
Dialogflow parameters included in the request or null if no value
https://dialogflow.com/docs/actions-and-parameters

**Kind**: instance property of [<code>WebhookClient</code>](#WebhookClient)  
<a name="WebhookClient+contexts"></a>

### webhookClient.contexts : <code>string</code>
Dialogflow contexts included in the request or null if no value
https://dialogflow.com/docs/contexts

**Kind**: instance property of [<code>WebhookClient</code>](#WebhookClient)  
<a name="WebhookClient+requestSource"></a>

### webhookClient.requestSource : <code>string</code>
Dialogflow source included in the request or null if no value
https://dialogflow.com/docs/reference/agent/query#query_parameters_and_json_fields

**Kind**: instance property of [<code>WebhookClient</code>](#WebhookClient)  
<a name="WebhookClient+query"></a>

### webhookClient.query : <code>string</code>
Original user query as indicated by Dialogflow or null if no value

**Kind**: instance property of [<code>WebhookClient</code>](#WebhookClient)  
<a name="WebhookClient+locale"></a>

### webhookClient.locale : <code>string</code>
Original request language code or locale (i.e. "en" or "en-US")

**Kind**: instance property of [<code>WebhookClient</code>](#WebhookClient)  
<a name="WebhookClient+session"></a>

### webhookClient.session : <code>string</code>
Dialogflow input contexts included in the request or null if no value
Dialogflow v2 API only
https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/WebhookRequest#FIELDS.session

**Kind**: instance property of [<code>WebhookClient</code>](#WebhookClient)  
<a name="WebhookClient+send"></a>

### webhookClient.send(response) ⇒ <code>void</code>
Sends a response back to a Dialogflow fulfillment webhook request

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| response | <code>Array.&lt;string&gt;</code> \| [<code>Array.&lt;RichResponse&gt;</code>](#RichResponse) | additional responses to send |

<a name="WebhookClient+handleRequest"></a>

### webhookClient.handleRequest(handler) ⇒ <code>void</code>
Handles the incoming Dialogflow request using a handler or Map of handlers
Each handler must be a function callback.

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>Map</code> \| <code>requestCallback</code> | map of Dialogflow action name to handler function or     function to handle all requests (regardless of Dialogflow action). |

<a name="WebhookClient+addText"></a>

### webhookClient.addText(textResponse) ⇒ [<code>WebhookClient</code>](#WebhookClient)
Add a text response to be sent to Dialogflow via message objects
v1 Generic: https://dialogflow.com/docs/reference/agent/message-objects#text_response
v1 Google: https://dialogflow.com/docs/reference/agent/message-objects#simple_response
v2 Generic: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#text
v2 Google: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#simpleresponse

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| textResponse | <code>string</code> \| <code>Object</code> | text response string or an object representing a text response |

**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
agent.addText('sample text response');
const googleTextResponse = {text: 'sample text response', platform: agent.ACTIONS_ON_GOOGLE};
agent.addText(googleTextResponse);
const textResponse = agent.buildText('sample text response');
agent.addText(textResponse);
```
<a name="WebhookClient+addCard"></a>

### webhookClient.addCard(cardResponse) ⇒ [<code>WebhookClient</code>](#WebhookClient)
Add a card response to be sent to Dialogflow via message objects
v1 Generic: https://dialogflow.com/docs/reference/agent/message-objects#card_message_object
v1 Google Assistant: https://dialogflow.com/docs/reference/agent/message-objects#basic_card_response
v2 Generic: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#card
v2 Google Assistant: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#basiccard

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| cardResponse | <code>string</code> \| <code>Object</code> | text response string or an object representing a text response |

**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
agent.addCard('sample text response');
const googleCardResponse = {title: 'sample text response', platform: agent.ACTIONS_ON_GOOGLE}
agent.addCard(googleCardResponse);
const cardResponse = agent.buildCard('sample text response')
agent.addCard(cardResponse);
```
<a name="WebhookClient+addImage"></a>

### webhookClient.addImage(imageResponse) ⇒ [<code>WebhookClient</code>](#WebhookClient)
Add a image response to be sent to Dialogflow via message objects
v1 Generic: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#image
v1 Google Assistant: https://dialogflow.com/docs/reference/agent/message-objects#basic_card_response
v2 Generic: https://dialogflow.com/docs/reference/agent/message-objects#image_message_object
v2 Google Assistant: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#basiccard

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| imageResponse | <code>string</code> \| <code>Object</code> | image URL string or an object representing a image response |

**Example**  
```js
const imageUrl = 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png'
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
agent.addImage(imageUrl);
const googleImageResponse = {imageUrl: imageUrl, platform: agent.ACTIONS_ON_GOOGLE}
agent.addImage(googleImageResponse);
const imageResponse = agent.buildImage(imageUrl)
agent.addImage(imageResponse);
```
<a name="WebhookClient+addSuggestion"></a>

### webhookClient.addSuggestion(suggestion) ⇒ [<code>WebhookClient</code>](#WebhookClient)
Add a suggestion response to be sent to Dialogflow via message objects
v1 Generic: https://dialogflow.com/docs/reference/agent/message-objects#quick_replies_message_object
v1 Google Assistant: https://dialogflow.com/docs/reference/agent/message-objects#suggestion_chip_response
v2 Generic: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#quickreplies
v2 Google Assistant: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#suggestion

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| suggestion | <code>string</code> \| <code>Object</code> | title string or an object representing a suggestion response |

**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
agent.addSuggestion('suggestion');
const googleSuggestionResponse = {title: 'suggestion', platform: agent.ACTIONS_ON_GOOGLE}
agent.addSuggestion(googleSuggestionResponse);
const suggestionResponse = agent.buildSuggestion('suggestion')
agent.addSuggestion(suggestionResponse);
```
<a name="WebhookClient+addPayload"></a>

### webhookClient.addPayload(platform, payload) ⇒ [<code>WebhookClient</code>](#WebhookClient)
Add a suggestion response to be sent to Dialogflow via message objects
v1 Generic: https://dialogflow.com/docs/reference/agent/message-objects#quick_replies_message_object
v1 Google Assistant: https://dialogflow.com/docs/reference/agent/message-objects#suggestion_chip_response
v2 Generic: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#quickreplies
v2 Google Assistant: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#suggestion

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing the payload to be sent to target platform |
| payload | <code>Object</code> | object representing payload's target platform |

**Example**  
```js
const googlePayloadJson = {
  expectUserResponse: true,
  isSsml: false,
  noInputPrompts: [],
  richResponse: {
    items: [{ simpleResponse: { textToSpeech: 'hello', displayText: 'hi' } }]
  },
  systemIntent: {
    intent: 'actions.intent.OPTION',
  }
};
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
agent.addPayload(agent.ACTIONS_ON_GOOGLE, googlePayloadJson);
const googlePyaload = agent.buildPayload(agent.ACTIONS_ON_GOOGLE, googlePayloadJson)
agent.addPayload(agent.ACTIONS_ON_GOOGLE, googlePayload);
```
<a name="WebhookClient+buildText"></a>

### webhookClient.buildText(text) ⇒ [<code>TextResponse</code>](#TextResponse)
Build a text response message object

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> \| <code>Object</code> | response string or an object representing a text response |

**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
const textResponse = agent.buildText('a sample text response');
const googleTextResponse = agent.buildText({
    text: 'sample text response',
    platform: agent.ACTIONS_ON_GOOGLE
});
```
<a name="WebhookClient+buildCard"></a>

### webhookClient.buildCard(title) ⇒ [<code>CardResponse</code>](#CardResponse)
Build a card response message object

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| title | <code>string</code> \| <code>Object</code> | card title string or an object representing a card |

**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
let cardResponse = agent.buildCard('a sample card title');
cardResponse.setImage('https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png');
cardResponse.setText('sample card text');
cardResponse.setButton({text: 'Button Text', url: 'https://assistant.google.com/'});
const googleCardResponse = agent.buildText({
    title: 'a sample card title',
    text: 'sample card text',
    imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
    button: {text: 'Button Text', url: 'https://assistant.google.com/'},
    platform: agent.ACTIONS_ON_GOOGLE
});
```
<a name="WebhookClient+buildImage"></a>

### webhookClient.buildImage(imageUrl) ⇒ [<code>ImageResponse</code>](#ImageResponse)
Build a image response message object

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| imageUrl | <code>string</code> \| <code>Object</code> | string or an object representing a image response |

**Example**  
```js
const imageUrl = 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png'
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
let cardResponse = agent.buildImage(imageUrl);
const googleCardResponse = agent.buildText({
    imageUrl: imageUrl,
    platform: agent.ACTIONS_ON_GOOGLE
});
```
<a name="WebhookClient+buildSuggestion"></a>

### webhookClient.buildSuggestion(suggestion) ⇒ [<code>SuggestionsResponse</code>](#SuggestionsResponse)
Build a suggestion response message object

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| suggestion | <code>string</code> \| <code>Object</code> | title string or an object representing a suggestion response |

**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
const suggestionResponse = agent.buildSuggestion('suggestion');
const googleCardResponse = agent.buildSuggestion({
    title: 'suggestion',
    platform: agent.ACTIONS_ON_GOOGLE
});
```
<a name="WebhookClient+buildPayload"></a>

### webhookClient.buildPayload(platform, payload) ⇒ [<code>PayloadResponse</code>](#PayloadResponse)
Build a payload response message object

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing the payload to be sent to target platform |
| payload | <code>Object</code> | object representing payload's target platform |

**Example**  
```js
const googlePayloadJson = {
  expectUserResponse: true,
  isSsml: false,
  noInputPrompts: [],
  richResponse: {
    items: [{ simpleResponse: { textToSpeech: 'hello', displayText: 'hi' } }]
  },
  systemIntent: {
    intent: 'actions.intent.OPTION',
  }
};
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
const googlePyaload = agent.buildPayload(agent.ACTIONS_ON_GOOGLE, googlePayloadJson)
```
<a name="WebhookClient+setContext"></a>

### webhookClient.setContext(context) ⇒ [<code>WebhookClient</code>](#WebhookClient)
Set a new Dialogflow outgoing context: https://dialogflow.com/docs/contexts

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>string</code> \| <code>Object</code> | name of context or an object representing a context |

**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
agent.setContext('sample context name');
const context = {'name': 'weather', 'lifespan': 2, 'parameters': {'city': 'Rome'}};
agent.setContext(context);
```
<a name="WebhookClient+clearOutgoingContexts"></a>

### webhookClient.clearOutgoingContexts() ⇒ [<code>WebhookClient</code>](#WebhookClient)
Clear all existing outgoing contexts: https://dialogflow.com/docs/contexts

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  
**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
agent.clearOutgoingContexts();
```
<a name="WebhookClient+clearContext"></a>

### webhookClient.clearContext(context) ⇒ [<code>WebhookClient</code>](#WebhookClient)
Clear an existing outgoing context: https://dialogflow.com/docs/contexts

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>string</code> | name of an existing outgoing context |

**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
agent.clearContext('sample context name');
```
<a name="WebhookClient+getContext"></a>

### webhookClient.getContext(contextName) ⇒ <code>Object</code>
Get an context from the Dialogflow webhook request: https://dialogflow.com/docs/contexts

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  
**Returns**: <code>Object</code> - context context object with the context name  

| Param | Type | Description |
| --- | --- | --- |
| contextName | <code>string</code> | name of an context present in the Dialogflow webhook request |

**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
let context = agent.getContext('sample context name');
```
