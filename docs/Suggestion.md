<a name="Suggestion"></a>

## Suggestion ⇐ [<code>RichResponse</code>](#RichResponse)
Class representing a suggestions response

**Kind**: global class  
**Extends**: [<code>RichResponse</code>](#RichResponse)  

* [Suggestion](#Suggestion) ⇐ [<code>RichResponse</code>](#RichResponse)
    * [new Suggestion(suggestion)](#new_Suggestion_new)
    * [.setReply(reply)](#Suggestion+setReply) ⇒ [<code>Suggestion</code>](#Suggestion)
    * [.setPlatform(platform)](#RichResponse+setPlatform) ⇒ [<code>RichResponse</code>](#RichResponse)

<a name="new_Suggestion_new"></a>

### new Suggestion(suggestion)
Constructor for Suggestion object


| Param | Type | Description |
| --- | --- | --- |
| suggestion | <code>string</code> \| <code>Object</code> | title string or an object representing a suggestion response |

<a name="Suggestion+setReply"></a>

### suggestion.setReply(reply) ⇒ [<code>Suggestion</code>](#Suggestion)
Set the reply for a Suggestion

**Kind**: instance method of [<code>Suggestion</code>](#Suggestion)  

| Param | Type |
| --- | --- |
| reply | <code>string</code> | 

**Example**  
```js
let suggestion = new Suggestion('reply to be overwritten');
suggestion.setReply('reply overwritten');
```
<a name="RichResponse+setPlatform"></a>

### suggestion.setPlatform(platform) ⇒ [<code>RichResponse</code>](#RichResponse)
Set the platform for a specific RichResponse (optional)

**Kind**: instance method of [<code>Suggestion</code>](#Suggestion)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing desired rich response target platform |

**Example**  
```js
let richResponse = new RichResponse();
richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
```
