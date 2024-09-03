sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",           
    "sap/ui/model/FilterOperator"
],
    function (Controller, UIComponent, JSONModel, MessageToast,Filter,FilterOperator) {
        "use strict";

        return Controller.extend("sap.com.managepurchaseorder.controller.DetailPage", {
            onInit: function () {
                // Initial data model with an empty array of items
                var oData = {
                    items: [
                        // Example of initial data (can be empty if you want to start with no items)
                      
                    ]
                };

                // Create a JSON model and set it to the view
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel,"PurchaseItemModel");

                var oRouter = UIComponent.getRouterFor(this);
                oRouter.getRoute("DetailView").attachPatternMatched(this._onRouteMatched, this);
                oRouter.getRoute("DetailDisplayView").attachPatternMatched(this._onRouteMatchedFunction, this);

                
            },
            _onRouteMatched: function () {
                this.getView().byId("idSave").setVisible(false);
                this.getView().byId("idCreate").setVisible(true);
                var oModel = this.getOwnerComponent().getModel();
                var that = this;
                oModel.metadataLoaded().then(function () {
                    var oModelContext = oModel.createEntry("PurchaseOrderT", {
                        properties: {
                            PurchaseOrder: "",
                            SupplierName: "",
                            Supplier: "",
                            GrossAmountInTransacCurrency: 0.00,
                            Status: "Draft"

                        }
                    });

                    that.getView().bindElement({
                        path: oModelContext.sPath
                    })

                })

               

        

            },
            _onRouteMatchedFunction: async function(oEvent){
                debugger;
               
                var oArgs = oEvent.getParameter("arguments");
                var sUUID = oArgs.var1;
                let results = await this.getPurchaseOrderById(sUUID);
                debugger;
                let aTableRecords = results[0].Items.results;
                aTableRecords.forEach(function (item) {
                    if (item.Quantity) {
                        item.Quantity = parseFloat(item.Quantity); 
                    }
                    if (item.TotalAmount) {
                        item.TotalAmount = parseFloat(item.TotalAmount); 
                    }
                    if (item.UnitPrice) {
                        item.UnitPrice = parseFloat(item.UnitPrice); 
                    }
                });
                // this.quantity = aTableRecords[0].Quantity;
                var PurchaseItemModel = this.getView().getModel("PurchaseItemModel");
                var oData = PurchaseItemModel.getData();
                oData.items = aTableRecords;
                PurchaseItemModel.setData(oData);
                debugger;
                let sPurchaseOrder = results[0].PurchaseOrder;
                let sSupplierName = results[0].SupplierName;
                let sSupplier = results[0].Supplier;
                let sGrossAmountInTransacCurrency = results[0].GrossAmountInTransacCurrency;
                let sStatus = results[0].Status;
                var oModel = this.getOwnerComponent().getModel();
                var that = this;
                oModel.metadataLoaded().then(function () {
                    var oModelContext = oModel.createEntry("PurchaseOrderT", {
                        properties: {
                            PurchaseOrder: sPurchaseOrder,
                            SupplierName: sSupplierName,
                            Supplier: sSupplier,
                            GrossAmountInTransacCurrency: sGrossAmountInTransacCurrency,
                            Status: sStatus

                        }
                    });

                    that.getView().bindElement({
                        path: oModelContext.sPath
                    })
                })

                this.getView().byId("idCreate").setVisible(false);
                this.getView().byId("idSave").setVisible(true);
               
            },
            getPurchaseOrderById:function(sUUID){
             
                var oDataModelService = this.getOwnerComponent().getModel();
                var oFilter = new Filter("ID", FilterOperator.EQ, sUUID);
                return new Promise (function(resolve,reject){
                  oDataModelService.read("/PurchaseOrderT",{
                    filters:[oFilter],
                    urlParameters: {
                        "$expand": "Items" 
                    },
                    success: function (response) {
                        resolve(response.results);
                        MessageToast.show("Purchase order Read successfully");
                    },
                    error: function (oError) {
                        reject(oError);
                        MessageToast.show("Error submitting purchase order");
                        console.error("Error details:", oError);
                    }
                    
                  })
                })

            },
            onAddItem: function () {
                debugger;
                // Get the current model and its data
                var oModel = this.getView().getModel("PurchaseItemModel");
                var oData = oModel.getData();

                // Add a new blank item to the items array
                oData.items.push({
                    ItemNumber: "",
                    productName: "",
                    ProductDesc: "",
                    UnitPrice: "",
                    Quantity: "",
                    UOM: "",
                    TotalAmount: "",
                    Plant: "",
                    StorageUnit: ""
                });

                // Update the model with the new data
                oModel.setData(oData);
                MessageToast.show("New item added");
            },

            onDelete: function () {
                // Get the current model and its data
                var oModel = this.getView().getModel("PurchaseItemModel");
                var oData = oModel.getData();
                var oTable = this.getView().byId("itemsTable");

                // Get the selected items from the table
                var aSelectedItems = oTable.getSelectedItems();

                if (aSelectedItems.length > 0) {
                    // Remove selected items from the model's data
                    for (var i = 0; i < aSelectedItems.length; i++) {
                        var oItem = aSelectedItems[i];
                        var iIndex = oTable.indexOfItem(oItem);
                        oData.items.splice(iIndex, 1);
                    }

                    // Update the model with the new data
                    oModel.setData(oData);
                    MessageToast.show("Selected item(s) deleted");
                } else {
                    MessageToast.show("Please select an item to delete");
                }
            },
            onCreate: function () {
                // Retrieve data from SmartForm fields (header data)
                var oHeaderData = {
                    PurchaseOrder: this.getView().byId("idPurchaseOrder").getValue(),
                    SupplierName: this.getView().byId("idSupplierName").getValue(),
                    Supplier: this.getView().byId("idSupplier").getValue(),
                    GrossAmountInTransacCurrency: this.getView().byId("idGrossAmountInTransacCurrency").getValue(),
                    Status: this.getView().byId("idStatus").getValue(),
                    Items:[]
                };

                // Retrieve table data (line items data)
                var oTableData = this.getView().getModel("PurchaseItemModel").getData();

                oHeaderData.Items = oTableData.items;


                // Log the payload (for debugging purposes)
                console.log("Payload for submission:", oHeaderData);

                // Get the OData model to communicate with the backend
                var oODataModel = this.getView().getModel(); // Assuming OData model is named "myODataModel"

                // Send the data to the backend via OData create method
                oODataModel.create("/PurchaseOrderT", oHeaderData, {
                    success: function () {
                        MessageToast.show("Purchase order submitted successfully");
                    },
                    error: function (oError) {
                        MessageToast.show("Error submitting purchase order");
                        console.error("Error details:", oError);
                    }
                });
            },
           
        });
    });
