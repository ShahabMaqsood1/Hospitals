// Copyright (c) 2025, Shahab Maqsood and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Pharmacy Bills", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Pharmacy Bills', {
    refresh: frm => calculate_total_amount(frm),
    items_add: frm => calculate_total_amount(frm),
    items_remove: frm => calculate_total_amount(frm),
    discount: frm => calculate_total_amount(frm),
    discount_type: frm => calculate_total_amount(frm),
    amount_paid: frm => calculate_change(frm),
    validate: frm => {
        calculate_total_amount(frm);
        calculate_change(frm);
    }
});

frappe.ui.form.on('Pharmacy Bill Item', {
    quantity: (frm, cdt, cdn) => calculate_item_amount_and_total(frm, cdt, cdn),
    purchase_price: (frm, cdt, cdn) => calculate_item_amount_and_total(frm, cdt, cdn)
});

function calculate_item_amount_and_total(frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    row.amount = (row.quantity || 0) * (row.purchase_price || 0); // Calculate item amount
    frm.refresh_field('items');
    calculate_total_amount(frm);
}

function calculate_total_amount(frm) {
    let subtotal = (frm.doc.items || []).reduce((sum, row) => sum + (row.amount || 0), 0);
    frm.set_value('subtotal', subtotal); // Set subtotal

    // Apply discount if applicable
    let total_amount = subtotal;
    if (frm.doc.discount) {
        if (frm.doc.discount_type === 'Percentage') {
            total_amount -= (subtotal * frm.doc.discount / 100);
        } else {
            total_amount -= frm.doc.discount;
        }
    }

    frm.set_value('total_amount', total_amount); // Set total amount

    // Recalculate change if amount_paid exists
    if (frm.doc.amount_paid) {
        calculate_change(frm);
    }
}

function calculate_change(frm) {
    const total_amount = parseFloat(frm.doc.total_amount) || 0;
    const amount_paid = parseFloat(frm.doc.amount_paid) || 0;
    const change_returned = amount_paid - total_amount;
    frm.set_value('change_returned', change_returned >= 0 ? change_returned : 0); // Ensure non-negative change
}
