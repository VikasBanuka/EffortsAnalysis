sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("cis.effortsanalysis.controller.ActualsVsPlanned", {
            onInit: function(){
                const oViewModel = new JSONModel({
					busy: false,
					delay: 0,
				});

				this.getOwnerComponent().getRouter()
					.getRoute("actualsVsPlanned")
					.attachPatternMatched(this._onRouteMatched, this);

				this.getView().setModel(oViewModel, "actualsVsPlannedView");
            },
            _onRouteMatched: function(oEvent){
                const sOrderNo = oEvent.getParameter("arguments").orderNo;
				// this._sOrderNo = sOrderNo;
				// this.byId("ActualsVsPlannedAnalysisTable").rebindTable();
				// this.byId("ActualsVsPlannedAnalysisTable").addEventDelegate({
				// 	onAfterRendering: function () {
				// 		this.byId("ActualsVsPlannedAnalysisTable").rebindTable();
				// 	}
				// }, this);
                this.getView().getModel()
					.metadataLoaded()
					.then(
						function () {
							let aFilters = [];
							let oFilters = new Filter ("Aufnr", FilterOperator.EQ, sOrderNo);
							aFilters.push(oFilters);
							let that = this;
							this.getOwnerComponent().getModel().read("/zplanSet", {
								filters:aFilters,
								success: function(oResponse){
									that.getView().getModel("actualsVsPlannedView").setProperty("/actualsVsPlannedData", oResponse.results);
								},error: function(oError){
									debugger;
								},
							});
						}.bind(this)
					);
            },
			onBeforeActualsVsPlannedRebindTable: function(oEvent){
				const sOrderNo = this._sOrderNo;
				const mBindingParams = oEvent.getParameter("bindingParams");
				let oFilter = new Filter("Aufnr", FilterOperator.EQ, sOrderNo);
				mBindingParams.filters.push(oFilter);
				const oSmartTable = this.byId("ActualsVsPlannedAnalysisTable");
				oSmartTable.getTable().rerender();
			},
			
			
    });
    });