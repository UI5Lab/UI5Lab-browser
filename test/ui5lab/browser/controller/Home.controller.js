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

				// local model used to manipulate control states
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

				this.getRouter().getTarget("home").attachEventOnce("display", this._onHomeTargetMatched, this);
				this.getOwnerComponent().samplesLoaded().then(this._fillLayout.bind(this));
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Toggles between grid and table view of the libraries
			 * @param {sap.ui.base.Event} oEvent The SegmentedButton select event
			 */
			onSelect: function (oEvent) {
				var sKey = oEvent.getParameter("key");

				this.byId("projects").removeAllContent();
				this.getRouter().getTarget("home" + sKey).display();
			},



			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Called once to display the default view on all entry points
			 * @private
			 */
			_onHomeTargetMatched: function () {
				if (this.byId("projects").getContent().length === 0) {
					this.getRouter().getTarget("homeGrid").display();
				}
			},

			/**
			 * Set up of the local view model to display libraries and the title on the home screen
			 * @private
			 */
			_fillLayout: function () {
				var oViewModel = this.getModel("homeView"),
					oSampleModel = this.getModel();

				if (oSampleModel) {
					oViewModel.setProperty("/libraries", oSampleModel.getData().libraries);
					oViewModel.setProperty("/title", this.getResourceBundle().getText("homePanelTitleCount", [oSampleModel.getData().libraries.length]));
				}
			}
		});
	}
);
