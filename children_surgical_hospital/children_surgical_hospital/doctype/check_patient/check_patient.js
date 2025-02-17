// Copyright (c) 2024, Shahab Maqsood and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Check Patient", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Check Patient', {
    after_save: function(frm) {
        // Log the patient_id to make sure it's correct
        console.log("Patient ID from Check Patient form: " + frm.doc.patient_id);

        // Fetch the Patient Record based on the patient_id
        frappe.db.get_value('Patient Record', { 'name': frm.doc.patient_id }, 'name')
            .then(r => {
                if (r.message && r.message.name) {
                    let patient_record_name = r.message.name;
                    console.log("Patient Record found: " + patient_record_name);

                    // Fetch the Patient Record document
                    frappe.db.get_doc('Patient Record', patient_record_name)
                        .then(patient_record_doc => {
                            console.log("Patient Record document details: ", patient_record_doc);

                            // Loop through the report table in Check Patient
                            frm.doc.report.forEach(report => {
                                // Check if the record already exists in the medical_history table
                                let record_exists = patient_record_doc.medical_history.some(history => 
                                    history.visit_date === report.visit_date && 
                                    history.diagnosis === report.diagnosis && 
                                    history.prescription === report.prescription  && 
                                    history.medical_examination_findings === report.medical_examination_findings && 
                                    history.presenting_complaints === report.presenting_complaints && 
                                    history.duration === report.duration && 
                                    history.advice === report.advice &&
                                    history.quantity === report.quantity &&
                                    history.note === report.note
                                );

                                if (!record_exists) {
                                    // Append data from report table to medical_history table in Patient Record
                                    patient_record_doc.medical_history.push({
                                        "visit_date": report.visit_date,
                                        "diagnosis": report.diagnosis,
                                        "prescription": report.prescription,
                                        "medical_examination_findings": report.medical_examination_findings,
                                        "presenting_complaints": report.presenting_complaints,
                                        "duration": report.duration,
                                        "advice": report.advice,
                                        "Additional Instructions": report.note,
                                        "quantity": report.quantity,
                                        "doctor_id": frm.doc.doctor_name, // Store doctor name
                                        "patient_id": frm.doc.patient_id // Store patient ID
                                    });
                                }
                            });

                            // Loop through the lab_tests table in Check Patient
                            frm.doc.lab_tests.forEach(lab_test => {
                                // Check if the lab test already exists
                                let test_exists = patient_record_doc.lab_tests.some(test => 
                                    test.lab_tests === lab_test.lab_tests
                                );

                                if (!test_exists) {
                                    // Append data from lab_tests table to lab_tests table in Patient Record
                                    patient_record_doc.lab_tests.push({
                                        "lab_tests": lab_test.lab_tests // Store lab test
                                    });
                                }
                            });

                            // Save the updated Patient Record
                            frappe.call({
                                method: "frappe.client.save",
                                args: {
                                    doc: patient_record_doc
                                },
                                callback: function(response) {
                                    frappe.msgprint({
                                        title: _('Success'),
                                        indicator: 'green',
                                        message: __('Patient Record updated successfully.')
                                    });
                                },
                                error: function(error) {
                                    frappe.msgprint({
                                        title: __('Error'),
                                        indicator: 'red',
                                        message: __('Failed to update the Patient Record.')
                                    });
                                }
                            });
                        });
                } else {
                    // If no record found, log it
                    console.log("No Patient Record found for Patient ID: " + frm.doc.patient_id);
                    frappe.msgprint("No Patient Record found for the given Patient ID.");
                }
            });
    }
});

frappe.ui.form.on('Check Patient', {
    setup: function(frm) {
        frm.set_query("appointment_no", function() {
            return {
                filters: {
                    docstatus: 0  // Show only Draft (unsaved/submittable) appointments
                }
            };
        });
    }
});
frappe.ui.form.on('Check Patient', {
    discount: function(frm) {
        if (frm.doc.payment && frm.doc.discount) {
            // Calculate remaining total
            let remaining_total = frm.doc.payment - frm.doc.discount;
            
            // Update remaining_total in Check Patient
            frm.set_value('remaining_total', remaining_total);
            
            // Update Patient Appointment
            if (frm.doc.appointment_no) {
                frappe.call({
                    method: 'frappe.client.get',
                    args: {
                        doctype: 'Patient Appointment',
                        name: frm.doc.appointment_no
                    },
                    callback: function(r) {
                        if (r.message) {
                            let appointment = r.message;
                            
                            // Update discount and remaining_total in Patient Appointment
                            appointment.discount = frm.doc.discount;
                            appointment.remaining_total = remaining_total;
                            
                            // Save the updated Patient Appointment
                            frappe.call({
                                method: 'frappe.client.save',
                                args: { doc: appointment },
                                callback: function(save_res) {
                                    if (save_res.message) {
                                        frappe.show_alert({
                                            message: __('Patient Appointment updated successfully'),
                                            indicator: 'green'
                                        });
                                    }
                                },
                                error: function(err) {
                                    frappe.msgprint(__('Failed to update Patient Appointment'));
                                }
                            });
                        } else {
                            frappe.msgprint(__('Patient Appointment not found'));
                        }
                    },
                    error: function(err) {
                        frappe.msgprint(__('Failed to fetch Patient Appointment'));
                    }
                });
            }
        }
    },
    
    payment: function(frm) {
        // Trigger discount handler to recalculate everything when payment changes
        if (frm.doc.discount) {
            frm.trigger('discount');
        }
    }
});