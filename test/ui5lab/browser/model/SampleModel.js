/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (jQuery, JSONModel, MessageBox) {
	"use strict";

	return JSONModel.extend("ui5lab.browser.model.SampleModel", {

		/**
		 * Loads samples available in the current project based on metadata
		 * @class
		 * @public
		 * @alias sap.ui.demo.iconexplorer.model.IconModel
		 */
		constructor : function () {

			// call base class constructor
			JSONModel.apply(this, arguments);
			this.setSizeLimit(10000);

			// set up the JSON model data in a timeout to not block the UI while loading the app
			setTimeout(function () {
				this._iStartTime = new Date().getTime();
				this._loadLibraries();
			}.bind(this), 0);

			return this;
		},

		/**
		 * Promise to register when the asynchronous loading of samples is finished
		 * @return {Promise} a promise that is resolved when all samples are loaded
		 */
		loaded: function () {
			if (!this._oSamplesLoadedPromise) {
				this._oSamplesLoadedPromise = new Promise(function(fnResolve, fnReject) {
					this._fnSamplesLoadedResolve = fnResolve;
					this._fnSamplesLoadedReject = fnReject;
				}.bind(this));
			}
			return this._oSamplesLoadedPromise;
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Load and process all libraries available in the current project
		 * @private
		 */
		_loadLibraries: function () {
			var oMetadataLoaded = new Promise(function(fnResolve, fnReject) {
				// TODO:
				// * this needs to be replaced by a dynamic discovery servlet
				// * nobody wants to configure redundant metadata

				// load library metadata file asynchronously
				jQuery.ajax(jQuery.sap.getModulePath("libs", "/libraries.json"), {
					dataType: "json",
					success: function (oData) {
						var aLibraries = oData.libraries;
						this._oMetadata = {};
						this._iLibraryCount = aLibraries.length;
						this._iLibraryLoadedCount = 0;

						if (aLibraries.length > 0) {
							for (var i = 0; i < aLibraries.length; i++) {
								this._loadSamples(aLibraries[i], fnResolve, fnReject);
							}
						} else {
							// display hint
							MessageBox.information("No libraries configured, please add a libraries.json file");
							fnResolve();
						}
					}.bind(this),
					error: fnReject
				});
			}.bind(this));

			// process data once both models are loaded
			oMetadataLoaded.then(this._onMetadataLoaded.bind(this), this._onError.bind(this));
		},

		/**
		 * Load and process all samples from the metadata
		 * @private
		 */
		_loadSamples: function (sLibraryName, fnResolve, fnReject) {
			jQuery.ajax(jQuery.sap.getModulePath("libs." + sLibraryName, "/index.json"), {
				dataType: "json",
				success: function (oData) {
					this._oMetadata[sLibraryName] = oData[sLibraryName];
					this._iLibraryLoadedCount++;
					if (this._iLibraryCount === this._iLibraryLoadedCount) {
						fnResolve();
					}
				}.bind(this),
				error: fnReject
			});
		},

		/**
		 *	Post process all data for display in the icon explorer
		 * @private
		 */
		_onMetadataLoaded : function()  {
			// trace elapsed time
			jQuery.sap.log.info("SampleModel: Loaded all samples in " + (new Date().getTime() - this._iStartTime) + " ms");

			var oSampleData = this._processMetadata(this._oMetadata);

			// set the model data
			this.setProperty("/", oSampleData);
			this.updateBindings(true);

			// resolve iconsLoaded promise
			this._fnSamplesLoadedResolve();
		},

		/**
		 * Sorts and formats the sample metadata to be used in bindings
		 * @param oMetadata Raw metadata coming from the json descriptor
		 * @return {object} Formatted metadata
		 * @private
		 */
		_processMetadata: function (oMetadata) {
			var oModelData = {
				libraries: [],
				assets: [],
				samples: []
			};
			aLibraryNames = oMetadata;

			var aLibraryNames = Object.keys(aLibraryNames);
			for (var i = 0; i < aLibraryNames.length; i++) {
				// store library information
				oMetadata[aLibraryNames[i]].id = aLibraryNames[i];
				oModelData.libraries.push(oMetadata[aLibraryNames[i]]);
				// separately index assets and samples
				var aEntities = Object.keys(oMetadata[aLibraryNames[i]].content);
				for (var j = 0; j < aEntities.length; j++) {
					var oAsset = oMetadata[aLibraryNames[i]].content[aEntities[j]];

					// create global id and store asset
					oAsset.id = aLibraryNames[i] + "." + oAsset.id;
					oAsset.library = aLibraryNames[i];
					oModelData.assets.push(oAsset);

					// list samples separately
					for (var k = 0; k < oAsset.samples.length; k++) {
						var oSample = oAsset.samples[k];

						// create global id and store asset
						oSample.id = oAsset.id + "." + oSample.id;
						oSample.asset = oAsset.id;
						oSample.library = aLibraryNames[i];
						oModelData.samples.push(oSample);
					}
				}
			}
			return oModelData;
		},

		/**
		 * Fires a request failed event in case the metadata for the icons could not be read
		 * @param {object} oResponse the response object from the ajax request
		 * @private
		 */
		_onError: function (oResponse) {
			oResponse.error = "Failed to load the metadata, check for parse errors";
			this.fireRequestFailed({response: oResponse});
			this._fnSamplesLoadedReject();
		}
	});
});
