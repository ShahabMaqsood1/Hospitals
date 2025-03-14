// Copyright (c) 2025, Shahab Maqsood and contributors
// For license information, please see license.txt

frappe.query_reports["Patient Appointment"] = {
	"filters": [
		{
            "fieldname": "from_date",
            "label": __("From Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.add_days(frappe.datetime.get_today(), -7),
            "reqd": 1
        },
        {
            "fieldname": "to_date",
            "label": __("To Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.get_today(),
            "reqd": 1
        },
        {
            "fieldname": "patient_id",
            "label": __("Medical Record Number (MR)"),
            "fieldtype": "Data",
            "reqd": 0
        },
        {
            "fieldname": "doctor_id",
            "label": __("Doctor ID"),
            "fieldtype": "Data",
            "reqd": 0
        }
	]
};
