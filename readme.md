ModelFlow->
=======

ModelFlow is a JavaScript evented state machine written to run both in node.js and the browser. 

##Design Goals
- Easily create state machine on top of a existing data model(s).
- Define states based on the data models attribute values.  
- Ability to listen for state changes and run callbacks. 
- Provide a mechanism to optionally enforce linear paths from state to state.  This may be used an alternative to flow control libraries.  

Installation / Basic Usage
=======
ModelFlow depends on [Underscore](https://github.com/documentcloud/underscore) and is built as a complement to  [Backbone](https://github.com/documentcloud/backbone).  

### On the Server

Install the library using npm or add it to your `package.json` file as a dependancy. Instances of ModelFlow are technically Backbone Models, however the module can be used completely standalone.

``` bash
  $npm install modelflow
```

Define a StateModel class, create an instance of it.  

``` js

var ModelFlow = require('modelflow');
var CustomFlow = ModelFlow.StateModel.extend({
    states : {
        state1 : { foo : 1 },
        staet2 : { foo : 2 }
    }
});

var flow = new CustomFlow();

```

### On the Client

Just like server, however ModelFlow will be pushed on the window as a global.


``` html
<script type="text/javascript" src="underscore.js"></script>
<script type="text/javascript" src="backbone.js"></script>
<script type="text/javascript" src="ModelFlow.js"></script>

<script type="text/javascript">
	var CustomFlow = ModelFlow.StateModel.extend({
	    states : {
	        state1 : { foo : 1 },
	        staet2 : { foo : 2 }
	    }
	});

	var flow = new CustomFlow();
</script>

```


Moar Usage
=======

###Bind callbacks on state changes
``` js
	var CustomFlow = ModelFlow.StateModel.extend({
	    states : {
	        init : { foo : 1 }
	    }
	});

	var flow = new CustomFlow();
	flow.bind('state:->init', function() {
		console.log('init entered');
	});

	flow.bind('state:init->', function() {
		console.log('init exited');
	});

	flow.set({ foo : 0 });  //this does nothing
	flow.set({ foo : 1 });  //logs 'init entered' 
	flow.set({ foo : 2 });  //logs 'init exited'
```


###Define multiple, complex states
``` js
	var CustomFlow = ModelFlow.StateModel.extend({
	    states : {
	        state1 : { 
	        	foo : 1,
	        	bar : "testing"
	        },
	        state2 : { 
	        	foo : 1,
	        	bar : "hello"
	        },
	        state3 : {
	        	foo : 1,
	        	bar : "testing",
	        	cat : "meow"
	        }
	    }
	});

	var flow = new CustomFlow({
		foo : 1,
	    bar : "testing"
	});

	flow.bind('state:state1->', function() {
		console.log('state1 exited');
	});

	flow.bind('state:->state2', function() {
		console.log('state2 entered');
	});

	flow.bind('state:->state3', function() {
		console.log('state3 entered');
	});

	console.log(flow.inState('state1')); //logs true
	console.log(flow.inState('state2')); //logs false
	console.log(flow.inState('state3')); //logs false

	flow.set({ cat : 'meow' }); //logs 'state3 entered'

	console.log(flow.inState('state1')); //logs true
	console.log(flow.inState('state2')); //logs false
	console.log(flow.inState('state3')); //logs true

	flow.set({ bar : 'hello' }); //logs 'state 1 exited' and 'state2 entered'

	console.log(flow.inState('state1')); //logs false
	console.log(flow.inState('state2')); //logs true
	console.log(flow.inState('state3')); //logs false

```
