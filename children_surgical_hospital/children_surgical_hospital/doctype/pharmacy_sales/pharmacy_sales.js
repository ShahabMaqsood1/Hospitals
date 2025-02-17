// Copyright (c) 2024, Shahab Maqsood and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Pharmacy Sales", {
// 	refresh(frm) {

// 	},
// });
// Client Script for "Pharmacy Sales" (Parent Doctype)
frappe.ui.form.on('Pharmacy Sales', {
    refresh: function(frm) {
        calculate_total_amount(frm);
    },
    medicine_add: function(frm) {
        calculate_total_amount(frm);
    },
    medicine_remove: function(frm) {
        calculate_total_amount(frm);
    },
    discount: function(frm) {
        calculate_total_amount(frm);
    },
    discount_type: function(frm) {
        calculate_total_amount(frm);
    },
    amount_paid: function(frm) {
        calculate_change(frm);
    },
    validate: function(frm) {
        calculate_total_amount(frm);
        calculate_change(frm);
    }
});

// Client Script for "Pharmacy Sales Items" (Child Doctype)
frappe.ui.form.on('Pharmacy Sales Items', {
    medicine: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if(row.medicine) {
            frappe.db.get_value('Pharmacy Inventory', row.medicine, 'selling_price')
                .then(r => {
                    if(r.message) {
                        frappe.model.set_value(cdt, cdn, 'price', r.message.selling_price);
                    }
                });
        }
    },
    
    quantity: function(frm, cdt, cdn) {
        calculate_amount_and_total(frm, cdt, cdn);
    },
    
    price: function(frm, cdt, cdn) {
        calculate_amount_and_total(frm, cdt, cdn);
    }
});

function calculate_amount_and_total(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    if (row.quantity && row.price) {
        frappe.model.set_value(cdt, cdn, 'amount', row.quantity * row.price);
    } else {
        frappe.model.set_value(cdt, cdn, 'amount', 0);
    }
    frm.refresh_field('medicine');
    calculate_total_amount(frm);
}

function calculate_total_amount(frm) {
    let subtotal = 0;
    
    // Calculate subtotal
    if (frm.doc.medicine && frm.doc.medicine.length > 0) {
        frm.doc.medicine.forEach(row => {
            subtotal += row.amount || 0;
        });
    }
    
    frm.set_value('subtotal', subtotal);
    
    // Calculate final amount after discount
    let final_amount = subtotal;
    if (frm.doc.discount) {
        if (frm.doc.discount_type === 'Percentage') {
            final_amount = subtotal - (subtotal * frm.doc.discount / 100);
        } else {
            final_amount = subtotal - frm.doc.discount;
        }
    }
    
    frm.set_value('total_amount', final_amount);
    
    // Recalculate change if amount_paid exists
    if (frm.doc.amount_paid) {
        calculate_change(frm);
    }
}

function calculate_change(frm) {
    let amount_paid = parseFloat(frm.doc.amount_paid) || 0;
    let total_amount = parseFloat(frm.doc.total_amount) || 0;
    let change = amount_paid - total_amount;
    frm.set_value('change_returned', change >= 0 ? change : 0);
    frm.refresh_field('change_returned');
}