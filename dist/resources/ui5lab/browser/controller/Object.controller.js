sap.ui.define(["ui5lab/browser/controller/BaseController","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","ui5lab/browser/model/formatter"],function(e,t,o,r){"use strict";return e.extend("ui5lab.browser.controller.Object",{formatter:r,onInit:function(){var e,o=new t({fullscreen:false,busy:true,delay:0});this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched,this);e=this.getView().getBusyIndicatorDelay();this.setModel(o,"objectView");this.getOwnerComponent().getModel().loaded().then(function(){o.setProperty("/delay",e)})},onNavBack:function(){var e=o.getInstance().getPreviousHash();if(e!==undefined){history.go(-1)}else{this.getRouter().navTo("sampleList",{},true)}},toggleFullScreen:function(){var e=this.getModel("objectView");var t=e.getProperty("/fullscreen");e.setProperty("/fullscreen",!t);if(!t){this.getModel("appView").setProperty("/previousLayout",this.getModel("appView").getProperty("/layout"));this.getModel("appView").setProperty("/layout","EndColumnFullScreen")}else{this.getModel("appView").setProperty("/layout",this.getModel("appView").getProperty("/previousLayout"))}},onClose:function(e){this.getModel("appView").setProperty("/layout","TwoColumnsMidExpanded");this.getRouter().navTo("sampleList",{libraryId:this._sLibraryId})},_onObjectMatched:function(e){var t=e.getParameter("arguments").objectId;var o=this.getView().getParent().getParent();this._sLibraryId=e.getParameter("arguments").libraryId;this.getModel().loaded().then(function(){this._showSample(t)}.bind(this));o.setLayout(sap.f.LayoutType.ThreeColumnsEndExpanded)},_showSample:function(e){var t=this.getModel("objectView"),o=this.getModel(),r=this.getModel().getProperty("/samples"),i="/samples/";for(var s=0;s<r.length;s++){if(r[s].id===e){i+=s}}this.getView().bindElement({path:i,events:{change:this._onBindingChange.bind(this),dataRequested:function(){o.loaded().then(function(){t.setProperty("/busy",true)})},dataReceived:function(){t.setProperty("/busy",false)}}})},_onBindingChange:function(){var e=this.getView(),t=this.getModel("objectView"),o=e.getElementBinding(),r=o.getBoundContext().getObject();if(!o.getBoundContext()){this.getRouter().getTargets().display("objectNotFound");return}if(r.url){t.setProperty("/href",r.url)}else{t.setProperty("/href",jQuery.sap.getModulePath("libs."+r.library+".sample."+r.id.split(".").pop(),".html"))}t.setProperty("/busy",false)}})});