<a name="PayloadResponse"></a>

## PayloadResponse ⇐ [<code>RichResponse</code>](#RichResponse)
Class representing a payload response

**Kind**: global class  
**Extends**: [<code>RichResponse</code>](#RichResponse)  

* [PayloadResponse](#PayloadResponse) ⇐ [<code>RichResponse</code>](#RichResponse)
    * [new PayloadResponse(platform, payload)](#new_PayloadResponse_new)
    * [.setPayload(payload)](#PayloadResponse+setPayload) ⇒ [<code>PayloadResponse</code>](#PayloadResponse)
    * [.setPlatform(platform)](#RichResponse+setPlatform) ⇒ [<code>RichResponse</code>](#RichResponse)

<a name="new_PayloadResponse_new"></a>

### new PayloadResponse(platform, payload)
Constructor for PayloadResponse object


| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | string indicating target platform of payload |
| payload | <code>Object</code> | contents for indicated platform |

<a name="PayloadResponse+setPayload"></a>

### payloadResponse.setPayload(payload) ⇒ [<code>PayloadResponse</code>](#PayloadResponse)
Set the payload contents for a PayloadResponse

**Kind**: instance method of [<code>PayloadResponse</code>](#PayloadResponse)  

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
let payloadResponse = new PayloadResponse(PLATFORMS.ACTIONS_ON_GOOGLE, {});
payloadResponse.setPayload(googlePayloadJson);
```
<a name="RichResponse+setPlatform"></a>

### payloadResponse.setPlatform(platform) ⇒ [<code>RichResponse</code>](#RichResponse)
Set the platform for a specific RichResponse (optional)

**Kind**: instance method of [<code>PayloadResponse</code>](#PayloadResponse)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing desired rich response target platform |

**Example**  
```js
let richResponse = new RichResponse();
richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
```
