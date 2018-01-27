<a name="RichResponse"></a>

## RichResponse
Class representing a rich response

These classes construct v1&v2 message objects for Dialogflow
v1 Message object docs:
https://dialogflow.com/docs/reference/agent/message-objects
v2 Message object docs:
https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#Message

**Kind**: global class  
<a name="RichResponse+setPlatform"></a>

### richResponse.setPlatform(platform) ⇒ [<code>RichResponse</code>](#RichResponse)
Set the platform for a specific RichResponse (optional)

**Kind**: instance method of [<code>RichResponse</code>](#RichResponse)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing desired rich response target platform |

**Example**  
```js
let richResponse = new RichResponse();
richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
```
