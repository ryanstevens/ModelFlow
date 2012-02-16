var test = require('testling');  //require('tap').test;
var ModelFlow = require('../ModelFlow');


test("ModelFlow can be instantiated as a model", function (t) {
 
    t.ok(ModelFlow, 'ModelFlow should be loaded');
    t.equal(ModelFlow.getBackbone().VERSION, '0.5.3');

    var flow = new ModelFlow.StateModel();

    t.ok(flow, "Flow should be instantiated");
    flow.set({test : 1});

    t.equal(flow.get('test'), 1);


    var CustomFlow = ModelFlow.StateModel.extend({

    });

    var customFlow = new CustomFlow({initProp: 1});
    t.ok(customFlow, 'Cusom Flow should be instantiated');
    t.ok(customFlow instanceof ModelFlow.StateModel);
    t.ok(customFlow instanceof ModelFlow.getBackbone().Model);

    customFlow.set({'test': 2});
    t.equal(customFlow.get('test'), 2);
    t.equal(customFlow.get('initProp'), 1);

    t.end();

})


test("A ModelFlow should define states" , function (t) {

    var inited = 0,
        uninited = 0,
        CustomFlow = ModelFlow.StateModel.extend({});

    var customFlow = new CustomFlow;
    customFlow.bind("state:->init", function() {
        inited++;
    });

    customFlow.bind('state:init->', function() {
        uninited++;
    });

    customFlow.createState('init', {test : 4});

    t.ok(!customFlow.inState('init'));
    t.ok(inited === 0);
    t.ok(uninited === 0);

    customFlow.set({'test' : 4});
    t.ok(customFlow.inState('init'));
    //callback must have fired
    t.ok(inited === 1);
    t.ok(uninited === 0);

    //take it out of the init state
    customFlow.set({'test' : 5});
    t.ok(!customFlow.inState('init'));
    t.ok(inited === 1);
    t.ok(uninited === 1);

    //put it back
    customFlow.set({'test' : 4});
    t.ok(customFlow.inState('init'));
    t.ok(inited === 2);
    t.ok(uninited === 1);

    t.end();
});


test("A ModelFlow can have two states" , function (t) {
    var transitionCalled = false,
        CustomFlow = ModelFlow.StateModel.extend({});

    var customFlow = new CustomFlow;
    customFlow.bind("state:init->next", function() {
        transitionCalled = true;
    });

    customFlow
        .createState('init', {test : 1})
        .createState('next', {test : 2});

    t.ok(!customFlow.inState('init'));
    t.ok(!customFlow.inState('next'));

    customFlow.set({'test' : 1});

    t.ok(customFlow.inState('init'));
    t.ok(!customFlow.inState('next'));

    t.ok(!transitionCalled);
    customFlow.set({'test' : 2});
    t.ok(transitionCalled);
    t.ok(customFlow.inState('next'));

    t.end();
});


test("A ModelFlow can have a constraint" , function (t) {
    var nextTransition = false,
        lastTransition = false,   
        CustomFlow = ModelFlow.StateModel.extend({});

    var customFlow = new CustomFlow;
    customFlow.bind("state:init->next", function() {
        nextTransition = true;
    });

    customFlow.bind("state:next->last", function() {
        lastTransition = true;
    });
    
    customFlow
        .createState('init', {test : 1})
        .createState('next', {test : 2})
        .createState('last', {test : 3})
        .addConstraint('init->next->last');

    t.ok(!customFlow.inState('init'));
    t.ok(!customFlow.inState('next'));
    t.ok(!customFlow.inState('last'));
    t.ok(!nextTransition);
    t.ok(!lastTransition);

    //negative test
    //next cannot be set until it init is set first
    customFlow.set({'test' : 2});
    t.ok(!customFlow.inState('init'));
    t.ok(!customFlow.inState('next'));
    t.ok(!customFlow.inState('last'));
    t.ok(!nextTransition);
    t.ok(!lastTransition);

    //negative test
    //next cannot be set until it init is set first
    customFlow.set({'test' : 3});
    t.ok(!customFlow.inState('init'));
    t.ok(!customFlow.inState('next'));
    t.ok(!customFlow.inState('last'));
    t.ok(!nextTransition);
    t.ok(!lastTransition);

    customFlow.set({'test' : 1});
    t.ok(customFlow.inState('init'));
    t.ok(!customFlow.inState('next'));
    t.ok(!customFlow.inState('last'));
    t.ok(!nextTransition);
    t.ok(!lastTransition);

    customFlow.set({'test' : 2});
    t.ok(!customFlow.inState('init'));
    t.ok(customFlow.inState('next'));
    t.ok(!customFlow.inState('last'));
    t.ok(nextTransition);
    t.ok(!lastTransition);

    customFlow.set({'test' : 3});
    t.ok(!customFlow.inState('init'));
    t.ok(!customFlow.inState('next'));
    t.ok(customFlow.inState('last'));
    t.ok(nextTransition);
    t.ok(lastTransition);

    customFlow.set({'test' : 4});
    t.ok(!customFlow.inState('init'));
    t.ok(!customFlow.inState('next'));
    t.ok(!customFlow.inState('last'));
    t.ok(nextTransition);
    t.ok(lastTransition);

    t.end();
});


