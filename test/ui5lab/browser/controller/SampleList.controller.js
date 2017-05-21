sap.ui.define([
		"ui5lab/browser/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"ui5lab/browser/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("ui5lab.browser.controller.SampleList", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the sampleList controller is instantiated.
			 * @public
			 */
			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");

				// Put down sampleList table's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the table is
				// taken care of by the table itself.
				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				this._oTable = oTable;
				// keeps the search state
				this._oTableSearchState = [];

				// local model used to manipulate control states
				oViewModel = new JSONModel({
					title: this.getResourceBundle().getText("sampleListViewTitle"),
					sampleListTableTitle : this.getResourceBundle().getText("sampleListTableTitle"),
					saveAsTileTitle: this.getResourceBundle().getText("sampleListViewTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("sampleListViewTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailSampleListSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailSampleListMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "sampleListView");

				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				oTable.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for sampleList's table
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});

				this.getRouter().getRoute("sampleList").attachPatternMatched(this._onSampleListMatched, this);
				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Triggered by the table's 'updateFinished' event: after new table
			 * data is available, this handler method updates the table counter.
			 * This should only happen if the update was successful, which is
			 * why this handler is attached to 'updateFinished' and not to the
			 * table's list binding's 'dataReceived' method.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */
			onUpdateFinished : function (oEvent) {
				// update the sampleList's object counter after the table update
				var sTitle,
					oViewModel = this.getModel("sampleListView"),
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");
				// only update the counter if the length is final and
				// the table is not empty
				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("sampleListTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("sampleListTableTitle");
				}
				oViewModel.setProperty("/sampleListTableTitle", sTitle);
			},

			/**
			 * Event handler when a table item gets pressed
			 * @param {sap.ui.base.Event} oEvent the table selectionChange event
			 * @public
			 */
			onPress : function (oEvent) {
				// The source is the list item that got pressed
				this._showObject(oEvent.getSource());
			},


			/**
			 * Groups the sample list by it's assets or shows it alphabetically if deselected
			 * @param {sap.ui.base.Event} oEvent the toggleButton press event
			 */
			onToggleGroupByAsset: function (oEvent) {
				var oBinding = this._oTable.getBinding("items");

				if (!this.__fnGroup) {
					this.__fnGroup = oBinding.aSorters[0].fnGroup;
				}
				// toggle between asset grouping and simple list sorted alphabetically by name
				oBinding.aSorters[0].sPath = (oEvent.getParameter("pressed") ? "asset" : "name");
				oBinding.aSorters[0].fnGroup  = (oEvent.getParameter("pressed") ? this.__fnGroup : null);
				oBinding.aSorters[0].vGroup = oEvent.getParameter("pressed");
				oBinding.sort(oBinding.aSorters);
			},

			/**
			 * Event handler for navigating back.
			 * We navigate back in the browser historz
			 * @public
			 */
			onNavBack : function() {
				history.go(-1);
			},


			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var oTableSearchState = [];
					var sQuery = oEvent.getParameter("newValue") || oEvent.getParameter("search");

					if (sQuery && sQuery.length > 0) {
						oTableSearchState = [
							new Filter({
								filters: [
									new Filter("name", FilterOperator.Contains, sQuery),
									new Filter("description", FilterOperator.Contains, sQuery)
								],
								and: false
							})
						];
					}
					this._applySearch(oTableSearchState);
				}

			},

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh : function () {
				this._oTable.getBinding("items").refresh();
			},

			/**
			 * Group header factory for the sample list to display asset information
			 * @param {object} oGroup context information on the group item
			 * @return {sap.m.GroupHeaderListItem} Hedaer item with the name of the asset and its description
			 */
			getGroupHeader: function (oGroup){
				var oAsset = this.getModel().getData().assets.filter(function (oAsset) {
					return oAsset.id === oGroup.key;
				}).pop();

				// add asset description if possible
				return new sap.m.GroupHeaderListItem({
					title: oGroup.key + (oAsset ? " - " + oAsset.description : ""),
					upperCase: false
				});
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Binds the view to the selected library and exapnds mid column
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'sampleList'
			 * @private
			 */
			_onSampleListMatched: function (oEvent) {
				var sLibraryId =  oEvent.getParameter("arguments").libraryId,
					oViewModel = this.getModel("sampleListView"),
					oFlexibleLayout = this.getView().getParent().getParent();

				this.getModel().loaded().then( function() {
					// TODO: put this as system filter
					var oFilter = new Filter("library", FilterOperator.Contains, sLibraryId);

					this._oTable.getBinding("items").filter(oFilter);
				}.bind(this));
				oViewModel.setProperty("/title", this.getResourceBundle().getText("sampleListViewTitle", [sLibraryId]));

				oFlexibleLayout.setLayout(sap.f.LayoutType.TwoColumnsMidExpanded);
			},

			/**
			 * Binds the view to the selected library when object was selected
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'sampleList'
			 * @private
			 */
			_onObjectMatched: function (oEvent) {
				var sLibraryId =  oEvent.getParameter("arguments").libraryId;

				this.getModel().loaded().then( function() {
					// TODO: put this as system filter
					var oFilter = new Filter("library", FilterOperator.Contains, sLibraryId);

					this._oTable.getBinding("items").filter(oFilter);
				}.bind(this));
			},

			/**
			 * Shows the selected item on the object page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					libraryId: oItem.getBindingContext().getProperty("library"),
					objectId: oItem.getBindingContext().getProperty("id")
				});
			},

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @param {object} oTableSearchState an array of filters for the search
			 * @private
			 */
			_applySearch: function(oTableSearchState) {
				var oViewModel = this.getModel("sampleListView");
				this._oTable.getBinding("items").filter(oTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (oTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("sampleListNoDataWithSearchText"));
				}
			}

		});
	}
);
