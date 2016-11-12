/* 
 * By Mats Ljungquist
 */

(function() {
    
    var app = {
        svgDoc: null,
        svg: null,
        layerBB: null,
        layerWeapon: null,
        layerMountingPoints: null,
        currentScreen: null,
        mountingPoints: null,
        selectedMountingPoint: null,

        /**
         * Called by the window.onload. Performs all ajax initializations
         * through (if necessary) an ajax call chain (brr!) and finalizes by
         * calling postAjaxInit().
         */
        init: function() {
            dataHandler.init(app.postAjaxInit);
        },
        
        /**
         * Performs all the initialization of the application.
         */
        postAjaxInit: function() {
            var obj = document.getElementById("mecha");
            app.svgDoc = obj.getSVGDocument();
            app.layerBB = app.svgDoc.getElementById("bb-canvas");
            app.layerMountingPoints = app.svgDoc.getElementById("mounting-points");
            app.layerWeapon = app.svgDoc.getElementById("layer-weapon");
            app.initMountingPoints();
            
            app.svg = app.svgDoc.getElementById("mechaSvgId");
            
            weapons.init();
            
            sizeHandler.init();
            
            // Eventlistener for the svg document. Use it to deselect mounting points.
            app.svgDoc.addEventListener("click", app.deselectMountingPoints, false);
            
//            document.addEventListener("click", function (evt) { console.log("document");}, false);
//            document.getElementById("panel-init").addEventListener("click", function (evt) { console.log("panel-init");}, false);
            
            //app.svgDoc.getElementById("ll1").addEventListener("click", function(evt) {console.log(evt.target.id);}, false);
            
            app.svgDoc.addEventListener("click", function(evt) {
                console.log(app.svg.nodeName);
                var rpos = app.svg.createSVGRect();
                rpos.x = evt.clientX;
                rpos.y = evt.clientY;
                rpos.width = rpos.height = 1;
                console.log(rpos);
                var list = app.svg.getIntersectionList(rpos, null);
                console.log(list);
            }, false);
            
            app.start();
        },
        
        /**
         * Starts the application (presents the first screen). 
         * First thing that should be run after all initialization is finished.
         */
        start: function() {
            app.displayScreen("screen-weapons");
        },
        
        displayScreen: function(screenName) {
            app.currentScreen = document.getElementById(screenName);
            app.currentScreen.style.display = "block";
        },

        selectMountingPoint: function(evt) {
            var element = document.getElementById("panel-detail"),
                    mp = evt.target,
                    mpName = mp.id.substring(3),
                    i = 0;
            
            app.deselectMountingPoints();
            element.style.display = "block";
            mp.style.cssText = "fill: red; fill-opacity: 0.8; stroke-width: 3; stroke: red;";
            element.childNodes[1].innerHTML = mpName;
            
            for (;i < app.mountingPoints.length; i++) {
                if (mpName === app.mountingPoints[i].id) {
                    app.selectedMountingPoint = app.mountingPoints[i];
                }
            }
            evt.stopPropagation();
        },
        
        deselectMountingPoints: function(evt) {
            var element = document.getElementById("panel-detail"),
                    i = 0,
                    mp = app.layerMountingPoints.getElementsByTagName("circle");
            
            element.style.display = "none";
            
            for (i = mp.length - 1; i >= 0; i--) {
                    mp[i].style.cssText = "";
            }
            app.selectedMountingPoint = null;
        },
        
        initMountingPoints: function() {
            var i = 0, mp = app.layerMountingPoints.getElementsByTagName("circle");
            
            app.mountingPoints = [];

            for (i = mp.length - 1; i >= 0; i--) {
                mp[i].addEventListener("mouseover", this.hilightMountingPoint, false);
                mp[i].addEventListener("mouseout", this.unhilightMountingPoint, false);
                mp[i].addEventListener("click", this.selectMountingPoint, false);
                mp[i].addEventListener("click", weapons.setDropDown, false);
                
                app.mountingPoints.push({
                    id:mp[i].getAttribute("id").substring(3),
                    cx:mp[i].getAttribute("cx"),
                    cy:mp[i].getAttribute("cy")
                });
            }
        },
        
        hilightMountingPoint: function(evt) {
            app.unhilightMountingPoint(evt);
            // Yellow should be highlighted yellow and red red
            if (evt.target.style.cssText.indexOf("red") < 0) {
                evt.target.style.cssText = "fill-opacity: 0.8; stroke-width: 3";
            } else {
                evt.target.style.cssText = "fill: red; fill-opacity: 0.8; stroke-width: 3; stroke: red;";
            }
            evt.stopPropagation();
        },
        
        unhilightMountingPoint: function(evt) {
            var i = 0, mp = app.layerMountingPoints.getElementsByTagName("circle");
            
            for (i = mp.length - 1; i >= 0; i--) {
                if (mp[i].style.cssText.indexOf("red") < 0) {
                    mp[i].style.cssText = "";
                } else {
                    mp[i].style.cssText = "fill: red; fill-opacity: 0.8; stroke-width: 1; stroke: red;";
                }
            }
            evt.stopPropagation();
        },

        bodySelect: function(evt) {
            var rect = null,
                    bbox = evt.target.getBBox();

            app.removeBoundingRects(evt);

            rect = app.svgDoc.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", bbox.x);
            rect.setAttribute("y", bbox.y);
            rect.setAttribute("width", bbox.width);
            rect.setAttribute("height", bbox.height);
            rect.style.cssText = "fill: none; stroke: yellow; stroke-width: 3;";

            app.layerBB.appendChild(rect);
            evt.stopPropagation();
        }
    };
    
    var weapons = {
        
        data: null,
        
        init: function() {
            var selector = null,
                    i = 0,
                    oel = null;
            
            this.data = dataHandler.data.weapons;
            
            if (this.data) {
                // Initialize weapon drop down selector (in detail panel).
                selector = document.getElementById("dd-weapon");
                for (; i < this.data.length; i++) {
                    oel = document.createElement("option");
                    oel.setAttribute("value", this.data[i]["short-name"]);
                    oel.innerHTML = this.data[i]["long-name"];
                    selector.appendChild(oel);
                }
                selector.addEventListener("change", weapons.selectWeapon, false);
            }
	},
        
        setDropDown: function(evt) {
            var selector = document.getElementById("dd-weapon");
            selector.value = '';
        },
        
        getWeapon: function(id) {
            var i = 0;
            for (; i < weapons.data.length; i++) {
                if (id == weapons.data[i]['short-name']) {
                    return weapons.data[i];
                }
            }
            return null;
        },
        
        selectWeapon: function(evt) {
            var ddValue = evt.target.value,
                weaponData = weapons.getWeapon(ddValue),
                weapon = null;
            
            console.log(ddValue);
            
            // CONTINUE HERE!!
            if ("top-left" == app.selectedMountingPoint.id) {
                if (weaponData) {
                    weapon = app.svgDoc.createElementNS("http://www.w3.org/2000/svg", "use");
                    weapon.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#torso-top-cannon");
                    weapon.setAttribute("x", 230);
                    weapon.setAttribute("y", 40);
                    weapon.setAttribute("id", "el-torso-top-cannon");

                    app.layerWeapon.appendChild(weapon);
                } else {
                    weapon = app.svgDoc.getElementById("el-torso-top-cannon");
                    if (weapon) {
                        app.layerWeapon.removeChild(weapon);
                    }
                }
            }
        }
    };
    
    var sizeHandler = {
        
        data: null,
        selectedSize: null,
        
        init: function() {
            var sizeDiv = document.getElementById("size"),
                divs = sizeDiv.getElementsByTagName("div");
        
            this.data = dataHandler.data.chassis;

            for (var i = 0; i < divs.length; i++) {
                // Create the images (using the definition in the svg-file)
                sizeHandler.createMechSize(divs[i].childNodes[1].getSVGDocument(), divs[i].getAttribute("class"));
            }
        },
        
        getChassis: function(id) {
            var i = 0;
            for (; i < sizeHandler.data.length; i++) {
                if (id == sizeHandler.data[i]['chassisSize']) {
                    return sizeHandler.data[i];
                }
            }
            return null;
        },
        
        createMechSize: function(container, id) {
            var layer = container.getElementById("img-layer"),
                sizeEl = app.svgDoc.createElementNS("http://www.w3.org/2000/svg", "use");
            sizeEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#mecha-size");
            sizeEl.setAttribute("x", 5);
            sizeEl.setAttribute("y", 5);
            sizeEl.setAttribute("id", id);
            sizeEl.setAttribute("class", "main-color");
            sizeEl.style.cssText = "filter: url(#drop-shadow)";
            sizeEl.addEventListener("click", sizeHandler.sizeSelector, false);
            
            layer.innerHTML = ""; // Clear the drawing layer (just as a precaution)
            layer.appendChild(sizeEl); // add the newly created element
        },
        
        sizeSelector: function(evt) {
            console.log(evt.target.id);
            sizeHandler.selectedSize = sizeHandler.getChassis(evt.target.id);
        }
    };
    
    var dataHandler = {
        
        dataUrl: 'data/mechdata.json',
        data: null,
        
        init: function(callback) {
            this.ajaxCall(this.dataUrl, function (o) {
                    dataHandler.data = JSON.parse(o.responseText);
                    callback();
		}
            );
        },
        
        ajaxCall: function(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = (function (myxhr) {
                return function () {
                    if (myxhr.readyState === 4 && myxhr.status === 200) {
                        callback(myxhr);
                    }
                };
            }(xhr));
            xhr.open('GET', url, true);
            xhr.send('');
        }
    };
    
    /***************************
     Execute the game
    ***************************/
    window.onload = function() {
        app.init();
    };
}());