test("A ModelFlow can multiple active states" , function (t) {

    var stateChanges = {};
    var CustomFlow = ModelFlow.StateModel.extend({
        foo : 'bar', 
        cat : 'meow'
    });

    var customFlow = new CustomFlow;
    customFlow
        .createState('state1', { foo : 'hello' })
        .createState('state2', { cat : 'bark' })
        .bind("all", function(eventName) {
            if (eventName.indexOf("state:") === 0) stateChanges[eventName] = true;
        });

    t.ok(!customFlow.inState('state1'));
    t.ok(!customFlow.inState('state2'));

    customFlow.set({foo: 'hello'});
    t.ok(stateChanges['state:->state1']);
    t.equal(Object.keys(stateChanges).length, 1);
    t.ok(customFlow.inState('state1'));
    t.ok(!customFlow.inState('state2'));

    customFlow.set({cat: 'bark'});
    t.ok(stateChanges['state:->state2']);
    t.equal(Object.keys(stateChanges).length, 2);
    t.ok(customFlow.inState('state1'));
    t.ok(customFlow.inState('state2'));

    customFlow.set({foo: 'moo'});
    t.ok(stateChanges['state:state1->']);
    t.equal(Object.keys(stateChanges).length, 3);
    t.ok(!customFlow.inState('state1'));
    t.ok(customFlow.inState('state2'));

    t.end();
});


test("A ModelFlow uses multiple properties" , function (t) {

    var stateChanges = {};
    var CustomFlow = ModelFlow.StateModel.extend({
        foo : 'bar'
    });

    var customFlow = new CustomFlow;
    customFlow
        .createState('state1', { 
            foo : 'hello',
            bar : 'meow',
            test1 : 'test'
        });

    t.ok(!customFlow.inState('state1'));
    customFlow.set({foo : 'hello'});
    t.ok(!customFlow.inState('state1'));
    customFlow.set({bar : 'meow'});
    t.ok(!customFlow.inState('state1'));
    customFlow.set({test1 : 'test'});
    t.ok(customFlow.inState('state1'));

    t.end();
});



test("A ModelFlow should gate a state until the constraint is satisfied" , function (t) {

    var stateChanges = {};
    var CustomFlow = ModelFlow.StateModel.extend({
    });

    var customFlow = new CustomFlow;
    customFlow
        .createState('state1', { foo : 'bar'})
        .createState('state2', { beep : 'boop'})
        .addConstraint('state1->state2')
        .bind("all", function(eventName) {
            if (eventName.indexOf("state:") === 0) stateChanges[eventName] = true;
        });

    t.ok(!customFlow.inState('state1'));
    t.ok(!customFlow.inState('state2'));

    customFlow.set({foo : 'bar'});
    t.ok(customFlow.inState('state1'));
    t.ok(!customFlow.inState('state2'));
    t.equal(Object.keys(stateChanges).length, 1);

    customFlow.set({beep : 'boop'});
    t.ok(customFlow.inState('state1'));
    t.ok(!customFlow.inState('state2'));
    t.equal(Object.keys(stateChanges).length, 1);
    t.ok(stateChanges['state:->state1']);

    customFlow.set({foo : 'boo'});
    t.ok(stateChanges['state:state1->state2']);
    t.ok(stateChanges['state:state1->']);
    t.ok(stateChanges['state:->state2']);
    t.equal(Object.keys(stateChanges).length, 4);
    t.ok(!customFlow.inState('state1'));
    t.ok(customFlow.inState('state2'));

    t.end();
});


test("A ModelFlow should have the correct state on instantiation" , function (t) {

    var CustomFlow = ModelFlow.StateModel.extend({
        states : {
            state1 : { foo : 'bar' },
            state2 : { beep : 'boop' }
        },
        constraints : ['state1->state2']
    });

    var customFlow = new CustomFlow({
        foo : 'bar'
    });

    t.ok(customFlow.inState('state1'));
    t.ok(!customFlow.inState('state2'));

    customFlow.set({beep : 'boop'});
    t.ok(customFlow.inState('state1'));
    t.ok(!customFlow.inState('state2'));

    customFlow.set({foo : 'test'});
    t.ok(!customFlow.inState('state1'));
    t.ok(customFlow.inState('state2'));

    t.end();

});

test("setState will set model properties", function(t) {

    var flow = new ModelFlow.StateModel({
        foo : 'test'
    });

    flow
        .createState('init', { foo : 'bar'})
        .createState('next', { foo : 'boo', hello : 'world'});

    t.equal(flow.get('foo'), 'test');

    flow.setState('init');
    t.equal(flow.get('foo'), 'bar');
    t.equal(flow.get('hello'), undefined);

    flow.setState('next');
    t.equal(flow.get('foo'), 'boo');
    t.equal(flow.get('hello'), 'world');

    t.end();
    
});

//similar to last test, but now to test with contraints
test("setState will set model properties with contraints", function(t) {

    var flow = new ModelFlow.StateModel({
        foo : 'test'
    });

    flow
        .createState('init', { foo : 'bar'})
        .createState('next', { foo : 'boo', hello : 'world'})
        .addConstraint('init->next');

    //try to set it to next, ensure thing has changed
    flow.setState('next');
    t.equal(flow.get('foo'), 'test');
    t.equal(flow.get('hello'), undefined);

    //ok, now set it to init
    flow.setState('init');
    t.equal(flow.get('foo'), 'bar');
    t.equal(flow.get('hello'), undefined);

    flow.setState('next');
    t.equal(flow.get('foo'), 'boo');
    t.equal(flow.get('hello'), 'world');


    t.end();
    
});




