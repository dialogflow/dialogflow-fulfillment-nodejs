<a name="SuggestionsResponse"></a>

## SuggestionsResponse ⇐ [<code>RichResponse</code>](#RichResponse)
Class representing a suggestions response

**Kind**: global class  
**Extends**: [<code>RichResponse</code>](#RichResponse)  

* [SuggestionsResponse](#SuggestionsResponse) ⇐ [<code>RichResponse</code>](#RichResponse)
    * [new SuggestionsResponse(suggestion)](#new_SuggestionsResponse_new)
    * [.setReply(reply)](#SuggestionsResponse+setReply) ⇒ [<code>SuggestionsResponse</code>](#SuggestionsResponse)
    * [.setPlatform(platform)](#RichResponse+setPlatform) ⇒ [<code>RichResponse</code>](#RichResponse)

<a name="new_SuggestionsResponse_new"></a>

### new SuggestionsResponse(suggestion)
Constructor for SuggestionsResponse object


| Param | Type | Description |
| --- | --- | --- |
| suggestion | <code>string</code> \| <code>Object</code> | title string or an object representing a suggestion response |

<a name="SuggestionsResponse+setReply"></a>

### suggestionsResponse.setReply(reply) ⇒ [<code>SuggestionsResponse</code>](#SuggestionsResponse)
Set the reply for a SuggestionsResponse

**Kind**: instance method of [<code>SuggestionsResponse</code>](#SuggestionsResponse)  

| Param | Type |
| --- | --- |
| reply | <code>string</code> | 

**Example**  
```js
let suggestionsResponse = new SuggestionsResponse('reply to be overwritten');
suggestionsResponse.setReply('reply overwritten');
```
<a name="RichResponse+setPlatform"></a>

### suggestionsResponse.setPlatform(platform) ⇒ [<code>RichResponse</code>](#RichResponse)
Set the platform for a specific RichResponse (optional)

**Kind**: instance method of [<code>SuggestionsResponse</code>](#SuggestionsResponse)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing desired rich response target platform |

**Example**  
```js
let richResponse = new RichResponse();
richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
```
