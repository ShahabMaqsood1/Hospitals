import frappe
def execute(filters=None):
    if filters.get('from_date') and filters.get('to_date'):
        # Define columns
        columns = [
            {"label": "Supplier Name", "fieldname": "supplier_name", "fieldtype": "Data", "width": 200},
            {"label": "Item Name", "fieldname": "item_name", "fieldtype": "Data", "width": 200},
            {"label": "Quantity", "fieldname": "quantity", "fieldtype": "Int", "width": 100},
            {"label": "Purchase Price", "fieldname": "purchase_price", "fieldtype": "Currency", "width": 120},
            {"label": "Selling Price", "fieldname": "selling_price", "fieldtype": "Currency", "width": 120},
            {"label": "Amount", "fieldname": "amount", "fieldtype": "Currency", "width": 120},
            {"label": "Total Amount", "fieldname": "total_amount", "fieldtype": "Currency", "width": 120},
            {"label": "Bill Date", "fieldname": "bill_date", "fieldtype": "Date", "width": 120},
        ]

        # Base SQL query
        base_query = """
            SELECT  
                pb.supplier_name AS supplier_name,
                pbi.item_name AS item_name,
                pbi.quantity AS quantity,
                pbi.purchase_price AS purchase_price,
                pbi.selling_price AS selling_price,
                pbi.amount AS amount,
                pb.total_amount AS total_amount,
                pb.bill_date AS bill_date
            FROM 
                `tabPharmacy Bills` pb
            LEFT JOIN 
                `tabPharmacy Bill Item` pbi ON pbi.parent = pb.name
            WHERE 
                pb.docstatus IN (0, 1)
                AND pb.bill_date BETWEEN %s AND %s
        """
        
        # Prepare conditions and values
        conditions = ""
        values = [filters.get('from_date'), filters.get('to_date')]

        # Complete query
        query = base_query + conditions + " ORDER BY pb.bill_date, pb.supplier_name"

        # Execute the query
        raw_data = frappe.db.sql(query, values, as_dict=True)

        # Return data
        return columns, raw_data
    else:
        return [], []
