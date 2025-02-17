import frappe
from frappe.model.document import Document

class PharmacyBills(Document):
    def before_submit(self):
        if self.bill_status != "Paid":
            frappe.throw("Bill must be paid before submitting.")

        for item in self.items:
            # Ensure item details are present
            if not item.item_name or not item.quantity or not item.purchase_price or not item.selling_price:
                frappe.throw(f"Item Name, Quantity, Purchase Price, and Selling Price are mandatory for all items.")

            # Fetch the Pharmacy Inventory record
            inventory = frappe.get_doc("Pharmacy Inventory", {"medicine_name": item.item_name})

            if not inventory:
                frappe.throw(f"Inventory record not found for {item.item_name}.")

            # Update the stock quantity
            inventory.stock_quantity += item.quantity

            # Update purchase and selling prices
            inventory.purchase_price = item.purchase_price
            inventory.selling_price = item.selling_price

            # Save the changes
            inventory.save()
