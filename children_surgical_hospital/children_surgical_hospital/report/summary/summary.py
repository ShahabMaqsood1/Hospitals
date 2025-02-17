import frappe

def execute(filters=None):
    if not filters.get('from_date') or not filters.get('to_date'):
        frappe.throw("Please select both From Date and To Date")

    # Define columns
    columns = [
        {"label": "Category", "fieldname": "category", "fieldtype": "Data", "width": 200},
        {"label": "Total Amount", "fieldname": "total_amount", "fieldtype": "Currency", "width": 150},
        {"label": "Transaction Count", "fieldname": "transaction_count", "fieldtype": "Int", "width": 150}
    ]

    # Initialize data list
    data = []

    # 1. Patient Appointments Summary
    appointment_query = """
        SELECT 
            IFNULL(SUM(remaining_total), 0) as total_amount,
            COUNT(*) as transaction_count
        FROM 
            `tabPatient Appointment`
        WHERE 
            appointment_date BETWEEN %(from_date)s AND %(to_date)s
    """
    appointment_data = frappe.db.sql(appointment_query, filters, as_dict=1)[0]

    data.append({
        "category": "Patient Appointments",
        "total_amount": appointment_data.total_amount,
        "transaction_count": appointment_data.transaction_count
    })

    # 2. New Admissions Summary
    admission_query = """
        SELECT 
            IFNULL(SUM(child.payment_amount), 0) as total_amount,
            COUNT(DISTINCT parent.name) as transaction_count
        FROM 
            `tabNew Admission` parent
            LEFT JOIN `tabAdmission Payments` child ON parent.name = child.parent
        WHERE 
            parent.creation BETWEEN %(from_date)s AND %(to_date)s
    """
    admission_data = frappe.db.sql(admission_query, filters, as_dict=1)[0]

    data.append({
        "category": "New Admissions",
        "total_amount": admission_data.total_amount,
        "transaction_count": admission_data.transaction_count
    })

    # 3. Additional Payments Summary
    additional_payments_query = """
        SELECT 
            IFNULL(SUM(payment_amount), 0) as total_amount,
            COUNT(*) as transaction_count
        FROM 
            `tabAdditional Payments`
        WHERE 
            creation BETWEEN %(from_date)s AND %(to_date)s
    """
    additional_payments_data = frappe.db.sql(additional_payments_query, filters, as_dict=1)[0]

    data.append({
        "category": "Additional Payments",
        "total_amount": additional_payments_data.total_amount,
        "transaction_count": additional_payments_data.transaction_count
    })

    # 4. Expenses Summary
    expenses_query = """
        SELECT 
            IFNULL(SUM(payment_amount), 0) as total_amount,
            COUNT(*) as transaction_count
        FROM 
            `tabExpenses`
        WHERE 
            creation BETWEEN %(from_date)s AND %(to_date)s
    """
    expenses_data = frappe.db.sql(expenses_query, filters, as_dict=1)[0]

    data.append({
        "category": "Expenses",
        "total_amount": expenses_data.total_amount,
        "transaction_count": expenses_data.transaction_count
    })

    # 5. Calculate Totals
    total_income = (
        float(appointment_data.total_amount) + 
        float(admission_data.total_amount) + 
        float(additional_payments_data.total_amount)
    )
    total_expense = float(expenses_data.total_amount)
    net_amount = total_income - total_expense

    # Add summary rows
    data.append({
        "category": "Total Income",
        "total_amount": total_income,
        "transaction_count": None
    })
    data.append({
        "category": "Total Expenses",
        "total_amount": total_expense,
        "transaction_count": None
    })
    data.append({
        "category": "Net Amount",
        "total_amount": net_amount,
        "transaction_count": None
    })

    return columns, data
