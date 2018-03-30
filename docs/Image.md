<a name="Image"></a>

## Image ⇐ [<code>RichResponse</code>](#RichResponse)
Class representing a image response.

**Kind**: global class  
**Extends**: [<code>RichResponse</code>](#RichResponse)  

* [Image](#Image) ⇐ [<code>RichResponse</code>](#RichResponse)
    * [new Image(image)](#new_Image_new)
    * [.setImage(imageUrl)](#Image+setImage) ⇒ [<code>Image</code>](#Image)
    * [.setPlatform(platform)](#RichResponse+setPlatform) ⇒ [<code>RichResponse</code>](#RichResponse)

<a name="new_Image_new"></a>

### new Image(image)
Constructor for Image object


| Param | Type | Description |
| --- | --- | --- |
| image | <code>string</code> \| <code>Object</code> | URL string or an object representing a image response |

<a name="Image+setImage"></a>

### image.setImage(imageUrl) ⇒ [<code>Image</code>](#Image)
Set the image for a Image

**Kind**: instance method of [<code>Image</code>](#Image)  

| Param | Type |
| --- | --- |
| imageUrl | <code>string</code> | 

**Example**  
```js
let image = new Image('https://example.com/placeholder.png');
image.setImage('https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png');
```
<a name="RichResponse+setPlatform"></a>

### image.setPlatform(platform) ⇒ [<code>RichResponse</code>](#RichResponse)
Set the platform for a specific RichResponse (optional)

**Kind**: instance method of [<code>Image</code>](#Image)  

| Param | Type | Description |
| --- | --- | --- |
| platform | <code>string</code> | representing desired rich response target platform |

**Example**  
```js
let richResponse = new RichResponse();
richResponse.setPlatform(PLATFORMS.ACTIONS_ON_GOOGLE)
```
