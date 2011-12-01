Ext.define('Modules.scrape.js.ProgressPanel', {
	extend: 'Ext.panel.Panel',
	
	processingPage:'/scrape/import/',
	record: false,
	row: {},
	steps: ['Fetching Links', 'Processing Content', 'Fetching Resources', 'Updating References'],
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	title:'Importing...',
	
	init: function() {
		this.initProgressBars();
	},
	
	initProgressBars: function() {
		this.pbars = [];
		for (var i = 0; i < this.steps.length; i++) {
			this.pbars.push(new Ext.ProgressBar({
				animate: true,
				text: this.steps[i]
			}));
		}
		this.items.push(this.pbars);
	},
	
	start: function() {
		this.nextStep();
	},
	
	nextStep: function(r) {
		if (r != null) {
			var response = Ext.decode(r.responseText);
			if (response.row) {
				console.log('we have row');
				console.log(response.row);
				this.record.data = response.row;
				console.log(this.record);
				console.log(this.pbars);
				// update all previous steps to 100%
				for (var i = 0; i < this.record.data.currentStep; i++) {
					this.pbars[i].updateProgress(1, this.steps[i] + ' 100%');
				}
				
				if (response.progress) {
					// update current step
					var progress = Math.round(response.progress[2] * 100);
					var nextTitle = '';
					if (response.progress.length >= 4) {
						nextTitle = '(' + response.progress[3] + ')';
					}
					this.pbars[this.record.data.currentStep].updateProgress(response.progress[2], this.steps[i] + ' ' + response.progress[0] + ' of ' + response.progress[1] + ' - ' + progress + '%' + ' ' + nextTitle);
				}
				
			}
			if (this.record.data.complete == 1) {
				return;
			}
		}
		this.callNext();
		//setTimeout(this.callNext.createDelegate(this), 1000);
	},
	
	callNext: function() {
		Ext.Ajax.request({
			url:this.processingPage + 'next-step',
			method:'post',
			success:this.nextStep,
			params:{
				scrapeId: this.record.data.scrapeId
			},
			scope:this
		});
	}
});