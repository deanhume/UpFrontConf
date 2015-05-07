(function(){
    var insertAfter, bind, unbind, getHashParam, clearHashParam, applyTrackingParams, scripts, windowOrigin, ie, EventsWidget, addClass, removeClass,
        DATA_ATTRIBUTES = ['width', 'height', 'reference'],
        WIDGETS_URL_FRAGMENT = '/widgets/web/',
        STYLESHEET_URL = '',
        LOADER_URL = '',
        OVERLAY_HEIGHT = 780,
        OVERLAY_WIDTH = 692,
        DEFAULT_EVENTS_HEIGHT = '415px',
        DEFAULT_EVENTS_WIDTH = '100%',
        MOBILE_EVENT_PATH = '/mobile/events/{id}',
        MOBILE_ORDERS_PATH = '/mobile/orders',
        isMobile = false,
        EVENT_ID_PARAM = 'event_id',
        OVERLAY_MARGIN = 20;

    scripts = document.getElementsByTagName( 'script' );
    windowOrigin = window.location.toString(); //.match(/(https?:\/\/\w.*?)\/.*/)[1];

    insertAfter = function(parentGuest, childGuest) {
        if (parentGuest.nextSibling) {
            parentGuest.parentNode.insertBefore(childGuest, parentGuest.nextSibling);
        }
        else {
            parentGuest.parentNode.appendChild(childGuest);
        }
    };

    bind = function(element, name, callback) {
        if (element.addEventListener) {
            return element.addEventListener(name, callback, false);
        } else {
            return element.attachEvent('on' + name, callback);
        }
    };

    unbind = function(element, name, callback) {
        if (element.removeEventListener) {
            return element.removeEventListener(name, callback, false);
        } else {
            return element.detachEvent('on' + name, callback);
        }
    };

    addClass = function(element, className) {
        element.className = element.className + ' ' + className;
    };

    removeClass = function(element, className) {
        var rxp = new RegExp( '\\s?\\b'+className+'\\b', 'g' );
        element.className = element.className.replace(rxp, '');
    };

    getHashParam = function(name) {
        var hash, matched;
        hash = window.location.hash;
        matched = hash.match(new RegExp('#.*' + name + '=([a-zA-Z0-9-_]*).*'));
        if(matched) {
            return matched[1];
        }
    };

    clearHashParam = function(name) {
        var value = getHashParam(name), paramString;
        if(value) {
            paramString = name + '=' + value;
            window.location.hash = window.location.hash.replace(paramString, '');
        }
    };

    applyTrackingParams = function(url) {
      var googleAnalytics = window.GoogleAnalyticsObject;
      var ga = window[googleAnalytics];
      var analyticsLoaded = (typeof(ga) === 'function');
      var linkerLoaded = (window.gaplugins && typeof(window.gaplugins.Linker) === 'function');
      var loaded = analyticsLoaded && linkerLoaded;

      if (loaded) {
        ga(function(tracker) {
          var linker = new window.gaplugins.Linker(tracker);
          url = linker.decorate(url);
        });
      }

      return url;
    };

    // TODO: better way to detect ie?
    /* jshint ignore:start */
    ie = (function(){
        var undef,
            v = 3,
            div = document.createElement('div'),
            all = div.getElementsByTagName('i');
        while (
            div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
            all[0]
        );
        return v > 4 ? v : undef;
    }());
    /* jshint ignore:end */

    EventsWidget = function() {
        var _this = this;
        this.scriptTag = scripts[ scripts.length - 1 ];
        this.hostName = '';//this.scriptTag.src.match(new RegExp('https?://[^/]*'))[0];
        this.populateOptions();
        bind(window, 'message', function(){
            _this.onMessage.apply(_this, arguments);
        });

        this.lightbox = new FatsomaLightbox(this);

        insertAfter(this.scriptTag, this.renderIFrame());
    };

    EventsWidget.prototype.setup = function(isMobileDevice){
        isMobile = isMobileDevice === 'true';
        this.detectHashParameters();
    };

    EventsWidget.prototype.detectHashParameters = function() {
        if(window.location.hash.length){
            var eventID = getHashParam(EVENT_ID_PARAM);

            if(eventID){
                if(isMobile){
                    window.location = this.showEventMobileSiteLink(eventID);
                }
                else {
                    this.showEvent(eventID);
                }
            }

            if(window.location.hash === '#orders') {
                if(isMobile){
                    window.location = this.hostName + MOBILE_ORDERS_PATH;
                }
                else {
                    this.showOrders();
                }
            }
        }
    };

    EventsWidget.prototype.showEvent = function(eventId) {
        var url = this.getEventUrl(eventId);
        if (isMobile){
            window.location = this.showEventMobileSiteLink(eventId);
        } else {
            window.location.hash = '#' + EVENT_ID_PARAM + '=' + eventId;
            this.lightbox.open(url);
        }
    };

    EventsWidget.prototype.showEventMobileSiteLink = function(eventId){
      return applyTrackingParams(
        this.hostName + MOBILE_EVENT_PATH.replace('{id}', eventId) +
        '?' + this.getWindowOriginParam() + '&widget_id=' + this.options.reference
      );
    };

    EventsWidget.prototype.showOrders = function() {
        var url = this.getBaseUrl() + '/orders?' + this.getWindowOriginParam();
        if (isMobile) {
            window.location = this.hostName + MOBILE_ORDERS_PATH;
        } else {
            window.location.hash = '#orders';
            this.lightbox.open(url);
        }
    };

    EventsWidget.prototype.setEventsFrameHeight = function(height) {
        var parsedHeight = parseInt(height, 10);
        if(parsedHeight) {
            this.iframe.style.height = parsedHeight + 'px';
        }
    };

    EventsWidget.prototype.setLightboxHeight = function(height) {
        var parsedHeight = parseInt(height, 10);
        if(parsedHeight) {
            this.lightbox.container.style.height = parsedHeight + 'px';
        }
    };

    EventsWidget.prototype.revealLightbox = function() {
        if(this.lightbox.isVisible()){
            this.lightbox.showContainer();
        }
    };

    EventsWidget.prototype.getEventUrl = function(eventId) {
        var eventUrl = this.getBaseUrl() + '/events/' + eventId + '?' + this.getWindowOriginParam();
        return applyTrackingParams(eventUrl);
    };

    EventsWidget.prototype.populateOptions = function() {
        this.options = {};
        for(var i in DATA_ATTRIBUTES) {
            this.options[DATA_ATTRIBUTES[i]] = this.scriptTag.getAttribute('data-' + DATA_ATTRIBUTES[i]);
        }
        this.options.width = this.options.width || DEFAULT_EVENTS_WIDTH;
        this.options.height = this.options.height || DEFAULT_EVENTS_HEIGHT;
    };

    EventsWidget.prototype.onMessage = function(event) {
        if(event.origin == this.hostName) {
            var parts = event.data.split('='),
                fn    = parts[0],
                arg   = parts[1];

            this[fn](arg);
        }
    };

    EventsWidget.prototype.setIframeHeight = function(height) {
        var parsedHeight = parseInt(height, 10);
        if(parsedHeight) {
            this.iframe.style.height = parsedHeight + 'px';
        }
    };

    EventsWidget.prototype.getEventsIframeUrl = function(){
        return this.getBaseUrl() + '/events?' + this.getWindowOriginParam();
    };

    EventsWidget.prototype.getWindowOriginParam = function(){
        return ['website_origin', encodeURIComponent(windowOrigin)].join('=');
    };


    EventsWidget.prototype.getBaseUrl = function(){
        return this.hostName + WIDGETS_URL_FRAGMENT + this.options.reference;
    };

    EventsWidget.prototype.renderIFrame  = function(){
        this.iframe = document.createElement('iframe');
        this.iframe.setAttribute('frameBorder', '0');
        this.iframe.setAttribute('id', 'fatsoma-widget-iframe-' + this.options.reference);
        this.iframe.className = 'fatsoma-widget-iframe';
        this.iframe.style.width = this.options.width;
        this.iframe.style.height  = this.options.height;
        this.iframe.src = this.getEventsIframeUrl();
        return this.iframe;
    };

    var FatsomaLightbox = function(fatsomaWidget){
        this.widget = fatsomaWidget;
        this.appendStylesheet();
        document.body.appendChild(this.render());
    };

    FatsomaLightbox.prototype.buildCloseButton = function() {
        var closeButton;
        closeButton = document.createElement('div');
        closeButton.className = 'fatsoma-overlay-close';
        closeButton.title = 'Close';
        return closeButton;
    };

    FatsomaLightbox.prototype.buildLoader = function() {
        var loader;
        loader = document.createElement('img');
        loader.src = this.widget.hostName + LOADER_URL;
        loader.className = 'fatsoma-loader';
        return loader;
    };

    FatsomaLightbox.prototype.buildContainer = function() {
        var container = document.createElement('div');

        container.style.display = 'none';
        container.className = 'fatsoma-lightbox fatsoma-inactive';

        return container;
    };

    FatsomaLightbox.prototype.buildOverlay = function() {
        var overlay = document.createElement('div');
        overlay.className = 'fatsoma-overlay';
        if(ie <=9) {
            addClass(overlay, 'ie');
        }
        return overlay;
    };

    FatsomaLightbox.prototype.buildIframe = function() {
        var iframe = document.createElement('iframe');
        iframe.setAttribute('frameBorder', '0');
        iframe.setAttribute('allowtransparency', 'true');
        iframe.setAttribute('id', 'fatsoma-lightbox-iframe-' + this.widget.options.reference);
        iframe.className = 'fatsoma-lightbox-iframe';
        return iframe;
    };

    FatsomaLightbox.prototype.buildFooter = function() {
        var footer, fatsomaLink, poweredBy, secure;

        footer = document.createElement('div');
        footer.className = 'fatsoma-overlay-footer';

        fatsomaLink = document.createElement('a');
        fatsomaLink.className = 'powered-by';
        fatsomaLink.href = 'http://fatsoma.com';
        footer.appendChild(fatsomaLink);

        secure = document.createElement('span');
        secure.className = 'secure';
        footer.appendChild(secure);

        return footer;
    };

    FatsomaLightbox.prototype.render = function() {
        var _this = this, closeButton;

        if(this.overlay){
            return this.overlay;
        }

        this.iframe = this.buildIframe();
        bind(this.iframe, 'load', function() {
            // _this.showContainer();
        });

        this.container = this.buildContainer();
        this.container.appendChild(this.iframe);

        closeButton = this.buildCloseButton();
        this.container.appendChild(closeButton);
        bind(closeButton, 'click', function(){
            _this.hide();
            clearHashParam(EVENT_ID_PARAM);
        });

        this.loader = this.buildLoader();

        this.overlay = this.buildOverlay();
        this.overlay.appendChild(this.loader);
        this.overlay.appendChild(this.container);
        this.overlay.appendChild(this.buildFooter());

        bind(window, 'resize', function(event){
            window.clearTimeout(_this.resizeTimeout);
            _this.resizeTimeout = window.setTimeout(function(){
                _this.updateContainerSize();
            }, 10);
        });

        return this.overlay;
    };

    FatsomaLightbox.prototype.updateContainerSize = function() {
        var width, height;
        if(window.innerHeight < OVERLAY_HEIGHT - OVERLAY_MARGIN){
            height = window.innerHeight - OVERLAY_MARGIN;
        } else {
            height = OVERLAY_HEIGHT;
        }
        if(window.innerWidth < OVERLAY_WIDTH - OVERLAY_MARGIN){
            width = window.innerWidth - OVERLAY_MARGIN;
        } else {
            width = OVERLAY_WIDTH;
        }
        this.setContainerSize(width, height);
    };

    FatsomaLightbox.prototype.setContainerSize = function(width, height) {
        if(!this.container) { return false; }
        this.container.style.width = width + 'px';
        this.container.style.height = height + 'px';
        this.container.style.marginTop = -(height / 2) + 'px';
        this.container.style.marginLeft = -(width / 2) + 'px';
    };

    FatsomaLightbox.prototype.showContainer = function() {
        this.container.style.display = 'block';
        this.updateContainerSize();
        this.hideLoader();
        removeClass(this.container, 'fatsoma-inactive');
        addClass(this.container, 'fatsoma-active');
    };

    FatsomaLightbox.prototype.hideContainer = function() {
        removeClass(this.container, 'fatsoma-active');
        addClass(this.container, 'fatsoma-inactive');
    };

    FatsomaLightbox.prototype.showLoader = function() {
        this.loader.style.display = 'block';
    };

    FatsomaLightbox.prototype.hideLoader = function() {
        this.loader.style.display = 'none';
    };

    FatsomaLightbox.prototype.appendStylesheet = function() {
        this.stylesheet = document.createElement('link');
        this.stylesheet.setAttribute('type', 'text/css');
        this.stylesheet.setAttribute('rel', 'stylesheet');
        this.stylesheet.setAttribute('href', this.widget.hostName + STYLESHEET_URL);
        var head = document.getElementsByTagName('head')[0] || document.body;
        head.appendChild(this.stylesheet);
    };

    FatsomaLightbox.prototype.open = function(url) {
        if(!this.isVisible()) {
            this.hideContainer();
        }
        this.show();
        this.iframe.src = url;
    };

    FatsomaLightbox.prototype.show = function() {
        this.overlay.style.display = 'inline';
        removeClass(this.overlay, 'fatsoma-inactive');
        addClass(this.overlay, 'fatsoma-active');
        this.showLoader();
    };

    FatsomaLightbox.prototype.hide = function() {
        var _this = this;
        removeClass(this.overlay, 'fatsoma-active');
        addClass(this.overlay, 'fatsoma-inactive');
        this.hideContainer();
        setTimeout(function(){
            _this.overlay.style.display = '';
            _this.container.style.display = 'none';
        }, 1250);
    };

    FatsomaLightbox.prototype.isVisible = function() {
        return this.overlay.className.indexOf('fatsoma-active') != -1;
    };

    window.fatsomaEventsWidget = new EventsWidget();
})();
