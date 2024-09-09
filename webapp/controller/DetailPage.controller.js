sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (Controller, UIComponent, JSONModel, MessageToast, Filter, FilterOperator) {
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
                this.getView().setModel(oModel, "PurchaseItemModel");

                var oRouter = UIComponent.getRouterFor(this);
                oRouter.getRoute("DetailView").attachPatternMatched(this._onRouteMatched, this);
                oRouter.getRoute("DetailDisplayView").attachPatternMatched(this._onRouteMatchedFunction, this);


            },
            _onRouteMatched: function (oEvent) {
                
                var loginModel = this.getOwnerComponent().getModel("loginModel");
                
                this.emailid = loginModel.getData().emailid;
                var oArgs = oEvent.getParameter("arguments");
                var sCreate = oArgs.var1;
                if(sCreate === "Create"){
                var PurchaseItemModel = this.getView().getModel("PurchaseItemModel");
                PurchaseItemModel.setData({ items: [] });
                }
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
                            DeliveryDate: "",
                            Status: "Draft"

                        }
                    });

                    that.getView().bindElement({
                        path: oModelContext.sPath
                    })

                })

              
                // this.getView().byId("idSupplierName").setValue(emailid);



            },
            _onRouteMatchedFunction: async function (oEvent) {
              

                var oArgs = oEvent.getParameter("arguments");
                var sUUID = oArgs.var1;
                this.sId = sUUID;
                
                let results = await this.getPurchaseOrderById(sUUID);
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

                let sPurchaseOrder = results[0].PurchaseOrder;
                let sSupplierName = results[0].SupplierName;
                let sSupplier = results[0].Supplier;
                let sGrossAmountInTransacCurrency = results[0].GrossAmountInTransacCurrency;
               
                let sDeliveryDate = results[0].DeliveryDate;
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
                            DeliveryDate: sDeliveryDate,
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
            getPurchaseOrderById: function (sUUID) {

                var oDataModelService = this.getOwnerComponent().getModel();
                var oFilter = new Filter("ID", FilterOperator.EQ, sUUID);
                return new Promise(function (resolve, reject) {
                    oDataModelService.read("/PurchaseOrderT", {
                        filters: [oFilter],
                        urlParameters: {
                            "$expand": "Items"
                        },
                        success: function (response) {
                            resolve(response.results);
                            // MessageToast.show("Purchase order Read successfully");
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
                debugger;
                var oInputDate = new Date(this.getView().byId("idDeliveryDate").getValue());
                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
                var sDeliveryDateISO = oDateFormat.format(oInputDate);
                var sGrossAmount = this.getView().byId("idGrossAmountInTransacCurrency").getValue();

                sGrossAmount = sGrossAmount.replace(/,/g, '');
                var oHeaderData = {
                    PurchaseOrder: this.getView().byId("idPurchaseOrder").getValue(),
                    SupplierName: this.getView().byId("idSupplierName").getValue(),
                    Supplier: this.getView().byId("idSupplier").getValue(),
                    GrossAmountInTransacCurrency: sGrossAmount,
                    DeliveryDate: sDeliveryDateISO,
                    Status: this.getView().byId("idStatus").getValue(),
                    Items: []
                };
                oHeaderData.SupplierName = this.getView().byId("idSupplierName").getValue();
                
                // Retrieve table data (line items data)
                var oTableData = this.getView().getModel("PurchaseItemModel").getData();


                oHeaderData.Items = oTableData.items;
                oHeaderData.Items.forEach(function(Items) {
                    if (Items.TotalAmount === "") {
                        Items.TotalAmount = "4000";
                    }
                });
               


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


            calculateTotalAmount: function(UnitPrice, Quantity) {
                debugger;
                var oTable = this.byId("itemsTable"),
                        aItems = oTable.getItems(),
                        totalGrossAmount = 0;
                            // Loop through each row of the table
                aItems.forEach(function(oItem) {
                    var oContext = oItem.getBindingContext("PurchaseItemModel"),
                        unitPrice = oContext.getProperty("UnitPrice"),
                        quantity = oContext.getProperty("Quantity"),
                        totalAmount = unitPrice*quantity
            
                    totalGrossAmount += totalAmount;
                }.bind(this));
            
                // Update the GrossAmountInTransacCurrency field with the calculated total
                this.byId("idGrossAmountInTransacCurrency").setValue(totalGrossAmount.toFixed(2));
                


                // Calculate the total amount
                var fTotalAmount = UnitPrice * Quantity;
               
                // this.byId("idGrossAmountInTransacCurrency").setValue(fTotalAmount.toFixed(2));
                // Return the formatted value
                return fTotalAmount.toFixed(2); // returns a string with two decimal places

                
               
            },
            

            onCancel: function () {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteView1", {}, true);
            },
            onSubmit: function () {
                debugger;
                var oModel = this.getOwnerComponent().getModel();
                var tId = this.sId;
                var oPayload = {
                    ID: tId
                };
                oModel.create("/onSubmit", oPayload, {
                    success: function (oData, response) {
                        // Handle success
                        if (oData && oData.value) {
                            MessageToast.show(oData.value); // Show success message
                        } else {
                            MessageToast.show("Submit successful, but no message returned.");
                        }
                    },
                    error: function (oError) {
                        // Handle error
                        var errorMsg = oError.message || "An unknown error occurred.";
                        MessageBox.error("Error: " + errorMsg);
                    }
                });
            },
            onSave: function () {
                debugger;
                var oInputDate = new Date(this.getView().byId("idDeliveryDate").getValue());

                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
                var sDeliveryDateISO = oDateFormat.format(oInputDate);
                var sGrossAmount = this.getView().byId("idGrossAmountInTransacCurrency").getValue();

                sGrossAmount = sGrossAmount.replace(/,/g, '');
                var oHeaderData = {
                    PurchaseOrder: this.getView().byId("idPurchaseOrder").getValue(),
                    SupplierName: this.getView().byId("idSupplierName").getValue(),
                    Supplier: this.getView().byId("idSupplier").getValue(),
                    GrossAmountInTransacCurrency: sGrossAmount,
                    DeliveryDate: sDeliveryDateISO,
                    Status: this.getView().byId("idStatus").getValue(),
                    Items: []
                };

                // Retrieve table data (line items data)
                var oTableData = this.getView().getModel("PurchaseItemModel").getData();
                oTableData.items = oTableData.items.map(function(item){
                    var newObject = {
                        "ItemNumber": item.ItemNumber,
                        "productName": item.productName,
                        "ProductDesc": item.ProductDesc,
                        "UnitPrice": item.UnitPrice,
                        "Quantity" : item.Quantity,
                        "UOM": item.UOM,
                        "TotalAmount": item.TotalAmount,
                        "Plant": item.Plant,
                        "StorageUnit": item.StorageUnit
                    }
                      return newObject;
                })

                oHeaderData.Items = oTableData.items;



                // Log the payload (for debugging purposes)
                console.log("Payload for submission:", oHeaderData);

                // Get the OData model to communicate with the backend
                var oODataModel = this.getView().getModel();
                var tId = this.sId; // Assuming OData model is named "myODataModel"
                var sObjectPath = oODataModel.createKey("/PurchaseOrderT", {
                    ID: tId,

                });


                // Send the data to the backend via OData create method
                oODataModel.update(sObjectPath, oHeaderData, {
                    success: function () {
                        MessageToast.show("Purchase order update successfully");
                    },
                    error: function (oError) {
                        MessageToast.show("Error Updating purchase order");
                        console.error("Error details:", oError);
                    }
                });

            },
            onComboBoxSelectionChange: function (oEvent) {
             
                var oSelectedItem = oEvent.getParameter("selectedItem");
                
                // Check if an item is actually selected
                if (oSelectedItem) {
                    var sSelectedKey = oSelectedItem.getKey();  // Get the key of the selected item
                    var sSelectedText = oSelectedItem.getAdditionalText();  // Get the additional text (Product Category)
                    
                    // Get table data
                    var tableData = oEvent.getSource().getModel("PurchaseItemModel").getData().items;
                    
                    for (let i = 0; i < tableData.length; i++) {
                        if (sSelectedKey === tableData[i].productName) {
                            tableData[i].ProductDesc = sSelectedText;  // Set Product Description to the selected item's additional text
                        }
                    }
            
                    // Refresh the model to update the UI
                    oEvent.getSource().getModel("PurchaseItemModel").refresh();
                } else {
                    console.error("No item selected from the combobox.");
                }
            },
            onChangePO:function(oEvent){
debugger;//idPurchaseOrder-input-valueHelpDialog
var oSelectedData = JSON.parse(this.getView().byId("idPurchaseOrder-input-valueHelpDialog").getTable().getBinding().aLastContextData[0]);
debugger;
var sSupplier = oSelectedData.Supplier;
  var sSupplierName = oSelectedData.SupplierName;
this.getView().byId("idSupplier").setValue(sSupplier);
    this.getView().byId("idSupplierName").setValue(sSupplierName);




            }
            


        });
    });
