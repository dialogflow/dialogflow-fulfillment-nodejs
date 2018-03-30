<a name="Text"></a>

## Text ⇐ [<code>RichResponse</code>](#RichResponse)
Class representing a text response

**Kind**: global class  
**Extends**: [<code>RichResponse</code>](#RichResponse)  

* [Text](#Text) ⇐ [<code>RichResponse</code>](#RichResponse)
    * [new Text(text)](#new_Text_new)
    * [.setText(text)](#Text+setText) ⇒ [<code>Text</code>](#Text)
    * [.setSsml(ssml)](#Text+setSsml) ⇒ [<code>Text</code>](#Text)
    * [.setPlatform(platform)](#RichResponse+setPlatform) ⇒ [<code>RichResponse</code>](#RichResponse)

<a name="new_Text_new"></a>

### new Text(text)
Constructor for Text object


| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> \| <code>Object</code> | response string or an object representing a text response |

<a name="Text+setText"></a>

### text.setText(text) ⇒ [<code>Text</code>](#Text)
Set the text for a Text

**Kind**: instance method of [<code>Text</code>](#Text)  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | containing the text response content |

**Example**  
```js
let text = new Text();
text.setText('sample text response')
```
<a name="Text+setSsml"></a>

### text.setSsml(ssml) ⇒ [<code>Text</code>](#Text)
Set the SSML for a Text

**Kind**: instance method of [<code>Text</code>](#Text)  

| Param | Type | Description |
| --- | --- | --- |
| ssml | <code>string</code> | containing the SSML response content |

**Example**  
```js
let text = new Text();
text.setSsml('<speak>This is <say-as interpret-as="characters">SSML</say-as>.</speak>')
```
<a name="RichResponse+setPlatform"></a>

### text.setPlatform(platform) ⇒ [<code>RichResponse</code>](#RichResponse)
Set the platform for a specific RichResponse (optional)

**Kind**: instance method of [<code>Text</code>](#Text)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing desired rich response target platform |

**Example**  
```js
let richResponse = new RichResponse();
richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
```
