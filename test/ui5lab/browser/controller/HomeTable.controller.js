sap.ui.define([
		"ui5lab/browser/controller/BaseController",
		"ui5lab/browser/model/formatter",
	], function (BaseController, JSONModel, formatter) {
		"use strict";

		return BaseController.extend("ui5lab.browser.controller.HomeTable", {

			formatter: formatter,

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Navigates to the library details
			 * @param {sap.ui.base.Event} oEvent The press event
			 */
			onShowLibrary: function (oEvent) {
				var oControl = oEvent.getSource(),
					sNamespace = oControl.getBindingContext("homeView").getObject().id;

				this.getRouter().navTo("sampleList", {
					libraryId: sNamespace
				});
			}
		});
	}
);
