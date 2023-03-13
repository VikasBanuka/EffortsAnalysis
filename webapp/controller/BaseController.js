/*
@copyright@
*/
sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"sap/m/StandardListItem",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/Sorter",
		"sap/m/Input",
		"sap/m/MultiInput",
		"sap/m/Select",
		"sap/m/MessageBox",
		"sap/m/DateRangeSelection",
		"sap/m/MultiComboBox",
		"sap/m/ComboBox",
		"sap/m/Token",
		"sap/m/CheckBox"
	],
	function (
		Controller,
		History,
		StandardListItem,
		Filter,
		FilterOperator,
		Sorter,
		Input,
		MultiInput,
		Select,
		MessageBox,
		DateRangeSelection,
		MultiComboBox,
		ComboBox,
		Token,
		CheckBox
	) {
		return Controller.extend("cis.effortsanalysis.controller.BaseController", {
			/**
			 * Convenience method for accessing the router in every controller of the application.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter: function () {
				return this.getOwnerComponent().getRouter();
			},

			setBusy: function (bFlag) {
				this.getModel("appView").setProperty("/busy", bFlag);
			},

			getResourceBundle: function () {
				return this.getOwnerComponent()
					.getModel("i18n")
					.getResourceBundle();
			},

			/**
			 * Convenience method for getting the view model by name in every controller of the application.
			 * @public
			 * @param {string} sName the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel: function (sName) {
				if (sName) {
					return this.getView().getModel(sName);
				}

				return this.getView().getModel();
			},

			/**
			 * Convenience method for setting the view model in every controller of the application.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel: function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			openValueHelp: function (oEvent, sLabel, bMulti) {
				this.getModel("appView").setProperty(
					"/multiSelectValueHelp",
					bMulti || false
				);
				this._oF4Input = oEvent.getSource();
				const sItemProp1 = this._oF4Input.data("ItemProp1");
				const sItemProp2 = this._oF4Input.data("ItemProp2");
				const sItemProp3 = this._oF4Input.data("ItemProp3");
				const sEntityName = this._oF4Input.data("filterEntity");
				const sModel = this._oF4Input.data("Model");

				if (!this._oValueHelpDialog) {
					this._oValueHelpDialog = sap.ui.xmlfragment(
						this.getView().getId(),
						"cis.effortsanalysis.fragment.ValueHelpDialog",
						this
					);
					this.getView().addDependent(this._oValueHelpDialog);
					this.openF4Dialog(sEntityName, sItemProp1, sItemProp2);
				}

				const sDialogTitle = this._oF4Input.data("DialogTitle");
				this._oValueHelpDialog.setTitle(
					this.getResourceBundle().getText("titleF4Help", [
						sDialogTitle ? sDialogTitle : sLabel,
					])
				);

				this.openF4Dialog(sModel,sEntityName, sItemProp1, sItemProp2, sItemProp3);
			},

			/**
			 * opens  F4 dialog for Input fields
			 * @private
			 * @param {string} sModel name of the result set
			 * @param {string} sEntityName name of the result set
			 * @param {string} sFilterProp1 name of the result set
			 * @param {string} sFilterProp2 name of the result set
			 */
			openF4Dialog: function (sModel,sEntityName, sFilterProp1, sFilterProp2, sFilterProp3) {
				let oItemTemplate = "";
				// let oSorter = {}
				oItemTemplate = new StandardListItem({
					title: sModel ? `{${sModel}>${sFilterProp1}}` : `{${sFilterProp1}}`,
					description: sModel ? `{${sModel}>${sFilterProp2}}` : `{${sFilterProp2}}`,
					info: sModel ? `{${sModel}>${sFilterProp3}}` : `{${sFilterProp3}}`,
					type: "Active",
				});
				// oSorter = new Sorter(`${sFilterProp1}`, false);
				this._oValueHelpDialog.bindAggregation("items", {
					path: sEntityName,
					template: oItemTemplate,
					model:sModel||""
				});

				this._oValueHelpDialog.open();
			},

			/**
			 * Clear fields in Smart Filterbar
			 * @public
			 * @param {sap.ui.core.Control} oSmartFilterControl Smart Filter Bar
			 */
			clearControlValues: function (oSmartFilterControl) {
				const aSelectionSet = oSmartFilterControl.getAllFilterItems();
				aSelectionSet.forEach(function (oFilterItem) {
					const oControl = oFilterItem.getControl();
					if (oControl instanceof MultiInput) {
						oControl.removeAllTokens();
					}
					if (
						oControl instanceof Input ||
						oControl instanceof DateRangeSelection
					) {
						oControl.setValue("");
					}
					if (oControl instanceof ComboBox) {
						oControl.setSelectedKey("");
					}
					if (oControl instanceof MultiComboBox) {
						oControl.setSelectedKeys([]);
					}
					if (oControl instanceof CheckBox) {
						oControl.setSelected(false);
					}
				}, this);
			},

			/**
			 * Clear fieldvalue
			 * @public
			 * @param {sap.ui.core.Control} oControl 
			 */
			clearControlValue: function (oControl) {
				if (oControl instanceof MultiInput) {
					oControl.removeAllTokens();
				}
				if (
					oControl instanceof Input ||
					oControl instanceof DateRangeSelection
				) {
					oControl.setValue("");
				}
				if (oControl instanceof ComboBox) {
					oControl.setSelectedKey("");
				}
				if (oControl instanceof MultiComboBox) {
					oControl.setSelectedKeys([]);
				}
				if (oControl instanceof CheckBox) {
					oControl.setSelected(false);
				}
			},

			/**
			 * handler when value from F4 is selected
			 * @public
			 * @param {sap.ui.base.Event} oEvent fo the input field
			 * @param {String} sAction fo the input field
			 */
			handleValueHelpClose: function (oEvent, sAction) {
				if (sAction === "Confirm") {
					const aSelectedContexts =
						oEvent.getParameter("selectedContexts");

					if (aSelectedContexts && aSelectedContexts.length > 0) {
						aSelectedContexts.forEach(
							function (oItemContext) {
								const sKeyField =
									this._oF4Input.data("ItemProp2") ? this._oF4Input.data("ItemProp2") : this._oF4Input.data("ItemProp1");
								const sTitleField = this._oF4Input.data("ItemProp1");
								if (this._oF4Input instanceof MultiInput) {
									this._oF4Input.addToken(
										new sap.m.Token({
											text: oItemContext.getProperty(
												sTitleField
											),
											key: oItemContext.getProperty(
												sKeyField
											),
										})
									);
								} else if (this._oF4Input instanceof Input) {
									this._oF4Input.setValue(
										oItemContext.getProperty(sTitleField)
									);
									if (
										this._oF4Input.data(
											"ShowDescription"
										) === "X"
									) {
										this._oF4Input.setDescription(
											oItemContext.getProperty(sKeyField)
										);
									}
								}
								this._oF4Input.fireChange();
							}.bind(this)
						);
					}
				}
			},
			/**
			 * handler for search in F4 dialogs
			 * @public
			 * @param {sap.ui.base.Event} oEvent for the input field
			 */
			handleValueHelpSearch: function (oEvent) {
				const sValue = oEvent.getParameter("value");
				const sFilterProp1 = this._oF4Input.data("ItemProp1");
				const sFilterProp2 = this._oF4Input.data("ItemProp2");
				const sFilterProp3 = this._oF4Input.data("ItemProp3");
				const sFilterOperator = FilterOperator.Contains;
				const sMinSuggest = this._oF4Input.data("minSuggestValue");

				if (sMinSuggest && sValue.length < sMinSuggest) {
					oEvent.preventDefault();
					return;
				}
				let aFilter = [];

				const oFilter = new Filter(
					sFilterProp1,
					FilterOperator[sFilterOperator],
					sValue
				);
				aFilter.push(oFilter);
				if (sFilterProp2) {
					const oFilter1 = new Filter(
						sFilterProp2,
						FilterOperator[sFilterOperator],
						sValue
					);
					aFilter.push(oFilter1);
				}
				if (sFilterProp3) {
					aFilter.push(new Filter(
						sFilterProp3,
						FilterOperator[sFilterOperator],
						sValue
					));
				}
				const oFinalFilter = new Filter(aFilter, false);

				const oBinding = oEvent.getSource().getBinding("items");
				oBinding.filter([oFinalFilter]);
			},

			/**
			 * retreive filters from filter controls
			 * @public
			 * @param {sap.ui.core.Control} oControl control
			 * @returns {sap.ui.model.Filter} filter
			 */
			getFilterFromControl: function (oControl, oFilterItem) {
				let bAdaptFilterControl = false;
				if (!oControl.data("filterProp")) {
					bAdaptFilterControl = true;
				}

				const sFilterProp = oControl.data("filterProp") ? oControl.data("filterProp") : oFilterItem.getName();
				let sFilterOperator = oControl.data("filterOperator") ? oControl.data("filterOperator") : "Contains";
				let aFilters1 = [];
				if (oControl instanceof MultiInput) {
					let aTokens = oControl.getTokens();
					let aFilters = [];
					if (aTokens.length === 0) {
						return null;
					}
					aTokens.forEach((oElement) => {

						let sValue = oElement.getKey() ? oElement.getKey() : oElement.getText();
						let sValue1;
						if (bAdaptFilterControl) {
							sValue = oElement.getText();
						}
						if (!oControl.data("filterOperator")) {
							sFilterOperator = this.formatter.getOperator(sValue);
							const oValue = this.formatter.getTrimmedValue(sValue, sFilterOperator);

							sValue = oValue.value1 || sValue;
							sValue1 = oValue.value2;
							if (oControl.oFieldViewMetadata.controlType === "date") {
								sValue = this.formatter.convertDatewithOffset(sValue);
								sValue1 = sValue1 ? this.formatter.convertDatewithOffset(sValue1) : sValue1;
							}
						}
						aFilters.push(
							new Filter(
								sFilterProp,
								FilterOperator[sFilterOperator],
								sValue, sValue1
							)
						);
					});
					return new Filter(aFilters, false);
				}
				if (oControl instanceof MultiComboBox) {
					const aKeys = oControl.getSelectedKeys();
					let aFilters = [];
					if (aKeys.length === 0) {
						return null;
					}
					for (let i = 0; i < aKeys.length; i++) {
						aFilters.push(
							new Filter(
								sFilterProp,
								FilterOperator[sFilterOperator],
								aKeys[i]
							)
						);
					}
					return new Filter(aFilters, false);
				}
				if (oControl instanceof Select || oControl instanceof ComboBox) {
					// const sValue = oControl.getSelectedKey();
					const sValue = oControl.getSelectedItem();
					if (!sValue) {
						return null;
					}
					aFilters1.push(
						new Filter(
							sFilterProp,
							FilterOperator[sFilterOperator],
							sValue.getKey()
						)
					);

					return new Filter(aFilters1, false);
				}

				if (oControl instanceof Input) {
					const sValue = oControl.getValue();
					if (!sValue) {
						return null;
					}
					aFilters1.push(
						new Filter(
							sFilterProp,
							FilterOperator[sFilterOperator],
							sValue
						)
					);

					return new Filter(aFilters1, false);
				}

				if (oControl instanceof DateRangeSelection) {
					const sValue = oControl.getDateValue();
					if (!sValue) {
						return null;
					}
					const sValue1 = oControl.getSecondDateValue();
					return new Filter(
						sFilterProp,
						FilterOperator.BT,
						sValue,
						sValue1
					);
				}

				if (oControl instanceof CheckBox) {
					const sValue = oControl.getSelected() ? "X" : "";
					if (!sValue) {
						return null;
					}
					aFilters1.push(
						new Filter(
							sFilterProp,
							FilterOperator[sFilterOperator],
							sValue
						)
					);

					return new Filter(aFilters1, false);
				}
				return null;
			},
			/**
			 * Value help suggest utility function
			 * @param {sap.ui.base.Event} oEvent Event of Input control
			 * @returns
			 */

			OnValueHelpSuggest: function (oEvent) {
				const oControl = oEvent.getSource();
				const sFilterProp = oControl.data("ItemProp1");
				const sMinSuggest = oControl.data("minSuggestValue");
				const sTerm = oEvent.getParameter("suggestValue");

				const sFilterOperator =FilterOperator.Contains;

				if (sMinSuggest && sTerm.length < sMinSuggest) {
					oEvent.preventDefault();
					return;
				}
				let aFilters = [];
				let aSorters = [];
				let sSortProperty = "";
				let aSearchProperties = [];
				const sSearchTerms = oControl.data("SuggestTerms");
				if (sSearchTerms) {
					aSearchProperties = sSearchTerms.split(",");
					sSortProperty = aSearchProperties[0];

				}
				if (sTerm) {
					if (aSearchProperties.length < 1) {
						aFilters.push(
							new Filter(sFilterProp, sFilterOperator, sTerm)
						);
					} else if (aSearchProperties.length > 0) {
						aSearchProperties.forEach(function (sProp) {
							aFilters.push(
								new Filter(sProp, sFilterOperator, sTerm)
							);
						});
					}
					aFilters = [new Filter(aFilters, false)];

				//	aSorters = [new Sorter(sSortProperty ? sSortProperty : sFilterProp)]
				}

				// oEvent
				// 	.getSource()
				// 	.getBinding("suggestionItems")
				// 	.sort(aSorters);

				oEvent
					.getSource()
					.getBinding("suggestionItems")
					.filter(aFilters);
			},

			/**
			 * Convenience method for showing dialog fragment.
			 * @public
			 * @param {object} oConfig configuration for showing dialog
			 * @param {boolean} bHidden if dialog should be hidden
			 */
			showFragmentDialog: function (oConfig, bHidden) {
				if (!this[oConfig.sVariable]) {
					this[oConfig.sVariable] = sap.ui.xmlfragment(
						this.getView().getId(),
						"cis.effortsanalysis.fragment." + oConfig.sFragmentName,
						this
					);
					//define models
					this.getView().addDependent(this[oConfig.sVariable]);
					if (oConfig.fnInit) {
						oConfig.fnInit();
					}
				}
				const oDialog = this[oConfig.sVariable];

				if (oConfig.fnBeforeOpen) {
					oConfig.fnBeforeOpen(oDialog);
				}

				if (oConfig.fnOpen) {
					oConfig.fnOpen(oDialog);
				} else if (!bHidden) {
					oDialog.open();
				}

				if (oConfig.fnAfterOpen) {
					oConfig.fnAfterOpen(oDialog);
				}
			},
			onCloseDialog: function (oEvent, sVariable) {
				this[sVariable].close();
			},

			/**
			 * Reset value state of a Input field
			 * @param {sap.ui.base.Event} oEvent event of field
			 */

			onFieldChange: function (oEvent) {
				oEvent.getSource().setValueState("None");
			},

			/**
			 * Attach valiadtor for all Multiinputs inside filter bar
			 * @param {sap.ui.comp.filterbar.FilterBar} oFilterBar filterbar
			 */

			attachTokenValidatorForFilterbar: function (oFilterBar) {
				const aSelectionSet = oFilterBar.getAllFilterItems();
				aSelectionSet.forEach(function (oFilterItem) {
					const oControl = oFilterItem.getControl();
					if (oControl instanceof MultiInput) {
						const fnValidator = function (args) {
							const sText = args.text;
							const oSugegstObject = args.suggestionObject;
							let sKey;
							if (oSugegstObject) {
								sKey = args.suggestionObject.getKey() ? args.suggestionObject.getKey() : sText;
							}
							return new Token({
								key: sKey ? sKey : sText,
								text: sText,
							});
						};
						oControl.addValidator(fnValidator);
					}
				}, this);
			},
			/**
			 * Hide adapt filterbar from smartFilterbar
			 * @param {sap.ui.comp.smartfilterbar.SmartFilterBar} oFilterBar 
			 * @public
			 */
			hideAdaptFilters: function (oFilterBar) {
				const oToolbar = oFilterBar.getContent()[0].getEndContent()[0].getContent()[1].getContent();
				oToolbar.some(function (oButton) {
					if (oButton.getId().indexOf("btnFilters") !== -1) {
						oButton.setVisible(false);
						return true;
					}
					return false;
				})
			},
			/**
			 * Set width of columns in smart table
			 * @param {Array} aColumns array of Columns 
			 * @public
			 */
			setWidthForColumns: function (aColumns) {
				aColumns.forEach(function (oColumn) {
					if(oColumn.getAggregation("label")){
                        oColumn.getAggregation("label").setWrapping(true);
                    }   
					let iWidth = 10;
					if (oColumn.data("p13nData").customColumn) {
						iWidth = parseInt(oColumn.getWidth());
					}

					oColumn.setWidth(iWidth + "rem");

				});
			}
		});
	}
);