<a name="Payload"></a>

## Payload ⇐ [<code>RichResponse</code>](#RichResponse)
Class representing a payload response

**Kind**: global class  
**Extends**: [<code>RichResponse</code>](#RichResponse)  

* [Payload](#Payload) ⇐ [<code>RichResponse</code>](#RichResponse)
    * [new Payload(platform, payload)](#new_Payload_new)
    * [.setPayload(payload)](#Payload+setPayload) ⇒ [<code>Payload</code>](#Payload)
    * [.setPlatform(platform)](#RichResponse+setPlatform) ⇒ [<code>RichResponse</code>](#RichResponse)

<a name="new_Payload_new"></a>

### new Payload(platform, payload)
Constructor for Payload object


| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | string indicating target platform of payload |
| payload | <code>Object</code> | contents for indicated platform |

<a name="Payload+setPayload"></a>

### payload.setPayload(payload) ⇒ [<code>Payload</code>](#Payload)
Set the payload contents for a Payload

**Kind**: instance method of [<code>Payload</code>](#Payload)  

| Param | Type |
| --- | --- |
| payload | <code>string</code> | 

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
}
let payload = new Payload(PLATFORMS.ACTIONS_ON_GOOGLE, {});
payload.setPayload(googlePayloadJson);
```
<a name="RichResponse+setPlatform"></a>

### payload.setPlatform(platform) ⇒ [<code>RichResponse</code>](#RichResponse)
Set the platform for a specific RichResponse (optional)

**Kind**: instance method of [<code>Payload</code>](#Payload)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing desired rich response target platform |

**Example**  
```js
let richResponse = new RichResponse();
richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
```
