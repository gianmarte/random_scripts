function setApprovalRouting()
{
	var has_discount = checkDiscountItem();
	var not_base_price = checkLineItem();

	if(has_discount || not_base_price)
	{
		nlapiSetFieldValue('orderstatus', 'A');
		sendEmailToApprovers();
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

function sendEmailToApprovers()
{
	var email_tpl = 'custscript1';
	var id_email_tpl = nlapiGetContext().getSetting('SCRIPT', email_tpl);
	var emailMerger = emailMerger = nlapiCreateEmailMerger(id_email_tpl);;
	var context = nlapiGetContext();
	var user = context.getUser();
	var merge_res = emailMerger.merge();

	nlapiSendEmail(user, getApprovers(), merge_res.getSubject() , merge_res.getBody());
}

function getApprovers()
{
	var user_approvers = [-5, 291, 259];

	return user_approvers;
}

function loggers(_var, msg)
{
  nlapiLogExecution("DEBUG", _var, msg);
}