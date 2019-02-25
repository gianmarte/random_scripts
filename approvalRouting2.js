/**
	*@NScriptType UserEventScript
	*@NApiVersion 2.x
*/

define(
	[
		'N/runtime'
	,	'N/record'
	,	'N/render'
	,	'N/email'
	]
,	function
	(
		runtime
	,	record
	,	render
	,	email
	)
{

	var _ = {
		setApprovers: function setApprovers(mode, form)
		{
			var cur_user = runtime.getCurrentUser();

			try
			{
				var approvers = this.getApprovers();

				if(approvers.indexOf(cur_user.id) == -1)
				{
					var approve_btn = form.getButton({
						id: 'approve'
					});

					if(approve_btn)
					{
						approve_btn.isHidden = true;
					}
				}
			}
			catch(_err)
			{
				log.debug("setApprovers _err", _err);
			}
		}
	,	setApprovalRouting: function setApprovalRouting(type, newRec)
		{
			var has_discount = this.checkDiscountItem(newRec);
			var not_base_price = this.checkLineItem(newRec);

			if(has_discount || not_base_price)
			{
				if(type == 'create')
				{
					newRec.setValue({
						fieldId: 'orderstatus'
					,	value: 'A'
					})
				}
			}
		}
	,	sendEmailToApprovers: function sendEmailToApprovers(type)
		{
			var self = this;

			if(type == 'create')
			{
				try
				{
					var email_tpl = 'custscript_email_tpl';
					var id_email_tpl = runtime.getCurrentScript().getParameter(email_tpl);
					var tran_id = record.id;
					var author = runtime.getCurrentUser();
					var emailMerger = render.mergeEmail({
						templateId: id_email_tpl
					});

					email.send({
						author: author.id
					,	recipients: self.getApprovers()
					,	subject: emailMerger.subject
					,	body: emailMerger.body
					});
				}
				catch(err)
				{
					log.debug("setEmailToApprovers err", err);
				}
			}
		}
	,	checkDiscountItem: function checkDiscountItem(newRec)
		{
			var discount_item = newRec.getValue({
				fieldId: 'discountitem'
			});
			log.debug("discount_item", discount_item);
			if(!discount_item)
			{
				return false;
			}
			else
			{
				return true;
			}
		}
	,	checkLineItem: function checkLineItem(newRec)
		{
			var line_count = newRec.getLineCount({
				sublistId: 'item'
			});

			for(var i = 0; i <= line_count; i++)
			{
				var lines = newRec.getSublistValue({
					sublistId: 'item'
				,	fieldId: 'price'
				,	line: i
				});

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
	,	getApprovers: function getApprovers()
		{
			try
			{
				var script_dep = record.load({
					type: record.Type.SCRIPT_DEPLOYMENT
				,	id: 487
				});

				var user_approvers = script_dep.getValue({
					fieldId: 'audemployee'
				});


				var approvers_arr = [];

				for(var j = 0; j < user_approvers.length; j++)
				{
					approvers_arr.push(parseInt(user_approvers[j]));
				}

				return approvers_arr;
			}
			catch(e)
			{
				log.debug("getApprovers e", e);
			}
		}
	};

	return {
		beforeLoad: function setBeforeLoad(context)
		{
			_.setApprovers(context.type, context.form);
		}
	,	beforeSubmit: function setBeforeSubmit(context)
		{
			_.setApprovalRouting(context.type, context.newRecord);
		}
	,	afterSubmit: function(context)
		{
			_.sendEmailToApprovers(context.type);
		}
	}
});