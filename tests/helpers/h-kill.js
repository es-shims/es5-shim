// This methods allows the killing of built-in functions,
// so the shim can take over with that implementation
var HLP = (function() {
    "use strict";
    var kill;
    
    kill = function(_class, methods) {
        /*if(!Array.isArray(methods))
            return;*/
        if(!_class.originals)
            _class.originals = {};
        methods.forEach(function(obj) {
            _class.originals[obj] = _class[obj];
            _class[obj] = undefined;
        });
    };
    return { kill: kill };
}());

HLP.kill(Function.prototype, [
    'bind'
]);

HLP.kill(Array.prototype, [
    'forEach', 'some', 'every', 
    'indexOf', 'lastIndexOf', 
    'map', 'filter', 
    'reduce', 'reduceRight'
]);

HLP.kill(Array, [
    'isArray'
]);