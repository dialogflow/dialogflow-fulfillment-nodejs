<a name="ImageResponse"></a>

## ImageResponse ⇐ [<code>RichResponse</code>](#RichResponse)
Class representing a image response.

**Kind**: global class  
**Extends**: [<code>RichResponse</code>](#RichResponse)  

* [ImageResponse](#ImageResponse) ⇐ [<code>RichResponse</code>](#RichResponse)
    * [new ImageResponse(image)](#new_ImageResponse_new)
    * [.setImage(imageUrl)](#ImageResponse+setImage) ⇒ [<code>ImageResponse</code>](#ImageResponse)
    * [.setPlatform(platform)](#RichResponse+setPlatform) ⇒ [<code>RichResponse</code>](#RichResponse)

<a name="new_ImageResponse_new"></a>

### new ImageResponse(image)
Constructor for ImageResponse object


| Param | Type | Description |
| --- | --- | --- |
| image | <code>string</code> \| <code>Object</code> | URL string or an object representing a image response |

<a name="ImageResponse+setImage"></a>

### imageResponse.setImage(imageUrl) ⇒ [<code>ImageResponse</code>](#ImageResponse)
Set the image for a ImageResponse

**Kind**: instance method of [<code>ImageResponse</code>](#ImageResponse)  

| Param | Type |
| --- | --- |
| imageUrl | <code>string</code> | 

**Example**  
```js
let imageResponse = new ImageResponse('https://example.com/placeholder.png');
imageResponse.setImage('https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png');
```
<a name="RichResponse+setPlatform"></a>

### imageResponse.setPlatform(platform) ⇒ [<code>RichResponse</code>](#RichResponse)
Set the platform for a specific RichResponse (optional)

**Kind**: instance method of [<code>ImageResponse</code>](#ImageResponse)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing desired rich response target platform |

**Example**  
```js
let richResponse = new RichResponse();
richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
```
