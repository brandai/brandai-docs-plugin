var expect = require('chai').expect;
var sinon = require('sinon');
var jsdom = require('jsdom');


describe('BrandAIDocsPlugin', function () {

  var window,
    xhr,
    requests,
    plugin;

  beforeEach(function (done) {

    // promise is used here so that we will proceed to global objects initialization only once jsdom finished loading
    // and the window is available

    var promise = new Promise(function (resolve, reject) {
      //create virtual console to get virtual dom console messages
      var virtualConsole = jsdom.createVirtualConsole();
      virtualConsole.on("log", function (message) {
        console.log("console.log called ->", message);
      });
      virtualConsole.on("error", function (error) {
        console.error("console.error called ->", error);
      });

      // jsdom element and retrieve window
      var setupWindow = jsdom.jsdom(
        "<html><body>" +
        "<div id='color1' data-color='brand-1'>" +
        "<div id='color2' data-background-color='brand-2'>Rect</div>" +
        "</div>" +
        "<div id='color4' data-color='brand-4'></div>" +
        "<img id='image1' data-image-src='image-1'>Label</img>" +
        "<div id='image2' data-background-image='image-2'>x</img>" +
        "<div id='image3' data-background-image='imAge 3' data-color='bRand 5'>x</img>" +
        "<span id='typography1' data-typography='typography-1'>Label</span>" +
        "<script src='./src/docs-plugin.js'></script>" +
        "</body></html>",
        {
          virtualConsole: virtualConsole
        }
      ).defaultView;

      //when window object is loaded resolved the promise
      setupWindow.onload = function () {
        resolve(setupWindow);
      };
    });

    promise.then(function (setupWindow) {
      window = setupWindow;

      // add polyfill for jsdom to handle dataset attributes
      global.window = window;
      require("./util/polyfill-jsdom.js");

      // add fake xhr logic to mock potential server response
      xhr = sinon.useFakeXMLHttpRequest();
      window.XMLHttpRequest = xhr;
      requests = this.requests = [];
      xhr.onCreate = function (xhr) {
        requests.push(xhr);
      };

      // initialize brandai plugin. this will execute an api request and update the current dom
      plugin = new window.BrandAIDocsPlugin('http://getStyleData');

      // async stage of initialization is completed, call done
      done();
    });
  });

  afterEach(function () {
    xhr.restore();
  });

  describe('load plugin', function () {
    it('should load plugin', function () {
      expect(plugin).to.be.an('object');
      expect(plugin.refreshStyleData).to.be.a('function');
    });
  });


  describe('able to load page with null response', function () {
    it('should load page without errors or exceptions', function () {
      requests[0].respond(200, {'Content-Type': 'application/json'},
        null);
    });
  });

  describe('able to load page with empty response', function () {
    it('should load page without errors or exceptions', function () {
      requests[0].respond(200, {'Content-Type': 'application/json'},
        '{}');
    });
  });

  describe('able to load page with 404 status', function () {
    it('should load page without errors or exceptions', function () {
      requests[0].respond(404, {'Content-Type': 'application/json'},
        JSON.stringify({success: false, message: 'ResourceNotFound'}));
    });
  });

  describe('updated color based on response', function () {
    it('should load page update color value based on api response', function () {
      requests[0].respond(200, {'Content-Type': 'application/json'},
        JSON.stringify({colors: [{name: 'Primary colors', colors: [{kebabName: 'brand-1', value: 'red'}]}]})
      );
      var colorElement = window.document.getElementById('color1');
      expect(colorElement.style.color).to.be.equal('red')
    });
  });

  describe('color name is not found in api response', function () {
    it('should load page without updating the color and will not throw any exception', function () {
      requests[0].respond(200, {'Content-Type': 'application/json'},
        JSON.stringify({colors: [{name: 'Primary colors', colors: [{kebabName: 'another-brand', value: 'red'}]}]})
      );
      var colorElement = window.document.getElementById('color1');
      expect(colorElement.style.color).to.be.empty;
    });
  });

  describe('one of colors sections is empty', function () {
    it('should load page and update the found color from other section', function () {
      requests[0].respond(200, {'Content-Type': 'application/json'},
        JSON.stringify({
          colors: [
            {name: 'Secondary colors', colors: []},
            {name: 'Primary colors', colors: [{kebabName: 'brand-1', value: 'red'}]}
          ]
        })
      );
      var colorElement = window.document.getElementById('color1');
      expect(colorElement.style.color).to.be.equal('red');
    });
  });

  describe('updated background color based on response', function () {
    it('should load page update background color value based on api response', function () {
      requests[0].respond(200, {'Content-Type': 'application/json'},
        JSON.stringify({colors: [{name: 'Primary colors', colors: [{kebabName: 'brand-2', value: 'green'}]}]})
      );
      var labelElement = window.document.getElementById('color2');
      expect(labelElement.style.backgroundColor).to.be.equal('green')
    });
  });

  describe('updated image src based on response', function () {
    it('should load page update image src based on logos data in api response', function () {
      requests[0].respond(200, {'Content-Type': 'application/json'},
        JSON.stringify({logos: [{kebabName: 'image-1', url: 'http://someImageSource'}]})
      );
      var image = window.document.getElementById('image1');
      expect(image.src).to.be.equal('http://someimagesource/');
    });
  });

  describe('updated background image url based on response', function () {
    it('should update background image value based on images section api response', function () {
      requests[0].respond(200, {'Content-Type': 'application/json'},
        JSON.stringify({
          imageSections: [{
            name: 'Primary images',
            images: [{kebabName: 'image-2', url: 'http://someBackgroundImage'}]
          }]
        })
      );
      var backgroundImage = window.document.getElementById('image2');
      expect(backgroundImage.style.backgroundImage).to.be.equal('url(http://someBackgroundImage)');
    });
  });

  describe('updated typography style based on response', function () {
    it('should update element typography  based on typography data from api response', function () {
      requests[0].respond(200, {'Content-Type': 'application/json'},
        JSON.stringify({
          typeStyles: [{
            kebabName: 'typography-1',
            fontFamily: 'Roboto', textColor: 'yellow', backgroundColor: 'white',
            fontSize: 14, fontStyle: 'italic', fontWeight: 300, lineHeight: 20
          }]
        })
      );
      var label = window.document.getElementById('typography1');
      expect(label.style.fontFamily).to.be.equal('Roboto');
      expect(label.style.fontSize).to.be.equal('14px');
      expect(label.style.color).to.be.equal('yellow');
      expect(label.style.backgroundColor).to.be.equal('white');
      expect(label.style.fontStyle).to.be.equal('italic');
      expect(label.style.fontWeight).to.be.equal('300');
      expect(label.style.lineHeight).to.be.equal('20px');
      expect(label.style.textAlign).to.be.empty;
    });
  });

  describe('update by display name', function(){
    it('should update color and image styles by display name values', function(){
      requests[0].respond(200, {'Content-Type': 'application/json'},
        JSON.stringify({
          colors: [{
            name: 'Primary colors',
            colors: [{name: 'branD 5', value: 'red'}]
          }],
          logos: [{displayName: 'Image 3', url: 'http://someBackgroundImage/'}]
        })
      );
      var element = window.document.getElementById('image3');
      expect(element.style.color).to.be.equal('red');
      expect(element.style.backgroundImage).to.be.equal('url(http://someBackgroundImage/)');

    })
  });

  describe('update be specific element tree', function () {
    it('should update color style tree but not the image which resides in different path', function () {
      var plugin = new window.BrandAIDocsPlugin('someUrl', {element: window.document.getElementById('color1')});
      requests[1].respond(200, {'Content-Type': 'application/json'},
        JSON.stringify({
          colors: [{
            name: 'Primary colors',
            colors: [{kebabName: 'brand-1', value: 'red'}, {kebabName: 'brand-2', value: 'blue'}]
          }],
          logos: [{kebabName: 'image-1', url: 'http://someimageurl/'}]
        })
      );

      var colorElement1 = window.document.getElementById('color1');
      expect(colorElement1.style.color).to.be.equal('red');

      var colorElement2 = window.document.getElementById('color2');
      expect(colorElement2.style.backgroundColor).to.be.equal('blue');

      var imageElement1 = window.document.getElementById('image1');
      expect(imageElement1.src).to.be.empty;
    });
  });

  describe('refresh new element color style after initial update', function () {
    it('should update color style after call for refreshDocumentation', function () {
      var plugin = new window.BrandAIDocsPlugin('someUrl', {element: window.document.getElementById('image1')});
      requests[1].respond(200, {'Content-Type': 'application/json'},
        JSON.stringify({
          colors: [{
            name: 'Primary colors',
            colors: [{kebabName: 'brand-1', value: 'red'}, {kebabName: 'brand-3', value: 'black'}]
          }]
        })
      );

      var colorElement1 = window.document.getElementById('color1');
      expect(colorElement1.style.color).to.be.empty;

      // add new element
      var divEl = window.document.createElement('div');
      divEl.id = 'color3';
      divEl.setAttribute('data-color', 'brand-3');
      window.document.body.appendChild(divEl);

      //verify that this element does not have resolved styling
      var colorElement3 = window.document.getElementById('color3');
      expect(colorElement3.style.color).to.be.empty;

      //call for refresh for specific element
      plugin.refreshStyleData({element: colorElement3});
      expect(colorElement3.style.color).to.be.equal('black');

      // color1 is still empty as we did refresh only color3 specific element
      expect(colorElement1.style.color).to.be.empty;

      //refresh the whole body
      plugin.refreshStyleData();
      expect(colorElement1.style.color).to.be.equal('red');

    });
  });


});