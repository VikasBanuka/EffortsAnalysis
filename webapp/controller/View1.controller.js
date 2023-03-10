sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("cis.effortsanalysis.controller.View1", {
            onInit: function () {

            },
            dataReceived: function(oEvent){
                let sCount = oEvent.getParameter("data").results.length;
                this.getView().byId("idOrdersText").setText(`Orders (${sCount})`);
            },
            showActualsVsPlanned: function(oEvent){
                const oContext = oEvent.getSource().getBindingContext();
                this.getOwnerComponent().getRouter().navTo("actualsVsPlanned", {
                    orderNo: oContext.getProperty("Aufnr")
                });
            },
        });
    });
