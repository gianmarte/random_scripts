function setApprovalRouting()
{
	var has_discount = checkDiscountItem();
	var not_base_price = checkLineItem();

	if(has_discount || not_base_price)
	{
		nlapiSetFieldValue('orderstatus', 'A');
	}
}

function checkDiscountItem()
{
	var discount_item = nlapiGetFieldValue('discountitem');

	if(!discount_item)
	{
		return false;
	}
	else
	{
		return true;
	}
}

function checkLineItem()
{
	var line_count = nlapiGetLineItemCount('item');

	for(var i = 1; i <= line_count; i++)
	{
		var lines = nlapiGetLineItemValue('item', 'price', i);

		if(lines != 1)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
}

function setApprovers(type, form)
{
	var context = nlapiGetContext();
	var user = context.getUser();
	var approvers = getApprovers();

	if(approvers.indexOf(user) == -1)
	{
		var approve_btn = form.getButton('approve');

		if(approve_btn)
		{
			approve_btn.setVisible(false);
		}
	}
}

function sendEmailToApprovers(type)
{
	if(type == 'create')
	{
		var email_tpl = 'custscript1';
		var id_email_tpl = nlapiGetContext().getSetting('SCRIPT', email_tpl);
		var emailMerger = nlapiCreateEmailMerger(id_email_tpl);
		var context = nlapiGetContext();
		var user = context.getUser();
		var tran_id = nlapiGetRecordId();

		emailMerger.setTransaction(tran_id);

		var merge_res = emailMerger.merge();

		nlapiSendEmail(user, getApprovers(), merge_res.getSubject() , merge_res.getBody());
	}
}

function getApprovers()
{
	var script_dep = nlapiLoadRecord('scriptdeployment', 482);
	var user_approvers = script_dep.getFieldValues('audemployee');
	var approvers_arr = [];

	// push user_approvers value to an array as NetSuite is adding a special character into the object when using raw getFieldValues api
	for(var j = 0; j < user_approvers.length; j++)
	{
		approvers_arr.push(user_approvers[j]);
	}

	return approvers_arr;
}

function loggers(_var, msg)
{
  nlapiLogExecution("DEBUG", _var, msg);
}