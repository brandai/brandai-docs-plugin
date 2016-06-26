(function (root, factory) {
    if (typeof module === "object" && module.exports) {
      module.exports = factory(document);
    } else if (typeof define === "function" && define.amd) {
      define([document], factory);
    } else {
      root.BrandAIDocsPlugin = factory(root.document);
    }
  }(this, function (document) {

    function hasChildren(node) {
      return node.childNodes && node.childNodes.length;
    };

    function updateDomWithStyleData(node, dataAttributesLookup, whitelist) {
      if (node && node.nodeType) {
        if (!whitelist || whitelist[node.nodeType]) {
          var dataset = node.dataset;
          if (dataset) {
            // update elements with data-background-color value set
            var style = node.style;
            if (dataset.backgroundColor) {
              var backgroundColor = dataAttributesLookup.colors[dataset.backgroundColor];
              if (backgroundColor) {
                style.backgroundColor = backgroundColor.value;
              }
            }
            // update elements with data-color value set
            if (dataset.color) {
              var color = dataAttributesLookup.colors[dataset.color];
              if (color) {
                style.color = color.value;
              }
            }
            // update elements with data-typography value set
            if (dataset.typography) {
              var typography = dataAttributesLookup.typography[dataset.typography];
              if (typography) {
                style.color = typography.textColor;
                style.backgroundColor = typography.backgroundColor;
                style.fontFamily = typography.fontFamily;
                style.fontSize = typography.fontSize + 'px';
                style.fontStyle = typography.fontStyle;
                style.fontWeight = typography.fontWeight;
                if (typography.lineHeight) {
                  style.lineHeight = typography.lineHeight + 'px';
                }
                if (typography.alignment) {
                  style.textAlign = typography.alignment;
                }
              }
            }
            // update img elements with data-img-src value set
            if (dataset.imageSrc) {
              var image = dataAttributesLookup.images[dataset.imageSrc];
              if (image) {
                node.src = image.url;
              }
            }
            // update elements with data-background-image value set
            if (dataset.backgroundImage) {
              var image = dataAttributesLookup.images[dataset.backgroundImage];
              if (image) {
                style.backgroundImage = 'url(' + image.url + ')';
              }
            }
          }
        }
        if (hasChildren(node)) {
          var nodes = node.childNodes;
          for (var i = 0; i < nodes.length; i++) {
            //var node = nodes[i];
            updateDomWithStyleData(nodes[i], dataAttributesLookup, whitelist);
          }
        }
      }
    };

    function updateMapWithElements(styleDataMap, elements, storedType) {
      if (!elements) {
        return;
      }
      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        styleDataMap[storedType][element.kebabName] = element;
      }
    };

    function updateMapWithNestedElements(styleDataMap, sections, type, storedType) {
      if (!sections) {
        return;
      }
      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var nestedElements = section[type];
        if (!nestedElements || nestedElements.length == 0) {
          return;
        }
        for (var j = 0; j < nestedElements.length; j++) {
          var element = nestedElements[j];
          styleDataMap[storedType][element.kebabName] = element;
        }
      }
    };

    function createStyleDataMap(response) {
      var styleDataMap = {'colors': {}, 'typography': {}, 'images': {}};

      updateMapWithNestedElements(styleDataMap, response.colors, 'colors', 'colors');
      updateMapWithNestedElements(styleDataMap, response.imageSections, 'images', 'images');
      updateMapWithNestedElements(styleDataMap, response.iconSections, 'icons', 'images');

      updateMapWithElements(styleDataMap, response.typeStyles, 'typography');
      updateMapWithElements(styleDataMap, response.logos, 'images');

      return styleDataMap;
    };


    var BrandAIDocsPlugin = function (url, element) {

      var processResponse = function (response) {
        var styleDataMap = createStyleDataMap(response);
        this.styleDataMap = styleDataMap;
      }.bind(this);

      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (xhr.status === 200) {
          if (xhr.response) {
            processResponse(JSON.parse(xhr.response));
            updateDomWithStyleData(element || document.body, this.styleDataMap, {1: 1});
          }
        } else {
          console.error('something went wrong ' + xhr.status);
        }
      }.bind(this);

      xhr.onerror = function (err) {
        console.error(err);
      };

      xhr.open('GET', url, true);
      xhr.send(null);
    };


    BrandAIDocsPlugin.prototype.refreshDocumentationWithStyleData = function (element) {
      if (this.styleDataMap) {
        var elementToUpdate = element || document.body;
        updateDomWithStyleData(elementToUpdate, this.styleDataMap, {1: 1});
      } else {
        console.error("please create plugin instance before refreshing")
      }
    }

    return BrandAIDocsPlugin;
  })
);
