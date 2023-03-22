sap.ui.define([
    "./BaseController"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController) {
        "use strict";

        return BaseController.extend("cis.effortsanalysis.controller.View1", {
            onInit: function () {
                this.getRouter()
                .getRoute("OrdersView")
                .attachPatternMatched(this._onRouteMatched, this);
            this._smartFilterId = "smartFilterBar";
            this._smartTableId = "EffortAnalysisTable";
            },
        /**
		 * Route match handler method
		 * @private
		 */
		_onRouteMatched: function () {
			// this.byId("idOrdersTable").clearSelection();
            this.byId("smartFilterBar").addEventDelegate({
                onAfterRendering: function () {
                    this.attachTokenValidatorForFilterbar(
                        this.byId("smartFilterBar")
                    );
                }
            }, this);
        },

        onBeforeRebindTable: function (oEvent) {
            const mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.parameters.expand = "";
            let aUIFilters = [];
            this._createFilters(mBindingParams,aUIFilters);
            if(aUIFilters.length===0){
                // this._setDefaults();
                this._createFilters(mBindingParams,aUIFilters);
            }
            
            const oSmartTable = this.byId("EffortAnalysisTable");
            oSmartTable.getTable().rerender();


            // this._setColumnWidth(oEvent.getSource().getTable());
           
        },

        _createFilters: function(mBindingParams,aUIFilters){
            const aSelectionSet = this.byId("smartFilterBar").getAllFilterItems();
            aSelectionSet.forEach(function (oFilterItem) {
                let oFilter = null;
                if (oFilterItem.getControl().data("filterProp")) {
                    oFilter = this.getFilterFromControl(
                        oFilterItem.getControl()
                    );
                }
                if (oFilter) {
                    mBindingParams.filters.push(oFilter);
                    aUIFilters.push(oFilter);
                }
            }, this);
        },
            dataReceived: function(oEvent){
                let sCount = oEvent.getParameter("data").results.length;
                this.getView().byId("idOrdersText").setText(`Orders (${sCount})`);
            },
            showActualsVsPlanned: function(oEvent){
                const oContext = oEvent
                .getParameter("listItem")
                .getBindingContext();
                this.getOwnerComponent().getRouter().navTo("actualsVsPlanned", {
                    orderNo: oContext.getProperty("Aufnr")
                });
            },
            /**
			 * @private
			 * @param {sap.ui.table.Table} oTable Table Object
			 */
			_setColumnWidth: function (oTable) {
				const aColumns = oTable.getColumns();
				this.setWidthForColumns(aColumns);
			},
            /**
			 * Filter Demand table
			 */

			onFilterSearch: function () {

				this.byId("EffortAnalysisTable").setShowRowCount(true);
			},

            /**
			 * Variant select method
			 * params {sap.ui.base.Event} oEvent Event instance of the variant select
			 * @public
			 */
			onVariantSelect: function (oEvent) {
				const oModel = this.getModel("PlanningData");
				const oFilterData = this.byId(this._smartFilterId).getFilterData();
				if (oFilterData && oFilterData._CUSTOM) {
					const aSelectionSet = this.byId(this._smartFilterId).getAllFilterItems();
					aSelectionSet.forEach(function (oFilterItem) {
						if (oFilterItem.getControl().data("filterProp")) {
							const oControl = oFilterItem.getControl();
							const sFilterProp = oControl.data("filterProp") ? oControl.data("filterProp") : oFilterItem.getName();
							this.clearControlValue(oControl)
							if (!oFilterData._CUSTOM[sFilterProp]) {
								return true
							}
							if (oControl instanceof MultiInput) {
								oFilterData._CUSTOM[sFilterProp].forEach(function (oItem) {
									oControl.addToken(new Token({
										key: oItem.key,
										text: oItem.text
									}))

								});
								return true;

							}
							if (oControl instanceof MultiComboBox) {
								oControl.setSelectedKeys(oFilterData._CUSTOM[sFilterProp]);
								return true;
							}
							if (oControl instanceof ComboBox) {
								oControl.setSelectedKey(oFilterData._CUSTOM[sFilterProp]);
								return true;
							}

							if (oControl instanceof Input) {
								oControl.setValue(oFilterData._CUSTOM[sFilterProp]);
								return true;
							}

							if (oControl instanceof DateRangeSelection) {
								oControl.setDateValue(new Date(oFilterData._CUSTOM[sFilterProp].date));
								oControl.setSecondDateValue(new Date(oFilterData._CUSTOM[sFilterProp].secondDate));
							}

							if (oControl instanceof CheckBox) {
								oControl.setSelected(oFilterData._CUSTOM[sFilterProp]);
								return true;
							}
						}
					}, this);
				} else {
					this.clearControlValues(this.byId(this._smartFilterId)); //In Case standard
					//this._setDefaults();
				}
				this.byId(this._smartTableId).rebindTable();

			},

            /**
			 * Before Variant Fetch event
			 * @public
			 */

			onBeforeVariantFetch: function () {
				if (this.byId(this._smartFilterId).getCurrentVariantId()) {
					const aSelectionSet =
						this.byId(this._smartFilterId).getAllFilterItems();

					let oCustomFilters = {};

					aSelectionSet.forEach(function (oFilterItem) {
						if (oFilterItem.getControl().data("filterProp")) {
							const oControl = oFilterItem.getControl();
							const sFilterProp = oControl.data("filterProp") ? oControl.data("filterProp") : oFilterItem.getName();
							if (oControl instanceof MultiInput) {
								let aTokens = oControl.getTokens();
								let aValues = [];

								if (aTokens.length === 0) {
									return null;
								}
								aTokens.forEach((oElement) => {
									aValues.push({
										key: oElement.getKey(),
										text: oElement.getText()
									});
								});
								oCustomFilters[sFilterProp] = aValues;
							}
							if (oControl instanceof MultiComboBox) {
								const aKeys = oControl.getSelectedKeys();
								let aValues = [];
								if (aKeys.length === 0) {
									return null;
								}

								oCustomFilters[sFilterProp] = aKeys;
							}
							if (oControl instanceof ComboBox) {
								const sValue = oControl.getSelectedKey();
								if (!sValue) {
									return null;
								}
								oCustomFilters[sFilterProp] = sValue;

							}

							if (oControl instanceof Input) {
								const sValue = oControl.getValue();
								if (!sValue) {
									return null;
								}
								oCustomFilters[sFilterProp] = sValue;

							}

							if (oControl instanceof DateRangeSelection) {
								const sValue = oControl.getDateValue();
								if (!sValue) {
									return null;
								}
								const sValue1 = oControl.getSecondDateValue();
								oCustomFilters[sFilterProp] = {
									date: sValue,
									secondDate: sValue1
								};
							}

							if (oControl instanceof CheckBox) {
								const sValue = oControl.getSelected();
								if (!sValue) {
									return null;
								}
								oCustomFilters[sFilterProp] = sValue;

							}
						}

					}, this);
					this.byId(this._smartFilterId).setFilterData({
						_CUSTOM: oCustomFilters
					});
				}
				this.onVariantSelect();
			},
			onFilterInitialise: function(oEvent){
				const oView = this.getView();
				const oFilterBar = oEvent.getSource();
				this._setDefaultDateFilter(oFilterBar);
				this.byId("POSmartTable").rebindTable();
			},
			_setDefaultDateFilter: function(){
			},
        });
    });
