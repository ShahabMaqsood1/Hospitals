// Copyright (c) 2024, Shahab Maqsood and contributors
// For license information, please see license.txt

// frappe.ui.form.on("New Admission", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('New Admission', {
    refresh: function(frm) {
        console.log('Form refreshed, docstatus:', frm.doc.docstatus);  // Debugging

        // Check if the document is submitted
        if (frm.doc.docstatus == 1) {
            console.log('Document is submitted.');

            // Make the entire child table read-only for everyone
            frm.set_df_property('payments', 'read_only', true);
            console.log('Payments table set to read-only.');

            // Check if the user is not Shahab
            if (frappe.session.user !== "randeljack123@gmail.com") {
                console.log('User is not Shahab, setting payment_amount to read-only.');
                // Set payment_amount field in the child table to read-only
                frm.fields_dict['payments'].grid.get_field('payment_amount').df.read_only = 1;
                frm.fields_dict['payments'].grid.refresh();
            } else {
                console.log('User is Shahab, allowing editing of payment_amount.');
                // If user is Shahab, allow editing
                frm.fields_dict['payments'].grid.get_field('payment_amount').df.read_only = 0;
                frm.fields_dict['payments'].grid.refresh();
            }
        } else {
            console.log('Document is not submitted, allowing editing.');
            // If document is not submitted, allow editing for everyone
            frm.fields_dict['payments'].grid.get_field('payment_amount').df.read_only = 0;
            frm.fields_dict['payments'].grid.refresh();
        }
    }
});
