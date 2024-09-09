sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
     "sap/m/MessageBox"
], function (Controller, UIComponent, MessageToast,MessageBox) {
    "use strict";

    return Controller.extend("sap.com.managepurchaseorder.controller.ListPage", {
        onInit: function () {
            // Initialize the model and set it to the view with a named model
            var oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel, "purchaseModel");
        },

        onCreate: function () {
          
            
            // var sSupplier = oEvent.getSource().getBindingContext().getObject().Supplier; // Assuming the event source is bound to Supplier
            // var sPurchaseOrder = oEvent.getSource().getBindingContext().getProperty("PurchaseOrder");
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("DetailView", {
                var1: "Create",
           
            });
          
        },
        onRowPress:function(oEvent){
            
           
            var oSelectedItem = oEvent.getParameter("listItem");
            var sUUID = oSelectedItem.getBindingContext().getProperty().ID;
            this.sId = sUUID;
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("DetailDisplayView", {
                var1: sUUID
               
           
            });

        },
        onDelete: function () {
           
            var tId = this.sId;
            var oModel = this.getView().getModel("purchaseModel");
            var sObjectPath = oModel.createKey("/PurchaseOrderT", {
                ID: tId,

            });
            // Check if an item is selected
            if (!tId) {
                MessageBox.error("Please select a Purchase Order to delete.");
                return;
            }

            // Confirm delete operation
            MessageBox.confirm("Are you sure you want to delete the selected Purchase Order?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        var oModel = this.getView().getModel("purchaseModel");
                        oModel.remove(sObjectPath, {
                            success: function () {
                                MessageBox.success("Purchase Order deleted successfully.");
                                // Optionally, you may refresh the table or update the model
                            },
                            error: function (oError) {
                                console.error("Failed to delete Purchase Order", oError);
                                MessageBox.error("Failed to delete Purchase Order: " + oError.message);
                            }
                        });
                    }
                }.bind(this)  // Bind 'this' to the controller context
            });
        },

    });
});
