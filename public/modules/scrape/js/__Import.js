Ext.define('Modules.scrape.js.Import', {
	extend: 'Ext.panel.Panel',
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Settings
	width: 250,
	steps: [
		'Fetching Links',
		'Processing Content',
		'Fetching Resources',
		'Updating References',
		'Creating Template'
	],
	defaultUrl: '',
	
	//Panels
	selectionPanel: false,
	progressPanel: false,
	stepPanels: [],
	
	//Functions
	init: function(){
		this.addEvents('submit');
		
		this.initPanels();
		this.addItems();
	},
	
	initPanels: function(){
		this.stepPanels = [];
		this.initSelectionPanel();
	},
	
	initSelectionPanel: function(){
		//Selection Panel
		this.selectionPanel = new Ext.FormPanel({
			scope: this,
			title: 'Tell me what to suck',
			border: false,
			frame: false,
			hidden: false,
			layout: 'anchor',
			bodyStyle: 'padding:10px',
			
			//Items
			items: [
				new Ext.form.TextField({
					scope: this,
					name: 'url',
					emptyText: 'Input the url you want to SUCK...',
					value: this.defaultUrl,
					anchor: '100%',
					style: 'margin-bottom:5px'
				}),
				new Ext.form.ComboBox({
					scope: this,
					value: 0,
					editable: false,
					emptyText: 'Options...',
				    triggerAction: 'all',
				    mode: 'local',
				    store: new Ext.data.ArrayStore({
				        id: 0,
				        fields: [
				            'value',
				            'text'
				        ],
				        data: [[0, 'Single Page'], [-1, 'Full Site']]
				    }),
				    valueField: 'value',
				    displayField: 'text',
				    hiddenName: 'depth',
				    anchor: '100%'
				}),
				new Ext.Button({
					scope: this,
					text: 'Suck It',
					style: 'margin-top:5px;',
					anchor: '100%',
					handler: this.submit
				})
			],
			
			//Functions
			getUrl: function(){
				return this.get(0).getValue();
			},
			getOption: function(){
				return this.get(1).getValue();
			}
		});
		
		this.on('selection', function(){
			this.remove(this.selectionPanel);
			this.add(this.progressPanel);
			this.doLayout(false, true);
		}, this);
	},
	initProgressPanel: function(){
		this.progressPanel = new Ext.Panel({
			scope: this,
			title: 'Progress Panel',
			hidden: false
		});
		
		//Add the steps to this panel
		for(var i = 0; i < this.steps.length; i++){
			
			//Disable all but the first step
			var disabled = false;
			if(i){
				disabled = true;
			}
			
			//Generate the html
			var html = String.format(
				'<div class="step-container"><div class="step-progress-text"></div></div>'
			);
			
			//Create the step panel
			var stepPanel = new Ext.Panel({
				scope: this,
				border: false,
				disabled: disabled,
				cls: 'step-incomplete',
				html: html,
				items: [
					new Ext.ProgressBar({
						scope: this,
						animate: true,
						text: String.format('{0}. {1}', i+1, this.steps[i]),
						cls: 'step-progress',
						layout: 'fit',
						listeners:{
							scope: this,
							update: function(pbar, value, text){
								//console.log(value);
								if(value > 0 && value < 1){
									pbar.findParentByType('panel').removeClass('step-imcomplete');
									pbar.findParentByType('panel').addClass('step-active');
								}
								else if(value == 1){
									pbar.findParentByType('panel').removeClass('step-active');
									pbar.findParentByType('panel').addClass('step-complete');
								}
								else{
									pbar.findParentByType('panel').addClass('step-incomplete');
								}
							}
						}
					})
				],
				getProgressBar: function(){
					return this.get(0);
				}
			});
			
			//Add to the step panels array
			this.stepPanels[i] = stepPanel;
			
			//Add to the progress panel
			this.progressPanel.add(stepPanel);
		}
	},
	
	addItems: function(){
		this.items = [this.selectionPanel]
	},
	
	submit: function(){
		this.selectionPanel.getForm().submit({
			scope: this,
			url: '/scrape/import/url-save/',
		    success: function(form, action) {	
		    	this.selectionPanel.hide();
		    	this.initProgressPanel();
		    	this.add(this.progressPanel);
		    	this.doLayout();
		    	
		    	//Fire the submit event
		    	this.fireEvent('submit', action.result);
		    },
		    failure: function(form, action) {
				
		    }
		});
	}	
});