/*global location*/
sap.ui.define([
		"ui5lab/browser/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"ui5lab/browser/model/formatter"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter
	) {
		"use strict";

		return BaseController.extend("ui5lab.browser.controller.Object", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the sampleList controller is instantiated.
			 * @public
			 */
			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0
					});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				// Store original busy indicator delay, so it can be restored later on
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				this.getOwnerComponent().getModel().loaded().then(function () {
						// Restore original busy indicator delay for the object view
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */


			/**
			 * Event handler  for navigating back.
			 * It there is a history entry we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the sampleList route.
			 * @public
			 */
			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("sampleList", {}, true);
				}
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				var oFlexibleLayout = this.getView().getParent().getParent();

				this.getModel().loaded().then( function() {
					this._showSample(sObjectId);
				}.bind(this));

				oFlexibleLayout.setLayout(sap.f.LayoutType.ThreeColumnsEndExpanded);
			},

			/**
			 * Binds the view to the sample path.
			 * @function
			 * @param {string} sObjectId path to the object to be bound
			 * @private
			 */
			_showSample : function (sObjectId) {
				var oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel(),
					aSamples = this.getModel().getProperty("/samples"),
					sSamplePath = "/samples/";

				for (var i = 0; i < aSamples.length; i++) {
					if (aSamples[i].id === sObjectId) {
						sSamplePath +=  i;
					}
				}

				this.getView().bindElement({
					path: sSamplePath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.loaded().then(function () {
								// Busy indicator on view should only be set if metadata is loaded,
								// otherwise there may be two busy indications next to each other on the
								// screen. This happens because route matched handler already calls '_bindView'
								// while metadata is loaded.
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding(),
					oContext = oElementBinding.getBoundContext().getObject();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				// Everything went fine.
				if (oContext.url) {
					oViewModel.setProperty("/href", oContext.url);
				} else {
					oViewModel.setProperty("/href", jQuery.sap.getModulePath("libs." + oContext.library + ".sample." + oContext.id.split("\.").pop(), ".html"));
				}
				oViewModel.setProperty("/busy", false);
			}

		});

	}
);
