<a name="CardResponse"></a>

## CardResponse ⇐ [<code>RichResponse</code>](#RichResponse)
Class representing a card response

**Kind**: global class  
**Extends**: [<code>RichResponse</code>](#RichResponse)  

* [CardResponse](#CardResponse) ⇐ [<code>RichResponse</code>](#RichResponse)
    * [new CardResponse(card)](#new_CardResponse_new)
    * [.setTitle(title)](#CardResponse+setTitle) ⇒ [<code>CardResponse</code>](#CardResponse)
    * [.setText(text)](#CardResponse+setText) ⇒ [<code>CardResponse</code>](#CardResponse)
    * [.setImage(imageUrl)](#CardResponse+setImage) ⇒ [<code>CardResponse</code>](#CardResponse)
    * [.setButton(button)](#CardResponse+setButton) ⇒ [<code>CardResponse</code>](#CardResponse)
    * [.setPlatform(platform)](#RichResponse+setPlatform) ⇒ [<code>RichResponse</code>](#RichResponse)

<a name="new_CardResponse_new"></a>

### new CardResponse(card)
Constructor for CardResponse object.


| Param | Type | Description |
| --- | --- | --- |
| card | <code>string</code> \| <code>Object</code> | response title string or an object representing a card response |

<a name="CardResponse+setTitle"></a>

### cardResponse.setTitle(title) ⇒ [<code>CardResponse</code>](#CardResponse)
Set the title for a CardResponse

**Kind**: instance method of [<code>CardResponse</code>](#CardResponse)  

| Param | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | containing the title content |

**Example**  
```js
let cardResponse = new CardResponse();
cardResponse.setTitle('sample card title')
```
<a name="CardResponse+setText"></a>

### cardResponse.setText(text) ⇒ [<code>CardResponse</code>](#CardResponse)
Set the text for a CardResponse

**Kind**: instance method of [<code>CardResponse</code>](#CardResponse)  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | containing the card body text content |

**Example**  
```js
let cardResponse = new CardResponse();
cardResponse.setText('sample card body text')
```
<a name="CardResponse+setImage"></a>

### cardResponse.setImage(imageUrl) ⇒ [<code>CardResponse</code>](#CardResponse)
Set the image for a CardResponse

**Kind**: instance method of [<code>CardResponse</code>](#CardResponse)  

| Param | Type |
| --- | --- |
| imageUrl | <code>string</code> | 

**Example**  
```js
let cardResponse = new CardResponse();
cardResponse.setImage('https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png');
```
<a name="CardResponse+setButton"></a>

### cardResponse.setButton(button) ⇒ [<code>CardResponse</code>](#CardResponse)
Set the button for a CardResponse

**Kind**: instance method of [<code>CardResponse</code>](#CardResponse)  

| Param | Type | Description |
| --- | --- | --- |
| button | <code>Object</code> | JSON configuration |
| options.text | <code>Object</code> | button text |
| options.url | <code>Object</code> | button link URL |

**Example**  
```js
let cardResponse = new CardResponse();
cardResponse.setButton({
    text: 'button text',
    url: 'https://assistant.google.com/'
});
```
<a name="RichResponse+setPlatform"></a>

### cardResponse.setPlatform(platform) ⇒ [<code>RichResponse</code>](#RichResponse)
Set the platform for a specific RichResponse (optional)

**Kind**: instance method of [<code>CardResponse</code>](#CardResponse)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing desired rich response target platform |

**Example**  
```js
let richResponse = new RichResponse();
richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
```
