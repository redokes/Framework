/**
 * <p>Redokes.form.Abstract is the form that all Redokes application forms should extend. 
 * This class extends the ext form panel, and adds additional functionailty such 
 * as:
 * </p>
 * 
 *  - the ability to prefix and postfix form fields
 *  - events when submitting the form
 *  - ability to add addition params that get submitted with the form
 *  
 * @constructor
 * @param {Object} config 
 */
Ext.define('Redokes.form.Abstract', {
	extend:'Ext.form.Panel',
	alias: 'widget.redokesform',
	requires: [
		'Redokes.form.plugin.StatusBar'
	],
	
	///////////////////////////////////////////////////
	//	Config
	///////////////////////////////////////////////////
	autoScroll: true,
	
	/**
	 * @cfg {Object} 
	 * An object of key value items to send with the form submission
	 */
	baseParams: {},
	
	/**
	 * @cfg {String} 
	 * String to prefix onto all the forms fields
	 */
	fieldPrefix: '',
	
	/**
	 * @cfg {String} 
	 * String to postfix onto all the forms fields
	 */
	fieldPostfix: '',
	
	///////////////////////////////////////////////////
	//	Properties
	///////////////////////////////////////////////////
	
	/**
	 * @type {Boolean}
	 * True if form is using prefix and postfix options
	 */
	usingPrefixPostfix: false,
	
	
	constructor: function(){
		this.baseParams = {};
		return this.callParent(arguments);
	},
	
	initComponent: function(){
		this.plugins = this.plugins || [];
		
		//Set up items
		if(!this.url){
		}
		
		//Prototype the field to always show the msgTarget on the side
		Ext.form.field.Base.prototype.msgTarget = 'side';
		
		//Add events
		this.addEvents(
			/**
			 * @event beforesubmit
			 * Fires before the form is submitted
			 * @param {Redokes.form.Abstract} form the form that is being submitted
			 * @param {Object} params the params being submitted with the form
			 */
			'beforesubmit',
			
			/**
			 * @event submit
			 * Fires when the form has been submitted
			 * @param {Redokes.form.Abstract} form the form that was submitted
			 * @param {Object} response the response of the form submission
			 */
			'submit',
			
			/**
			 * @event success
			 * Fires when the form submission was successfull
			 * @param {Redokes.form.Abstract} form the form that was successfully submitted
			 * @param {Object} response the response of the form submission
			 */
			'success',
			
			/**
			 * @event failure
			 * Fires when the form submission was unsuccessfull
			 * @param {Redokes.form.Abstract} form the form that was successfully submitted
			 * @param {Object} response the response of the form submission
			 */
			'failure',
			
			/**
			 * @event cancelsubmit
			 * Fires when the form submission was cancelled
			 * @param {Redokes.form.Abstract} form the form that was successfully submitted
			 */
			'cancelsubmit'
		);
			
		//Init the field names
		this.usePrefixPostfixNames();
		
		//Listen for a new field
		this.on('add', function(form, item){
			if(Ext.ComponentQuery.is(item, 'field')){
				if(this.usingPrefixPostfix){
					this.applyPrefixPostfix(item);
				}
			}
		}, this);
		
		// Init plugins
//		this.initStatusBar();
		
		//Call the parent function
		this.callParent(arguments);
	},
	
	/**
	 * Sets the field prefix
	 * @param {String} prefix prefix to use 
	 */
	setFieldPrefix: function(prefix){
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setFieldPrefix(options.prefix);
			}, this, {prefix: prefix});
			return;
		}
		this.fieldPrefix = prefix;
		if(this.usingPrefixPostfix){
			this.getForm().getFields().each(function(field){
				if(field.name != null && field.name.length){
					this.applyPrefixPostfix(field);
				}
			}, this);
		}
	},
	
	/**
	 * Sets the field postfix
	 * @param {String} postfix postfix to use
	 */
	setFieldPostfix: function(postfix){
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setFieldPostfix(options.postfix);
			}, this, {postfix: postfix});
			return;
		}
		this.fieldPostfix = postfix;
		if(this.usingPrefixPostfix){
			this.getForm().getFields().each(function(field){
				if(field.name != null && field.name.length){
					this.applyPrefixPostfix(field);
				}
			}, this);
		}
	},
	
	applyPrefixPostfix: function(field){
		if(field.defaultName == null){
			field.defaultName = field.name;
		}

		var newName = this.getAppliedName(field.defaultName);
		field.name = newName;
	},
	
	getAppliedName: function(str) {
		if(this.fieldPrefix.toString().length){
			str = this.fieldPrefix + "-" + str;
		}
		if(this.fieldPostfix.toString().length){
			str += "-" + this.fieldPostfix;
		}
		return str;
	},
	
	/**
	 * Use the default name on the form fields
	 */
	useDefaultNames: function(){
		this.getForm().getFields().each(function(field){
			if(field.name != null && field.name.length){
				if(field.defaultName != null){
					field.name = field.defaultName;
				}
			}
		}, this);
		this.usingPrefixPostfix = false;
	},
	
	/**
	 * Use the prefix and postfix on the form fields
	 */
	usePrefixPostfixNames: function(){
		this.setFieldPrefix(this.fieldPrefix);
		this.setFieldPostfix(this.fieldPostfix);
		this.usingPrefixPostfix = true;
	},
	
	/**
	 * Apply the passed object with the baseParams of the form
	 * @param {Object} params key value object 
	 */
	setParams: function(object){
		Ext.apply(this.baseParams, object);
	},
	
	/**
	 * Set a param on the baseParam object to be submitted with the form
	 * @param {String} key value to set 
	 * @param {String/Object} value value of the key 
	 */
	setParam: function(param, value){
		this.baseParams[param] = value;
	},
	
	getValues: function(){
		//If the form isnt rendered return empty values
		if(!this.rendered){
			return {};
		}
		
		var values = this.getForm().getValues();
		
		// Add prefix and postfix to submit params if we are using prefix and postfix names
		if(this.usingPrefixPostfix){
			var appliedParams = {};
			for (var i in this.baseParams) {
				appliedParams[this.getAppliedName(i)] = this.baseParams[i];
			}
			Ext.apply(values, appliedParams);
		}
		else{
			Ext.apply(values, this.baseParams);
		}
		
		return values;
	},
	
	setValues: function(values){
		if(!this.rendered){
			this.on('afterrender', function(form, options){
				this.setValues(values);
			}, this, {values: values});
			return;
		}
		this.useDefaultNames();
		this.getForm().setValues(values);
		this.usePrefixPostfixNames();
	},
	
	/**
	 * Returns true if the form has any errors
	 * @return {Boolean}
	 */
	anyErrors: function(){
		var hasErrors = false;
		this.getForm().getFields().each(function(field){
			if(field.hasActiveError()){
				hasErrors = true;
			}
		}, this);
		
		return hasErrors;
	},
	
	/**
	 * Submit the form
	 */
	submit: function(){
		if(this.rendered && this.getForm().isValid() && this.fireEvent('beforesubmit', this, this.baseParams) !== false){
			var values = this.getValues();
			Ext.apply(values, this.baseParams);
			
			this.getForm().submit({
				scope: this,
				url: this.url,
				params: values,
				success: function(form, action){
					this.fireEvent('submit', form, action);
					this.fireEvent('success', form, action);
				},
				failure: function(form, action){
					this.fireEvent('failure', form, action);
					this.fireEvent('submit', form, action);
					var errors = action.result.errors;
					//setTimeout(Ext.bind(function(errors){
						var errorsArray = [];
						for(var id in errors){
							errorsArray.push({
								id: id,
								msg: errors[id]
							});
						}
						this.getForm().markInvalid(errorsArray);
					//}, this, [action.result.errors]));
				}
			});
		}
		else{
			this.fireEvent('cancelsubmit', this);
		}
	},
	
	initStatusBar: function(){
		/**
		 * @type {Redokes.form.plugin.StatusBar}
		 * StatusBar plugin
		 */
		this.statusBarPlugin = Ext.create('Redokes.form.plugin.StatusBar', {
			dockTo: this
		});
		this.plugins.push(this.statusBarPlugin);
		
//		this.statusBarPlugin.on('showerror', function(name){
//			//Find the field
//			this.navigationStore.each(function(record){
//				var panel = record.get('panel');
//				if(Ext.ComponentQuery.is(panel,'redokesform')){
//					var foundField = panel.getForm().findField(name);
//					if(foundField != null){
//						this.setActiveItem(panel);
//						foundField.focus(true, 100);
//					}
//				}
//			}, this);
//		}, this);
	}
});