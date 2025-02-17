def execute(filters=None):
    if filters.get('from_date') and filters.get('to_date'):
        # Define columns
        columns = [
            {"label": "Appointment No", "fieldname": "appointment_no", "fieldtype": "Data", "width": 120},
            {"label": "Patient ID", "fieldname": "patient_id", "fieldtype": "Data", "width": 120},
            {"label": "Patient Name", "fieldname": "patient_name", "fieldtype": "Data", "width": 200},
            {"label": "Doctor Name", "fieldname": "doctor_id", "fieldtype": "Data", "width": 200},
            {"label": "Phone", "fieldname": "phone", "fieldtype": "Data", "width": 120},
            {"label": "Visit Date", "fieldname": "visit_date", "fieldtype": "Date", "width": 120},
            {"label": "Diagnosis", "fieldname": "diagnosis", "fieldtype": "Data", "width": 250},
            {"label": "Prescription", "fieldname": "prescription", "fieldtype": "Data", "width": 250},
            {"label": "Medical Examination Findings", "fieldname": "medical_examination_findings", "fieldtype": "Data", "width": 300},
            {"label": "Presenting Complaints", "fieldname": "presenting_complaints", "fieldtype": "Data", "width": 300},
            {"label": "Duration", "fieldname": "duration", "fieldtype": "Data", "width": 150},
            {"label": "Advice", "fieldname": "advice", "fieldtype": "Data", "width": 250},
            {"label": "Lab Tests", "fieldname": "lab_tests", "fieldtype": "Data", "width": 200},
            {"label": "Amount Paid", "fieldname": "payment", "fieldtype": "Currency", "width": 200},
            {"label": "Discounted", "fieldname": "discount", "fieldtype": "Currency", "width": 200},
            {"label": "Remaining Total", "fieldname": "remaining_total", "fieldtype": "Currency", "width": 200},
        ]

        # Base SQL query
        base_query = """
            SELECT 
                cp.appointment_no AS appointment_no,
                cp.patient_id AS patient_id,
                cp.patient_name AS patient_name,
                cp.doctor_name AS doctor_id,
                cp.phone AS phone,
                pr.visit_date AS visit_date,
                pr.diagnosis AS diagnosis,
                pr.prescription AS prescription,
                pr.medical_examination_findings AS medical_examination_findings,
                pr.presenting_complaints AS presenting_complaints,
                pr.duration AS duration,
                pr.advice AS advice,
                lt.lab_tests AS lab_tests,
                cp.payment AS payment,
                cp.discount AS discount,
                cp.remaining_total AS remaining_total
            FROM 
                `tabCheck Patient` cp
            LEFT JOIN 
                `tabPatient Report` pr ON pr.parent = cp.name
            LEFT JOIN 
                `tabLab Tests` lt ON lt.parent = cp.name
            WHERE 
                cp.docstatus IN (0, 1)
                AND pr.visit_date BETWEEN %s AND %s
        """

        # Prepare conditions and values
        conditions = ""
        values = [filters.get('from_date'), filters.get('to_date')]

        # Add filter for Appointment No if provided
        if filters.get('appointment_no'):
            conditions += " AND cp.appointment_no = %s"
            values.append(filters.get('appointment_no'))

        # Add filter for Patient ID if provided
        if filters.get('patient_id'):
            conditions += " AND cp.patient_id = %s"
            values.append(filters.get('patient_id'))

        # Complete query with conditions
        query = base_query + conditions + " ORDER BY pr.visit_date, cp.appointment_no"

        # Execute the query
        raw_data = frappe.db.sql(query, values, as_dict=True)

        # Return data
        return columns, raw_data
    else:
        return [], []
