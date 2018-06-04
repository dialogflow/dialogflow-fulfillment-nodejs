<a name="WebhookClient"></a>

## WebhookClient
This is the class that handles the communication with Dialogflow's webhook
fulfillment API v1 & v2 with support for rich responses across 8 platforms and
Dialogflow's simulator

**Kind**: global class  

* [WebhookClient](#WebhookClient)
    * [new WebhookClient(options)](#new_WebhookClient_new)
    * [.agentVersion](#WebhookClient+agentVersion) : <code>number</code>
    * [.intent](#WebhookClient+intent) : <code>string</code>
    * [.action](#WebhookClient+action) : <code>string</code>
    * [.parameters](#WebhookClient+parameters) : <code>Object</code>
    * [.contexts](#WebhookClient+contexts) : <code>string</code>
    * [.requestSource](#WebhookClient+requestSource) : <code>string</code>
    * [.originalRequest](#WebhookClient+originalRequest) : <code>object</code>
    * [.query](#WebhookClient+query) : <code>string</code>
    * [.locale](#WebhookClient+locale) : <code>string</code>
    * [.session](#WebhookClient+session) : <code>string</code>
    * [.consoleMessages](#WebhookClient+consoleMessages) : [<code>Array.&lt;RichResponse&gt;</code>](#RichResponse)
    * [.add(responses)](#WebhookClient+add)
    * [.addResponse_(response)](#WebhookClient+addResponse_)
    * [.handleRequest(handler)](#WebhookClient+handleRequest) ⇒ <code>Promise</code>
    * [.setContext(context)](#WebhookClient+setContext) ⇒ [<code>WebhookClient</code>](#WebhookClient)
    * [.clearOutgoingContexts()](#WebhookClient+clearOutgoingContexts) ⇒ [<code>WebhookClient</code>](#WebhookClient)
    * [.clearContext(context)](#WebhookClient+clearContext) ⇒ [<code>WebhookClient</code>](#WebhookClient)
    * [.getContext(contextName)](#WebhookClient+getContext) ⇒ <code>Object</code>
    * [.setFollowupEvent(event)](#WebhookClient+setFollowupEvent)
    * [.conv()](#WebhookClient+conv) ⇒ <code>DialogflowConversation</code> \| <code>null</code>

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
<a name="WebhookClient+intent"></a>

### webhookClient.intent : <code>string</code>
Dialogflow intent name or null if no value: https://dialogflow.com/docs/intents

**Kind**: instance property of [<code>WebhookClient</code>](#WebhookClient)  
<a name="WebhookClient+action"></a>

### webhookClient.action : <code>string</code>
Dialogflow action or null if no value: https://dialogflow.com/docs/actions-and-parameters

**Kind**: instance property of [<code>WebhookClient</code>](#WebhookClient)  
<a name="WebhookClient+parameters"></a>

### webhookClient.parameters : <code>Object</code>
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
<a name="WebhookClient+originalRequest"></a>

### webhookClient.originalRequest : <code>object</code>
Dialogflow original request object from detectIntent/query or platform integration
(Google Assistant, Slack, etc.) in the request or null if no value
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
<a name="WebhookClient+consoleMessages"></a>

### webhookClient.consoleMessages : [<code>Array.&lt;RichResponse&gt;</code>](#RichResponse)
List of messages defined in Dialogflow's console for the matched intent
https://dialogflow.com/docs/rich-messages

**Kind**: instance property of [<code>WebhookClient</code>](#WebhookClient)  
<a name="WebhookClient+add"></a>

### webhookClient.add(responses)
Add a response or list of responses to be sent to Dialogflow

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| responses | [<code>RichResponse</code>](#RichResponse) \| <code>string</code> \| [<code>Array.&lt;RichResponse&gt;</code>](#RichResponse) \| <code>Array.&lt;string&gt;</code> | (list) or single responses |

<a name="WebhookClient+addResponse_"></a>

### webhookClient.addResponse_(response)
Add a response to be sent to Dialogflow

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| response | [<code>RichResponse</code>](#RichResponse) \| <code>string</code> | an object or string representing the rich response to be added |

<a name="WebhookClient+handleRequest"></a>

### webhookClient.handleRequest(handler) ⇒ <code>Promise</code>
Handles the incoming Dialogflow request using a handler or Map of handlers
Each handler must be a function callback.

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>Map</code> \| <code>requestCallback</code> | map of Dialogflow action name to handler function or     function to handle all requests (regardless of Dialogflow action). |

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
<a name="WebhookClient+setFollowupEvent"></a>

### webhookClient.setFollowupEvent(event)
Set the followup event

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> \| <code>Object</code> | string with the name of the event or an event object |

**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
let event = agent.setFollowupEvent('sample event name');
```
<a name="WebhookClient+conv"></a>

### webhookClient.conv() ⇒ <code>DialogflowConversation</code> \| <code>null</code>
Get Actions on Google DialogflowConversation object

**Kind**: instance method of [<code>WebhookClient</code>](#WebhookClient)  
**Returns**: <code>DialogflowConversation</code> \| <code>null</code> - DialogflowConversation object or null  
**Example**  
```js
const { WebhookClient } = require('dialogflow-webhook');
const agent = new WebhookClient({request: request, response: response});
let conv = agent.conv();
conv.ask('Hi from the Actions on Google client library');
agent.add(conv);
```
