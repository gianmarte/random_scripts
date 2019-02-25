function setFieldsDisabled()
{
	var sales_role = getRole();

	if(sales_role)
	{
		setFields(true);

		var item_id = nlapiGetCurrentLineItemValue('item', 'item');
		var filter = [new nlobjSearchFilter('type', null, 'anyof', 'Discount')];
		var col = [new nlobjSearchColumn('internalid')];

		var disc_search = nlapiSearchRecord('item', null, filter, col);
		var disc_arr = [];

		for(var i = 0; i < disc_search.length; i++)
		{
			disc_arr.push(parseInt(disc_search[i].getValue('internalid')));
		}

		var arr = JSON.stringify(disc_arr);
		var arr_str = arr.substring(1, arr.length-1);

		nlapiSetFieldValue('custbody_kodella_discount_id', arr_str);
	}
}

function setFieldsEnabled(type)
{
	var sales_role = getRole();

	if(type == 'item' && sales_role)
	{
		var is_discount_item = nlapiGetCurrentLineItemValue('item','item');
		var disc_id = nlapiGetFieldValue('custbody_kodella_discount_id').split(',');

		if(disc_id.indexOf(is_discount_item.toString()) == -1)
		{
			setFields(true);
		}
		else
		{
			setFields(false);
		}
	}
}

function checkLineItem(type)
{
  	var sales_role = getRole();

	if(type == 'item' && sales_role)
	{
      	setFieldsEnabled(type);
	}
}

function setFields(_var)
{
	nlapiDisableLineItemField('item','amount', _var);
	nlapiDisableLineItemField('item','rate', _var);
	nlapiDisableLineItemField('item','price', _var);
}