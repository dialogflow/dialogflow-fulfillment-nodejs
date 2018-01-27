<a name="TextResponse"></a>

## TextResponse ⇐ [<code>RichResponse</code>](#RichResponse)
Class representing a text response

**Kind**: global class  
**Extends**: [<code>RichResponse</code>](#RichResponse)  

* [TextResponse](#TextResponse) ⇐ [<code>RichResponse</code>](#RichResponse)
    * [new TextResponse(text)](#new_TextResponse_new)
    * [.setText(text)](#TextResponse+setText) ⇒ [<code>TextResponse</code>](#TextResponse)
    * [.setPlatform(platform)](#RichResponse+setPlatform) ⇒ [<code>RichResponse</code>](#RichResponse)

<a name="new_TextResponse_new"></a>

### new TextResponse(text)
Constructor for TextResponse object


| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> \| <code>Object</code> | response string or an object representing a text response |

<a name="TextResponse+setText"></a>

### textResponse.setText(text) ⇒ [<code>TextResponse</code>](#TextResponse)
Set the text for a TextResponse

**Kind**: instance method of [<code>TextResponse</code>](#TextResponse)  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | containing the text response content |

**Example**  
```js
let textResponse = new TextResponse();
textResponse.setText('sample text response')
```
<a name="RichResponse+setPlatform"></a>

### textResponse.setPlatform(platform) ⇒ [<code>RichResponse</code>](#RichResponse)
Set the platform for a specific RichResponse (optional)

**Kind**: instance method of [<code>TextResponse</code>](#TextResponse)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing desired rich response target platform |

**Example**  
```js
let richResponse = new RichResponse();
richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
```
