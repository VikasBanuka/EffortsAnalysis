sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
    ],
    function(BaseController,JSONModel) {
      "use strict";
  
      return BaseController.extend("cis.effortsanalysis.controller.App", {
        onInit() {
          const oViewModel = new JSONModel({
            busy: false,
            delay: 0,
            todayDate: new Date()
          
          });
          oViewModel.setSizeLimit(1000000);
          this.setModel(oViewModel, "appView");
        }
      });
    }
  );
  