ModelFlow
=======

ModelFlow is a JavaScript evented state machine written to run both in node.js and the browser. 

##Design Goals
- Easily create state machine on top of a existing data model(s).
- Define states based on the data models attribute values.  
- Ability to listen for state changes and run callbacks. 
- Provide a mechanism to optionally enforce linear paths from state to state.  This may be used an alternative to flow control libraries.  

Installation / Instantiation
=======
ModelFlow depends on [Underscore](https://github.com/documentcloud/underscore) and built as a complement to  [Backbone](https://github.com/documentcloud/backbone).  

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

```

### On the Client

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
</script>

```