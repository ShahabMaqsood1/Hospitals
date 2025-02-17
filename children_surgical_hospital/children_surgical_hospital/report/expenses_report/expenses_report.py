import frappe

def execute(filters=None):
    if filters.get('from_date') and filters.get('to_date'):
        # Define columns
        columns = [
            {"label": "Name", "fieldname": "name1", "fieldtype": "Data", "width": 150},
            {"label": "Reason for Payment", "fieldname": "reason_for_payment", "fieldtype": "Data", "width": 200},
            {"label": "Payment Amount", "fieldname": "payment_amount", "fieldtype": "Currency", "width": 150},
            {"label": "Date", "fieldname": "date", "fieldtype": "Date", "width": 120},
            {"label": "Time", "fieldname": "time", "fieldtype": "Time", "width": 120},
            {"label": "Receptionist", "fieldname": "receptionist", "fieldtype": "Data", "width": 150}
        ]

        # Base SQL query
        base_query = """
            SELECT 
                ex.name1 AS name1,
                ex.reason_for_payment AS reason_for_payment,
                ex.payment_amount AS payment_amount,
                ex.date AS date,
                ex.time AS time,
                ex.receptionist AS receptionist
            FROM 
                `tabExpenses` ex
            WHERE 
                ex.docstatus IN (0, 1)
                AND ex.date BETWEEN %s AND %s
        """

        # Prepare conditions and values
        conditions = ""
        values = [filters.get('from_date'), filters.get('to_date')]

        # Add filter for Name if provided
        if filters.get('name1'):
            conditions += " AND ex.name1 = %s"
            values.append(filters.get('name1'))

        # Complete query with conditions
        query = base_query + conditions + " ORDER BY ex.date, ex.time"

        # Execute the query
        raw_data = frappe.db.sql(query, values, as_dict=True)

        # Return data
        return columns, raw_data
    else:
        return [], []
