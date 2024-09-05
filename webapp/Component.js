/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "sap/com/managepurchaseorder/model/models",
        "sap/ui/core/routing/HashChanger",
        "sap/m/MessageBox"
    ],
    function (UIComponent, Device, models,HashChanger,MessageBox) {
        "use strict";

        return UIComponent.extend("sap.com.managepurchaseorder.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                var oDataModel = this.getModel();
                var loginModel = this.getModel("loginModel");
                // metadata failed
            oDataModel.attachMetadataFailed(err => {
                var response = err.getParameter("response").body;
                if (response.indexOf("<?xml") !== -1) {
                    MessageBox.error($($.parseXML(response)).find("message").text());
                } else {
                    MessageBox.error(response);
                }
            });

            oDataModel.metadataLoaded().then(() => {
                var site = window.location.href.includes("site");
                if (site) {
                    var slash = site ? "/" : "";
                    var modulePath = jQuery.sap.getModulePath("sap/com/managepurchaseorder");
                    modulePath = modulePath === "." ? "" : modulePath;
                    $.ajax({
                        url: modulePath + slash + "user-api/attributes",
                        type: "GET",
                        success: res => {
                            debugger
                            let emailId = res.email;
                            this.setHeaders(emailId);
                        }
                    });
                } else {
                    let emailId = 'test@gmail.com';
                    this.setHeaders(emailId);
                }
            });

            // odata request failed
            oDataModel.attachRequestFailed(err => {
                var responseText = err.getParameter("response").responseText;
                if (responseText.indexOf("<?xml") !== -1) {
                    MessageBox.error($($.parseXML(responseText)).find("message").text());
                } else {
                    MessageBox.error(JSON.parse(responseText).error.message.value);
                }
             });

                // // enable routing
                // this.getRouter().initialize();

                // // set the device model
                // this.setModel(models.createDeviceModel(), "device");
            },
            setHeaders: function (emailId) {
               
                var loginModel = this.getModel("loginModel");
    
               loginModel.setData({
                    "emailid": emailId
               });
                loginModel.refresh(true);
    
                HashChanger.getInstance().replaceHash("");
             // enable routing
             this.getRouter().initialize();
    
             // set the device model
             this.setModel(models.createDeviceModel(), "device");
    
           },
           destroy : function () {
            // this._oErrorHandler.destroy();
            // call the base component's destroy function
            UIComponent.prototype.destroy.apply(this, arguments);
        },
           getContentDensityClass : function() {
            if (this._sContentDensityClass === undefined) {
                // check whether FLP has already set the content density class; do nothing in this case
                // eslint-disable-next-line fiori-custom/sap-no-proprietary-browser-api, fiori-custom/sap-browser-api-warning
                if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
                    this._sContentDensityClass = "";
                } else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        }

    
        });
    }
);