(function() {
	
	var root = this;
	var ModelFlow;

	if (typeof exports !== 'undefined') {
	    ModelFlow = exports;
	} else {
	    ModelFlow = root.ModelFlow = {};
	}

	var Backbone = root.Backbone;
	var _ = root._;

	if (!Backbone && (typeof require !== 'undefined')) Backbone = require('backbone');
	if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

	ModelFlow.getBackbone = function() {
		return Backbone;
	};

	function createStateModel() {
		
		var states = {},
		 	currentStates = {},
			constraints = {},
		 	self = this,
		 	disableConstraints = false;
		
		//extract these values on mixin
		if (!this.states) this.states = {};
		if (!this.constraints) this.constraints = [];

		function modelChange() {
			var inStates = {},
				outStates = {};

			
			_.each(states, function(stateObj, state) {
				if (_.all(_.keys(stateObj), function(key) {
					return (self.get(key) === stateObj[key]);
				})) {
					if (!currentStates[state]) inStates[state] = stateObj;
				} else if (currentStates[state]) {
					outStates[state] = stateObj;
				}
			});

			_.each(inStates, function(stateObj, state) {

				//check constraints
				if (!disableConstraints && constraints[state] 
					&& !_.all(constraints[state], function(outState) {
					return outStates[outState];
				})) return;

				currentStates[state] = stateObj;
				self.trigger("state:->"+state, stateObj);

				_.each(outStates, function(outObj, outState) {
					self.trigger("state:"+outState+"->"+state, stateObj);
				});
			});

			_.each(outStates, function(stateObj, state) {
				delete currentStates[state];
				self.trigger("state:"+state+"->", stateObj);
			});
		}

		function initialize() {

			_.each(this.states, function(stateObj, key) {
				this.createState(key, stateObj, true);
			}, this);

			_.every(this.constraints, function(constraint) {
				self.addConstraint(constraint, true);
			});
			
			modelChange();
		}

		this.createState = function(name, props, silent) {
			states[name] = props || {};
			if (!silent) modelChange();
			return this;
		};

		this.setState = function(stateName, ignoreContraints) {
			
			var stateChanged = true;
			disableConstraints = (ignoreContraints === true);
			//I realize backbone docs say don't access this
			//but its the easiest way to snapshop the attributes
			//and provide a rollback
			var previousState = _.clone(this.attributes);

			//by setting all the keys and values 
			//to the model, a subsequent state change will occur
			this.set(states[stateName], {
				//make this silent if constraits are disabled
				silent : disableConstraints 
			});

			//if it didn't work, revert
			if (!disableConstraints && !this.inState(stateName)) {

				this.attributes = previousState;
				stateChanged = false;
				
			}

			disableConstraints = false;
			return stateChanged;
		};

		this.currentStates = function() {
			return _.keys(currentStates);
		};

		this.inState = function(state) {
			return _.any(this.currentStates(), function(active) {
				return (active === state);
			});
		};

		this.addConstraint = function(constraint, silent) {
			var steps = constraint.split('->');
			if (steps.length === 0) throw Error("Y U give no constraint");

			var outState = steps.shift();
			while(steps.length>0) {
				var inState = steps.shift();
				
				if (!constraints[inState]) constraints[inState] = [];
				constraints[inState].push(outState);

				outState = inState;
			}

			if (!silent) modelChange();
			return this;
		};
		
		this.bind('change', modelChange.bind(this));
		//alias node style events
		this.on   = this.bind;
		this.emit = this.trigger;
		initialize.call(this);
	}

	ModelFlow.StateModel = Backbone.Model.extend({

		initialize : function(options) {
			Backbone.Model.prototype.initialize.call(this, options);
			createStateModel.call(this);
		},

		states : {},

		constraints : []

	});


}).call(this);