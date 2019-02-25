function beforeLoad(type, form)
{
	var is_sales_rep = getSalesRep();
  loggers("is_sales_rep", is_sales_rep);

	if(is_sales_rep)
	{
		setApprovers(type, form);
	}
}

function beforeSubmit(type)
{
	var is_sales_rep = getSalesRep();
	var is_sales_role = getRole();

	loggers("is_sales_rep", is_sales_rep);

	if(is_sales_rep && is_sales_role)
	{
		setApprovalRouting(type);
	}
}

function afterSubmit(type)
{
	var is_sales_rep = getSalesRep();

	if(is_sales_rep)
	{
		sendEmailToApprovers(type);
	}
}

function setApprovers(type, form)
{
	var context = nlapiGetContext();
	var user = context.getUser();
	var so_rec = type == 'view' || type == 'edit' ? nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId()) : "";
	var so_sales_rep = so_rec ? so_rec.getFieldValue('salesrep') : "";

	try
	{
		var approvers = getApprovers();

		if(so_rec != "")
		{
			if(approvers.indexOf(user) == -1 )
			{
				var approve_btn = form.getButton('approve');

				if(approve_btn)
				{
					approve_btn.setVisible(false);
				}
			}
		}
	}
	catch(err)
	{
		loggers("set Approvers err", err);
	}
}

function setApprovalRouting(type)
{
	var has_discount = checkDiscountItem();
	var not_base_price = checkLineItem();

	if(has_discount || not_base_price)
	{
		if(type == 'create')
		{
			nlapiSetFieldValue('orderstatus', 'A');
		}
	}
}

function sendEmailToApprovers(type)
{
	if(type == 'create')
	{
		try
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
		catch(_err){
			loggers("sendEmailToApprovers _err", _err);
		}
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

function getRole()
{
	var search_res = nlapiSearchRecord('role', 145);
	var user_role = nlapiGetContext().getRole();
	var role_ids = [];

	for(var i = 0; i < search_res.length; i++)
	{
		role_ids.push(parseInt(search_res[i].getValue('internalid')));
	}

	if(role_ids.indexOf(user_role) != -1)
	{
		return true;
	}
	else
	{
		return false;
	}
}

function getApprovers()
{
  	try
    {
		var script_dep = nlapiLoadRecord('scriptdeployment', 482);
		var user_approvers = script_dep.getFieldValues('audemployee');
		var approvers_arr = [];

		// push user_approvers value to an array as NetSuite is adding a special character into the object when using raw getFieldValues api
		for(var j = 0; j < user_approvers.length; j++)
		{
			//parseInt as NetSuite converts the value to string
			approvers_arr.push(parseInt(user_approvers[j]));
		}

		return approvers_arr;	
	}
	catch(e)
	{
		loggers("getApprovers e", e);
	}
}

function getSalesRep()
{
	var sales_rep = nlapiGetFieldValue('salesrep');

	if(sales_rep != 2)
	{
		return true;
	}
	else
	{
		return false;
	}
}

function loggers(_var, msg)
{
  nlapiLogExecution("DEBUG", _var, msg);
}