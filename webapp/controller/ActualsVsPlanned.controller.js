sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("cis.effortsanalysis.controller.ActualsVsPlanned", {
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
    });
    });