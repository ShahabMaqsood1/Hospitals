// Copyright (c) 2024, Shahab Maqsood and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Additional Payments", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Additional Payments', {
    refresh: function(frm) {
        // Initially hide the specific fields for each option
        frm.toggle_display('patient_id', false);  // Hide patient_id by default (Short Stay only)
        frm.toggle_display('reason', false);      // Hide reason by default (Others only)

        // Show the common fields that appear for both options
        frm.toggle_display('patient_name', true);
        frm.toggle_display('age', true);
        frm.toggle_display('date', true);
        frm.toggle_display('payment_amount', true);

        // Show or hide fields based on Payment selection
        if (frm.doc.payment === "Short Stay") {
            // Show patient_id when Short Stay is selected
            frm.toggle_display('patient_id', true);
        } else if (frm.doc.payment === "Others") {
            // Show reason when Others is selected
            frm.toggle_display('reason', true);
        }
    },

    // Trigger this when the Payment field is changed
    payment: function(frm) {
        // Show or hide fields based on Payment selection
        if (frm.doc.payment === "Short Stay") {
            frm.toggle_display('patient_id', true);  // Show patient_id
            frm.toggle_display('reason', false);     // Hide reason
        } else if (frm.doc.payment === "Others") {
            frm.toggle_display('reason', true);      // Show reason
            frm.toggle_display('patient_id', false); // Hide patient_id
        }
    }
});
