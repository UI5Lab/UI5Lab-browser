sap.ui.define([
		"ui5lab/browser/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"ui5lab/browser/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("ui5lab.browser.controller.Home", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the sampleList controller is instantiated.
			 * @public
			 */
			onInit: function () {
				var oViewModel;

				// Model used to manipulate control states
				oViewModel = new JSONModel({
					title: this.getResourceBundle().getText("homePanelTitle"),
					libraries: [
						{
							"ui5lab.geometry": {
								name: "Geometry"
							}
						}
					]
				});
				this.setModel(oViewModel, "homeView");

				this.getOwnerComponent().samplesLoaded().then(this._fillLayout.bind(this));
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			onShowLibrary: function (oEvent) {
				var oLink =  oEvent.getSource(),
					// TODO: do this properly with custom data
					sNamespace = oLink.getParent().getContent().pop().getText();

				this.getRouter().navTo("sampleList", {
					libraryId: sNamespace
				});
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			_fillLayout: function () {
				var oViewModel = this.getModel("homeView"),
					oSampleModel = this.getModel();

				oViewModel.setProperty("/libraries", oSampleModel.getData().libraries);
				oViewModel.setProperty("/title", this.getResourceBundle().getText("homePanelTitleCount", [oSampleModel.getData().libraries.length]));
			}
		});
	}
);
