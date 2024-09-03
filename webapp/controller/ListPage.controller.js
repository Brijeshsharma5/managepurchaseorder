sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast"
], function (Controller, UIComponent, MessageToast) {
    "use strict";

    return Controller.extend("sap.com.managepurchaseorder.controller.ListPage", {
        onInit: function () {
            // Initialize the model and set it to the view with a named model
            var oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel, "purchaseModel");
        },

        onCreate: function () {
            debugger;
            
            // var sSupplier = oEvent.getSource().getBindingContext().getObject().Supplier; // Assuming the event source is bound to Supplier
            // var sPurchaseOrder = oEvent.getSource().getBindingContext().getProperty("PurchaseOrder");
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("DetailView", {
                var1: "Create",
           
            });
          
        },
        onRowPress:function(oEvent){
            
            debugger;
            var oSelectedItem = oEvent.getParameter("listItem");
            var sUUID = oSelectedItem.getBindingContext().getProperty().ID;
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("DetailDisplayView", {
                var1: sUUID
               
           
            });

        }
    });
});
