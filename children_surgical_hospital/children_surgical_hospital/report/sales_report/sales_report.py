import frappe

def execute(filters=None):
    if filters.get('from_date') and filters.get('to_date'):
        # Define columns
        columns = [
            {"label": "Customer Name", "fieldname": "customer_name", "fieldtype": "Data", "width": 200},
            {"label": "Medicine", "fieldname": "medicine", "fieldtype": "Data", "width": 200},
            {"label": "Quantity", "fieldname": "quantity", "fieldtype": "Int", "width": 100},
            {"label": "Price", "fieldname": "price", "fieldtype": "Currency", "width": 120},
            {"label": "Amount", "fieldname": "amount", "fieldtype": "Currency", "width": 120},
            {"label": "Discount", "fieldname": "discount", "fieldtype": "Currency", "width": 120},
            {"label": "Subtotal", "fieldname": "subtotal", "fieldtype": "Currency", "width": 120},
            {"label": "Total Amount", "fieldname": "total_amount", "fieldtype": "Currency", "width": 120},
            {"label": "Date of Sale", "fieldname": "date_of_sale", "fieldtype": "Date", "width": 120},
        ]

        # Base SQL query
        base_query = """
            SELECT  
                ps.customer_name AS customer_name,
                psi.medicine AS medicine,
                psi.quantity AS quantity,
                psi.price AS price,
                psi.amount AS amount,
                ps.discount AS discount,
                ps.subtotal AS subtotal,
                ps.total_amount AS total_amount,
                ps.date_of_sale AS date_of_sale
            FROM 
                `tabPharmacy Sales` ps
            LEFT JOIN 
                `tabPharmacy Sales Items` psi ON psi.parent = ps.name
            WHERE 
                ps.docstatus IN (0, 1)
                AND ps.date_of_sale BETWEEN %s AND %s
        """

        # Prepare conditions and values
        conditions = ""
        values = [filters.get('from_date'), filters.get('to_date')]

        # Add filter for Customer Name if provided
        if filters.get('customer_name'):
            conditions += " AND ps.customer_name = %s"
            values.append(filters.get('customer_name'))

        # Add filter for Medicine if provided
        if filters.get('medicine'):
            conditions += " AND psi.medicine = %s"
            values.append(filters.get('medicine'))

        # Complete query with conditions
        query = base_query + conditions + " ORDER BY ps.date_of_sale, ps.customer_name"

        # Execute the query
        raw_data = frappe.db.sql(query, values, as_dict=True)

        # Return data
        return columns, raw_data
    else:
        return [], []
