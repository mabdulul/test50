const csv = require("csvtojson");
const { Parser } = require("json2csv");
const fs = require("fs");

const Line_Items_fields = [
	"line_item_id",
	"item",
	"description",
	"quantity",
	"unit_price",
	"unit_markup",
	"job_id",
	"created_at",
];

const Jobs_fields = [
	"job_id",
	"job_name",
	"client",
	"operation",
	"created_at",
	"start_date",
	"end_date",
	"is_recurring",
];

(async () => {
	const LineItem_JSON = await csv().fromFile("LineItems.csv");
	const Jobs_JSON = await csv().fromFile("Jobs.csv");

	//console.log(LineItem_JSON);

	async function RemoveZeroValues() {
		// Remove all line items with a quantity of 0, save the results to a file named
		// LineItemNoZero.csv

		const remove_qty_of_zero = await LineItem_JSON.filter(
			(convertedToJson) => parseFloat(convertedToJson.quantity) !== 0
		);

		//console.log(remove_qty_of_zero);

		const convert_json_to_csv = new Parser({
			fields: Line_Items_fields,
		}).parse(remove_qty_of_zero);

		fs.writeFileSync("LineItemNoZero.csv", convert_json_to_csv);
	}
	//RemoveZeroValues();

	async function appendtextMowing() {
		// 	Append the string “MOWING IS NO LONGER COMPLIMENTARY” to the description for
		// all line items with the word “Mower” in the item name (case insensitive), save the results
		// to a file named LineItemMowing.csv (including rows that weren’t modified)

		const appendMowing = LineItem_JSON.map((mower) => {
			const reg = new RegExp(/Mower/i);
			/*
             If the item has mower in it place the “MOWING IS NO LONGER COMPLIMENTARY” to end of the string, 
             else print the object. 
            */
			if (mower.item.match(reg)) {
				return {
					...mower, // I attached “MOWING IS NO LONGER COMPLIMENTARY” to the end. I could have replace Mower with “MOWING IS NO LONGER COMPLIMENTARY”  but the task states to append.
					item: mower.item + " MOWING IS NO LONGER COMPLIMENTARY ",
				};
			}
			return mower;
		});
		console.log(appendMowing);

		const convert_json_to_csv = new Parser({
			fields: Line_Items_fields,
		}).parse(appendMowing);

		fs.writeFileSync("LineItemMowing.csv", convert_json_to_csv);
	}
	//appendtextMowing();

	async function Prepend_TreeService() {
		/* 	Prepend the string “TREE SERVICE” to the description for all line items that belong to
		 jobs with the “Tree Service” operation, save the results to a file named
		 LineItemTreeService.csv (including rows that weren’t modified)

         */

		/* 
          I assumed the question was asking me to use the Jobs.csv 
           and prepend “TREE SERVICE” to all of the 
           the operations with Tree Service as the value

         */
		const converted_Job_operation_TreeService = Jobs_JSON.map((tree) => {
			const reg = new RegExp(/Tree Service/i);
			if (tree.operation.match(reg)) {
				return {
					...tree,
					operation: " TREE SERVICE " + tree.operation,
				};
			}
			return tree;
		});
		//console.log(converted_Job_operation_TreeService);

		const convert_json_to_csv = new Parser({
			fields: Jobs_fields,
		}).parse(converted_Job_operation_TreeService);

		fs.writeFileSync("LineItemTreeService.csv", convert_json_to_csv);
	}

	//Prepend_TreeService();

	async function Add_Columns_to() {
		// Add a column for job name and client name to the line item csv, save the results to a file
		// named LineItemJobInfo.csv

		/*
           I add job_name and client to the Jobs.csv

        */

		const add_col_JobandClientName = [
			"line_item_id",
			"item",
			"description",
			"quantity",
			"unit_price",
			"unit_markup",
			"job_id",
			"created_at",
			"job_name",
			"client",
		];

		/*
        This is going to create a new array called res. It copies LineItem_JSON 
        and finds where Jobs.id = LineItem.Json . It also adds additional columns that I do not need. 
        */
		let res = LineItem_JSON.map((x) =>
			Object.assign(
				x,
				Jobs_JSON.find((JobsJ) => JobsJ.job_id == x.job_id)
			)
		);

		//console.log(res);
		/*
           I removed the additional columns that were added to LineItem_JSON in res
           The only additional columns I wanted were client and job_name
        */
		const remove_columnsfrom_Jobs = res.map((res) => {
			return {
				line_item_id: res.line_item_id,
				item: res.item,
				description: res.description,
				quantity: res.quantity,
				unit_price: res.unit_price,
				unit_markup: res.unit_markup,
				job_id: res.job_id,
				created_at: res.created_at,
				client: res.client,
				job_name: res.job_name,
			};
		});

		const Json_to_CSV = new Parser({
			fields: add_col_JobandClientName,
		}).parse(remove_columnsfrom_Jobs);

		fs.writeFileSync("LineItemJobInfo.csv", Json_to_CSV);
	}
	//Add_Columns_to();

	async function Sum_of_quantities() {
		// Sum up the quantities by item for all rows in LineItem.csv, save a csv with two columns:
		// “Item Name” and “Total Quantity” where “Total Quantity” is the sum of all quantities for
		// that item. Name this file ItemTotalQuantity.csv

		const Sum_Qty = Array.from(
			LineItem_JSON.reduce(
				(m, { item, quantity }) =>
					// Set will insure that each item is unique. Get will add the quantity
					m.set(item, (m.get(item) || 0) + parseInt(quantity)),
				new Map()
			),
			([item, quantity]) => ({ item, quantity })
		);
		console.log(Sum_Qty);

		const Json_to_CSV = new Parser({
			fields: ["item", "quantity"],
		}).parse(Sum_Qty);

		//fs.writeFileSync("ItemTotalQuantity.csv", Json_to_CSV);
	}
	Sum_of_quantities();
})();
