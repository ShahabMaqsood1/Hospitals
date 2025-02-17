// Copyright (c) 2024, Shahab Maqsood and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Lab Reports", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Lab Reports', {
    check_patient_no: function(frm) {
        // Ensure that the 'check_patient_no' is filled before proceeding
        if (!frm.doc.check_patient_no) {
            frappe.msgprint(('Please select a Check Patient record.'));
            return;
        }

        // Fetch the corresponding 'Check Patient' record using the 'check_patient_no'
        frappe.db.get_value('Check Patient', { 'name': frm.doc.check_patient_no }, 'patient_id')
            .then(result => {
                if (result.message && result.message.patient_id) {
                    let patient_id = result.message.patient_id; // Get the patient_id from Check Patient record

                    // Fetch the 'Patient Record' using the correct field
                    frappe.db.get_value('Patient Record', { 'name': patient_id }, ['name', 'lab_tests'])
                        .then(patient_result => {
                            if (patient_result.message && patient_result.message.name) {
                                // Fetch the full 'Patient Record' document if necessary
                                frappe.db.get_doc('Patient Record', patient_result.message.name)
                                    .then(patient_record_doc => {
                                        if (patient_record_doc && patient_record_doc.lab_tests) {
                                            // Clear the current lab_tests field in Lab Reports before populating it
                                            frm.set_value('lab_tests', []);

                                            // Loop through the lab_tests from the Patient Record and add them to Lab Reports
                                            patient_record_doc.lab_tests.forEach(lab_test => {
                                                frm.add_child('lab_tests', {
                                                    'lab_tests': lab_test.lab_tests // You can add more fields if necessary
                                                });
                                            });

                                            // Refresh the field to display the updated lab_tests table
                                            frm.refresh_field('lab_tests');
                                            frappe.msgprint(('Lab tests data fetched successfully.'));
                                        } else {
                                            frappe.msgprint(('No lab tests found for this patient.'));
                                        }
                                    })
                                    .catch(error => {
                                        console.log('Error fetching Patient Record:', error);
                                        frappe.msgprint(('Failed to fetch the full Patient Record.'));
                                    });
                            } else {
                                frappe.msgprint(('Patient Record not found for the provided patient ID.'));
                            }
                        })
                        .catch(error => {
                            console.log('Error fetching Patient Record:', error);
                            frappe.msgprint(('Failed to fetch Patient Record.'));
                        });
                } else {
                    frappe.msgprint(('No Patient ID found for the selected Check Patient.'));
                }
            })
            .catch(error => {
                console.log('Error fetching Check Patient record:', error);
                frappe.msgprint(('Failed to fetch Check Patient record.'));
            });
    }
});
frappe.ui.form.on('Lab Reports', {
    refresh: function(frm) {
        console.log('Form refreshed, docstatus:', frm.doc.docstatus);  // Debugging

        // Check if the document is submitted
        if (frm.doc.docstatus == 1) {
            console.log('Document is submitted.');

            // Make the entire child table read-only for everyone
            frm.set_df_property('lab_tests', 'read_only', true);
            console.log('Lab test table set to read-only.');

            // Check if the user is not Shahab (admin)
            if (frappe.session.user !== "thebebia1@gmail.com") {
                console.log('User is not Shahab, setting payment_amount to read-only.');
                
                // Set payment_amount field in the child table to read-only for non-admin users
                $.each(frm.doc.lab_tests || [], function(i, row) {
                    frm.fields_dict['lab_tests'].grid.get_field('payment_amount').df.read_only = 1;
                });
                frm.fields_dict['lab_tests'].grid.refresh();
            } else {
                console.log('User is Shahab, allowing editing of payment_amount.');

                // Allow editing of payment_amount for admin (Shahab)
                $.each(frm.doc.lab_tests || [], function(i, row) {
                    frm.fields_dict['lab_tests'].grid.get_field('payment_amount').df.read_only = 0;
                });
                frm.fields_dict['lab_tests'].grid.refresh();
            }
        } else {
            console.log('Document is not submitted, allowing editing.');

            // If document is not submitted, allow editing for everyone
            $.each(frm.doc.lab_tests || [], function(i, row) {
                frm.fields_dict['lab_tests'].grid.get_field('payment_amount').df.read_only = 0;
            });
            frm.fields_dict['lab_tests'].grid.refresh();
        }
    }
});
frappe.ui.form.on('Lab Reports', {
    after_save: function(frm) {
        // Log the patient_id to ensure it's correct
        console.log("Patient ID from Lab Reports form: " + frm.doc.patient_id);

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

                            // Loop through the lab_tests table in Lab Reports
                            frm.doc.lab_tests.forEach(lab_test => {
                                // Check if the lab test already exists in the Patient Record
                                let existing_test = patient_record_doc.lab_tests.find(test => 
                                    test.lab_tests === lab_test.lab_tests // Compare lab test identifier
                                );

                                if (existing_test) {
                                    // If the lab test exists, update the upload_results field
                                    existing_test.upload_results = lab_test.upload_results;
                                    console.log("Updated existing lab test: " + lab_test.lab_tests + " with new results.");
                                } else {
                                    // If the lab test doesn't exist, append it to the Patient Record
                                    patient_record_doc.lab_tests.push({
                                        "lab_tests": lab_test.lab_tests, // Store lab test name
                                        "upload_results": lab_test.upload_results // Store lab test result
                                    });
                                    console.log("Added new lab test: " + lab_test.lab_tests);
                                }
                            });

                            // Save the updated Patient Record using frappe.client.save
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
                                    console.log("Patient Record saved successfully.");
                                },
                                error: function(error) {
                                    frappe.msgprint({
                                        title: __('Error'),
                                        indicator: 'red',
                                        message: __('Failed to update the Patient Record.')
                                    });
                                    console.error("Error saving Patient Record: ", error);
                                }
                            });
                        })
                        .catch(error => {
                            console.error("Error fetching Patient Record: ", error);
                        });
                } else {
                    // If no record found, log and notify the user
                    console.log("No Patient Record found for Patient ID: " + frm.doc.patient_id);
                    frappe.msgprint("No Patient Record found for the given Patient ID.");
                }
            });
    }
});
