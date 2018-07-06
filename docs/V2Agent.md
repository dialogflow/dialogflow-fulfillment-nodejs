<a name="V2Agent"></a>

## V2Agent
Class representing a v2 Dialogflow agent

**Kind**: global class  

* [V2Agent](#V2Agent)
    * [new V2Agent(agent)](#new_V2Agent_new)
    * [.end_(responses)](#V2Agent+end_)

<a name="new_V2Agent_new"></a>

### new V2Agent(agent)
Constructor for V2Agent object
To be used in with WebhookClient class


| Param | Type | Description |
| --- | --- | --- |
| agent | <code>Object</code> | instance of WebhookClient class |

<a name="V2Agent+end_"></a>

### v2Agent.end_(responses)
Add a response or list of responses to be sent to Dialogflow and end the conversation
Note: Only supported on Dialogflow v2's telephony gateway, Google Assistant and Alexa integrations

**Kind**: instance method of [<code>V2Agent</code>](#V2Agent)  

| Param | Type | Description |
| --- | --- | --- |
| responses | [<code>RichResponse</code>](#RichResponse) \| <code>string</code> \| [<code>Array.&lt;RichResponse&gt;</code>](#RichResponse) \| <code>Array.&lt;string&gt;</code> | (list) or single responses |

