// Copyright (c) 2024, Shahab Maqsood and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Patient Appointment", {
// 	refresh(frm) {

// 	},
// });

frappe.views.calendar["Patient Appointment"] = {
	field_map: {
		"start": "appointment_date",
		"end": "appointment_date",
		"id": "name",
		"title": "patient_name",
		"payment": "payment",
		"allDay": "allDay",
		"progress": "progress"
	}
};
frappe.ui.form.on('Patient Appointment', {
    setup: function(frm) {
        // Prevent dropdown list from showing all patient IDs
        frm.set_query("patient_id", function() {
            return {
                filters: { name: ["=", ""] }  // This prevents showing all records
            };
        });
    },

    patient_id: function(frm) {
        if (!frm.doc.patient_id) return;  // Exit if no ID is entered

        frappe.call({
            method: 'frappe.client.get',
            args: {
                doctype: 'Patient Record',  // Ensure this matches the actual Doctype name
                name: frm.doc.patient_id
            },
            callback: function(r) {
                if (r.message) {
                    // Existing patient: Refresh field to fetch details
                    frm.refresh_field("patient_id");
                }
            },
            error: function(err) {
                console.error("Error fetching patient:", err);
            }
        });
    }
});
frappe.listview_settings['Patient Appointment'] = {
    onload: function(listview) {
        if (frappe.session.user !== 'Administrator') {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "User",
                    name: frappe.session.user
                },
                callback: function(response) {
                    const user = response.message;
                    if (user && user.doctor) {
                        // Apply filter for the doctor's appointments
                        listview.filter_area.add([
                            ["Patient Appointment", "doctor", "=", user.doctor]
                        ]);
                        listview.refresh();
                    }
                }
            });
        }
    }
};
frappe.ui.form.on('Patient Appointment', {
    payment: function(frm) {
        update_remaining_total(frm);
    },

    discount: function(frm) {
        update_remaining_total(frm);
    }
});

function update_remaining_total(frm) {
    let payment = parseFloat(frm.doc.payment) || 0;
    let discount = parseFloat(frm.doc.discount) || 0;

    // If remaining_total is not set by Check Patient, set it to (payment - discount)
    if (!frm.doc.remaining_total) {
        frm.set_value('remaining_total', payment - discount);
    }
}
