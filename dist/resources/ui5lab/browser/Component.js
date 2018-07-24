sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","ui5lab/browser/model/SampleModel","ui5lab/browser/model/models","ui5lab/browser/controller/ErrorHandler"],function(e,s,t,o,i){"use strict";return e.extend("ui5lab.browser.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);this.setModel(o.createDeviceModel(),"device");var s=new t(this._oIconsLoadedPromise);this.setModel(s);s.loaded().then(this._fnSamplesLoadedResolve,this._fnSamplesLoadedReject);this._oErrorHandler=new i(this);this.getRouter().initialize()},samplesLoaded:function(){if(!this._oSamplesLoadedPromise){this._oSamplesLoadedPromise=new Promise(function(e,s){this._fnSamplesLoadedResolve=e;this._fnSamplesLoadedReject=s}.bind(this))}return this._oSamplesLoadedPromise},destroy:function(){this._oErrorHandler.destroy();e.prototype.destroy.apply(this,arguments)},getContentDensityClass:function(){if(this._sContentDensityClass===undefined){if(jQuery(document.body).hasClass("sapUiSizeCozy")||jQuery(document.body).hasClass("sapUiSizeCompact")){this._sContentDensityClass=""}else if(!s.support.touch){this._sContentDensityClass="sapUiSizeCompact"}else{this._sContentDensityClass="sapUiSizeCozy"}}return this._sContentDensityClass}})});