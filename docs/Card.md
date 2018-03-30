<a name="Card"></a>

## Card ⇐ [<code>RichResponse</code>](#RichResponse)
Class representing a card response

**Kind**: global class  
**Extends**: [<code>RichResponse</code>](#RichResponse)  

* [Card](#Card) ⇐ [<code>RichResponse</code>](#RichResponse)
    * [new Card(card)](#new_Card_new)
    * [.setTitle(title)](#Card+setTitle) ⇒ [<code>Card</code>](#Card)
    * [.setText(text)](#Card+setText) ⇒ [<code>Card</code>](#Card)
    * [.setImage(imageUrl)](#Card+setImage) ⇒ [<code>Card</code>](#Card)
    * [.setButton(button)](#Card+setButton) ⇒ [<code>Card</code>](#Card)
    * [.setPlatform(platform)](#RichResponse+setPlatform) ⇒ [<code>RichResponse</code>](#RichResponse)

<a name="new_Card_new"></a>

### new Card(card)
Constructor for Card object.


| Param | Type | Description |
| --- | --- | --- |
| card | <code>string</code> \| <code>Object</code> | response title string or an object representing a card response |

<a name="Card+setTitle"></a>

### card.setTitle(title) ⇒ [<code>Card</code>](#Card)
Set the title for a Card

**Kind**: instance method of [<code>Card</code>](#Card)  

| Param | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | containing the title content |

**Example**  
```js
let card = new Card();
card.setTitle('sample card title')
```
<a name="Card+setText"></a>

### card.setText(text) ⇒ [<code>Card</code>](#Card)
Set the text for a Card

**Kind**: instance method of [<code>Card</code>](#Card)  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | containing the card body text content |

**Example**  
```js
let card = new Card();
card.setText('sample card body text')
```
<a name="Card+setImage"></a>

### card.setImage(imageUrl) ⇒ [<code>Card</code>](#Card)
Set the image for a Card

**Kind**: instance method of [<code>Card</code>](#Card)  

| Param | Type |
| --- | --- |
| imageUrl | <code>string</code> | 

**Example**  
```js
let card = new Card();
card.setImage('https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png');
```
<a name="Card+setButton"></a>

### card.setButton(button) ⇒ [<code>Card</code>](#Card)
Set the button for a Card

**Kind**: instance method of [<code>Card</code>](#Card)  

| Param | Type | Description |
| --- | --- | --- |
| button | <code>Object</code> | JSON configuration |
| options.text | <code>Object</code> | button text |
| options.url | <code>Object</code> | button link URL |

**Example**  
```js
let card = new Card();
card.setButton({
    text: 'button text',
    url: 'https://assistant.google.com/'
});
```
<a name="RichResponse+setPlatform"></a>

### card.setPlatform(platform) ⇒ [<code>RichResponse</code>](#RichResponse)
Set the platform for a specific RichResponse (optional)

**Kind**: instance method of [<code>Card</code>](#Card)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing desired rich response target platform |

**Example**  
```js
let richResponse = new RichResponse();
richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
```
