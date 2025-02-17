import frappe
from frappe.model.document import Document

class PharmacySales(Document):
    def before_save(self):
        try:
            # Loop through each item in the sales table
            for item in self.medicine:
                if item.price:
                    # Get the current inventory item
                    inventory_item = frappe.get_doc("Pharmacy Inventory", item.medicine)
                    
                    # Force update the selling price if it's different from the current price
                    if inventory_item.selling_price != item.price:
                        old_price = inventory_item.selling_price  # Store old price
                        inventory_item.selling_price = item.price  # Update price field directly
                        inventory_item.save(ignore_permissions=True)  # Save changes (no commit needed)

                        frappe.msgprint(f"Price for {item.medicine} has been updated from {old_price} to {item.price}")
        except Exception as e:
            frappe.log_error(f"Error updating medicine price: {str(e)}")
            frappe.throw(f"Could not update medicine price: {str(e)}")
