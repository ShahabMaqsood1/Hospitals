# Copyright (c) 2024, Shahab Maqsood and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class Inventory(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		name1: DF.Data | None
	# end: auto-generated types
	pass
