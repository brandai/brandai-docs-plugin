Design system documentation - Brand.ai integration
===

Connect your design system documentation to your live style data using the Brand.ai documentation plugin.

When a style changes in Brand.ai, your design system documentation will immediately reflect the change.

**How it works**
<ul>
<li>Integrate Brand.ai library in your documentation project</li>
<li>Add data attributes to elements in your documentation that you want to represent Brand.ai style attributes. For
  example:<br/> data-color="white" will set white text color on this div element.</li>
<li>Data attribute values reflect assets display names in Brand.ai and are used to match data from your design
  assets collection.</li>
<li>More information on data attributes in the api section.</li>
</ul>

### Data attributes api

**Attribute:** `data-color`

*Sets text color*

    <div data-color="link">some link</div> <!-- set text color based on 'Link' color asset -->

<br/>


**Attribute:** `data-background-color`

*Sets background-color*

    <div data-background-color="primary"> <!-- set background color based on 'Primary' color asset -->

<br/>


**Attribute:** `data-typography`

*Sets font style properties: font-family, font-size, font-style, font-weight, text-align, line-height, background-color and color*

    <h1 data-typography="primary header"></h1> <!-- set the above properties  based on 'Primary Header' typography asset -->

Note:  Fonts are expected to be loaded for correct font family to be rendered.

<br/>

**Attribute:** `data-image-src`

*Sets src on img elements*

    <img data-image-src="inverted logo"/> <!-- set src based on 'Inverted Logo' logo asset -->

Note: all items from logos, icons and images sections can be used as valid data-image-src values

<br/>


**Attribute:** `data-background-image`

*Sets background-image url() value*

    <div data-background-image="trash"/> <!-- set url based on 'Trash' icon asset -->

Note: all items from logos, icons and images sections can be used as valid data-background-image values


<br/>
<br/>
### Getting the plugin
Install from npm:
    `npm install brandai-docs-plugin`


or 

Download <a href="https://downloads.brand.ai/brandai-docs-plugin-1.0.0.min.js">directly</a>

<br/>
<br/>
### Integration instructions


**CommonJS:**
```
var BrandAiDocsPlugin = require('brandai-docs-plugin');

// Create plugin instance.
// After creation it will fetch your style data and update elements with matching data attributes
var brandAiDocsPlugin = new BrandAiDocsPlugin("<%= apiUrl %>");

```
<br/>

**Native Javascript:**
```
<script src="https://downloads.brand.ai/brandai-docs-plugin-1.0.0.min.js"></script>

// Create plugin instance.
// After creation it will fetch your style data and update elements with matching data attributes
var brandAiDocsPlugin = new window.BrandAiDocsPlugin("<%= apiUrl %>");
```
<br/>

**AMD:**
```
define(['BrandAIDocsPlugin', function(BrandAiDocsPlugin){
   // Create plugin instance.
   // After creation it will fetch your style data and update elements with matching data attributes
   var brandAiDocsPlugin = new BrandAiDocsPlugin("<%= apiUrl %>");
...
}]
```
<br/>




**How to update your documentation with style data upon Dom changes:**


```
//If you changed you dom structure, you can use the plugin to reflect those changes (cached style data will be used)
brandAiDocsPlugin.refreshStyleData();
```
<br/>




